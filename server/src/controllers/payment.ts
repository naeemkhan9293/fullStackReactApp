import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Payment from "../models/Payment";
import Booking from "../models/Booking";
import Service from "../models/Service";
import User from "../models/User";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";
import stripe from "../config/stripe";
import { runPaymentSyncManually } from "../services/scheduledTasks";

// @desc    Create payment intent for booking
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Verify the booking belongs to the current user
    if (booking.customer.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to make payment for this booking",
      });
    }

    // Check if payment already exists
    if (booking.paymentStatus !== 'unpaid') {
      return res.status(400).json({
        success: false,
        error: "Payment already processed for this booking",
      });
    }

    // Get service details
    const service = await Service.findById(booking.service);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    // Get customer from database
    const customer = await User.findById(req.user?.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    // Create or retrieve Stripe customer
    let stripeCustomer;
    if (customer.stripeCustomerId) {
      stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomerId);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.name,
        metadata: {
          userId: customer.id,
        },
      });

      // Update user with Stripe customer ID
      customer.stripeCustomerId = stripeCustomer.id;
      await customer.save();
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.price * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomer.id,
      metadata: {
        bookingId: booking.id,
        serviceId: service.id,
        customerId: customer.id,
        providerId: service.provider.toString(),
      },
      description: `Payment for ${service.name} - ${booking.serviceOption}`,
    });

    // Create payment record
    const payment = await Payment.create({
      booking: booking._id,
      customer: customer._id,
      provider: service.provider,
      amount: booking.price,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
    });

    // Update booking with payment ID and status
    booking.paymentId = payment._id as unknown as mongoose.Types.ObjectId;
    booking.paymentStatus = 'processing';
    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Handle webhook events from Stripe
// @route   POST /api/payments/webhook
// @access  Public
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      endpointSecret || ''
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
};

// Helper function to handle payment intent succeeded
const handlePaymentIntentSucceeded = async (paymentIntent: any) => {
  try {
    const bookingId = paymentIntent.metadata.bookingId;

    if (!bookingId) {
      console.error('No booking ID in payment intent metadata');
      return;
    }

    // Find the payment
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!payment) {
      console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status
    payment.status = 'held';
    await payment.save();

    // Update booking payment status
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    booking.paymentStatus = 'paid';
    await booking.save();

    console.log(`Payment successful for booking: ${bookingId}`);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
};

// Helper function to handle payment intent failed
const handlePaymentIntentFailed = async (paymentIntent: any) => {
  try {
    const bookingId = paymentIntent.metadata.bookingId;

    if (!bookingId) {
      console.error('No booking ID in payment intent metadata');
      return;
    }

    // Find the payment
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!payment) {
      console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status
    payment.status = 'failed';
    await payment.save();

    // Update booking payment status
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    booking.paymentStatus = 'failed';
    await booking.save();

    console.log(`Payment failed for booking: ${bookingId}`);
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
};

// @desc    Release payment to provider after service completion
// @route   POST /api/payments/release
// @access  Private (Admin only)
export const releasePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId).populate('paymentId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: "Cannot release payment for incomplete service",
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        error: "No payment to release",
      });
    }

    const payment = await Payment.findById(booking.paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    if (payment.status !== 'held') {
      return res.status(400).json({
        success: false,
        error: "Payment is not in held status",
      });
    }

    // Find or create provider wallet
    let wallet = await Wallet.findOne({ user: payment.provider });

    if (!wallet) {
      wallet = await Wallet.create({
        user: payment.provider,
        balance: 0,
        isActive: true,
      });
    }

    // Update wallet balance
    wallet.balance += payment.amount;
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      wallet: wallet._id,
      user: payment.provider,
      amount: payment.amount,
      type: 'service_payment',
      status: 'completed',
      booking: booking._id,
      description: `Payment for booking #${booking._id}`,
    });

    // Update payment status
    payment.status = 'released';
    payment.releaseDate = new Date();
    await payment.save();

    res.status(200).json({
      success: true,
      data: {
        payment,
        wallet,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Manually synchronize payment statuses with Stripe
// @route   POST /api/payments/sync
// @access  Private (Admin only)
export const syncPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Run the payment sync task manually
    const result = await runPaymentSyncManually();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err: any) {
    next(err);
  }
};
