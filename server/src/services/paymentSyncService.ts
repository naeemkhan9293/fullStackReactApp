import { logger } from '../config/logger';
import Payment from '../models/Payment';
import Booking, { IBooking } from '../models/Booking';
import stripe from '../config/stripe';

/**
 * Payment Synchronization Service
 *
 * This service is responsible for synchronizing payment statuses with Stripe
 * when webhooks fail or other payment issues occur.
 */

interface SyncResult {
  paymentId: string;
  bookingId: string;
  previousStatus: string;
  newStatus: string;
  stripeStatus: string;
  success: boolean;
  error?: string;
}

/**
 * Find payments that have been in "processing" status for too long
 * @param hoursThreshold Number of hours a payment can be in processing status before being checked
 * @returns Array of payments that need to be checked
 */
export const findStaleProcessingPayments = async (hoursThreshold: number = 12): Promise<any[]> => {
  try {
    // Calculate the cutoff time (current time - threshold hours)
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursThreshold);

    logger.info(`Finding payments in processing status older than ${hoursThreshold} hours (before ${cutoffTime.toISOString()})`);

    // Find payments that are still in processing status and older than the threshold
    const stalePayments = await Payment.find({
      status: 'processing',
      updatedAt: { $lt: cutoffTime }
    }).populate('booking');

    logger.info(`Found ${stalePayments.length} stale processing payments`);
    return stalePayments;
  } catch (error: any) {
    logger.error(`Error finding stale processing payments: ${error.message}`, error);
    return [];
  }
};

/**
 * Check the status of a payment with Stripe
 * @param stripePaymentIntentId The Stripe payment intent ID
 * @returns The current status from Stripe
 */
export const checkStripePaymentStatus = async (stripePaymentIntentId: string): Promise<string> => {
  try {
    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);

    logger.debug(`Stripe payment intent ${stripePaymentIntentId} status: ${paymentIntent.status}`);

    // Map Stripe status to our application status
    switch (paymentIntent.status) {
      case 'succeeded':
        return 'held';
      case 'processing':
        return 'processing';
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'requires_capture':
        return 'pending';
      case 'canceled':
        return 'failed';
      default:
        return 'failed';
    }
  } catch (error: any) {
    logger.error(`Error checking Stripe payment status for ${stripePaymentIntentId}: ${error.message}`, error);
    // If we can't check with Stripe, assume failed after this long
    return 'failed';
  }
};

/**
 * Update a payment and its associated booking with the correct status
 * @param payment The payment document to update
 * @param newStatus The new status to set
 * @returns Result of the update operation
 */
export const updatePaymentStatus = async (payment: any, newStatus: string): Promise<SyncResult> => {
  const result: SyncResult = {
    paymentId: payment._id.toString(),
    bookingId: payment.booking?._id?.toString() || 'unknown',
    previousStatus: payment.status,
    newStatus: newStatus,
    stripeStatus: 'unknown',
    success: false
  };

  try {
    // Get the current status from Stripe
    const stripeStatus = await checkStripePaymentStatus(payment.stripePaymentIntentId);
    result.stripeStatus = stripeStatus;

    // Only update if the status from Stripe is different
    if (payment.status !== stripeStatus) {
      // Update the payment status
      payment.status = stripeStatus;
      await payment.save();

      // Update the booking payment status
      if (payment.booking) {
        const booking = await Booking.findById(payment.booking._id);
        if (booking) {
          // Map payment status to booking payment status
          let bookingPaymentStatus: 'unpaid' | 'processing' | 'paid' | 'refunded' | 'failed';
          switch (stripeStatus) {
            case 'held':
              bookingPaymentStatus = 'paid';
              break;
            case 'processing':
              bookingPaymentStatus = 'processing';
              break;
            case 'pending':
              bookingPaymentStatus = 'unpaid';
              break;
            case 'failed':
              bookingPaymentStatus = 'failed';
              break;
            default:
              bookingPaymentStatus = 'failed';
          }

          booking.paymentStatus = bookingPaymentStatus;
          await booking.save();

          logger.info(`Updated booking ${booking._id} payment status to ${bookingPaymentStatus}`);
        }
      }

      result.newStatus = stripeStatus;
      result.success = true;
      logger.info(`Successfully updated payment ${payment._id} status from ${payment.status} to ${stripeStatus}`);
    } else {
      result.success = true;
      result.newStatus = payment.status;
      logger.info(`Payment ${payment._id} status is already ${payment.status}, no update needed`);
    }

    return result;
  } catch (error: any) {
    logger.error(`Error updating payment ${payment._id} status: ${error.message}`, error);
    result.error = error.message;
    return result;
  }
};

/**
 * Synchronize all stale processing payments with Stripe
 * @param hoursThreshold Number of hours a payment can be in processing status before being checked
 * @returns Results of the synchronization
 */
export const synchronizePayments = async (hoursThreshold: number = 12): Promise<SyncResult[]> => {
  const results: SyncResult[] = [];

  try {
    logger.info(`Starting payment synchronization (threshold: ${hoursThreshold} hours)`);

    // Find stale processing payments
    const stalePayments = await findStaleProcessingPayments(hoursThreshold);

    if (stalePayments.length === 0) {
      logger.info('No stale processing payments found, synchronization complete');
      return results;
    }

    // Process each payment
    for (const payment of stalePayments) {
      const result = await updatePaymentStatus(payment, 'processing');
      results.push(result);
    }

    // Log summary
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    logger.info(`Payment synchronization complete. Results: ${successful} successful, ${failed} failed`);

    return results;
  } catch (error: any) {
    logger.error(`Error during payment synchronization: ${error.message}`, error);
    return results;
  }
};
