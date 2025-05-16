import cron from 'node-cron';
import { logger } from '../config/logger';
import { synchronizePayments } from './paymentSyncService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default values if not specified in environment variables
const DEFAULT_PAYMENT_SYNC_SCHEDULE = '0 */4 * * *'; // Every 4 hours
const DEFAULT_PAYMENT_SYNC_THRESHOLD = 12; // 12 hours

// Get configuration from environment variables
const paymentSyncSchedule = process.env.PAYMENT_SYNC_SCHEDULE || DEFAULT_PAYMENT_SYNC_SCHEDULE;
const paymentSyncThreshold = parseInt(process.env.PAYMENT_SYNC_THRESHOLD || DEFAULT_PAYMENT_SYNC_THRESHOLD.toString(), 10);

/**
 * Task to synchronize payment statuses with Stripe
 */
const paymentSyncTask = async () => {
  try {
    logger.info('Running scheduled payment synchronization task');
    const results = await synchronizePayments(paymentSyncThreshold);
    
    // Log detailed results
    if (results.length > 0) {
      const statusChanges = results.filter(r => r.previousStatus !== r.newStatus);
      if (statusChanges.length > 0) {
        logger.info(`Payment status changes: ${statusChanges.length} payments updated`);
        statusChanges.forEach(change => {
          logger.info(`Payment ${change.paymentId} (Booking ${change.bookingId}): ${change.previousStatus} -> ${change.newStatus}`);
        });
      } else {
        logger.info('No payment status changes needed');
      }
    }
  } catch (error: any) {
    logger.error(`Error in payment sync task: ${error.message}`, error);
  }
};

/**
 * Initialize all scheduled tasks
 */
export const initScheduledTasks = () => {
  try {
    // Validate cron expression
    if (!cron.validate(paymentSyncSchedule)) {
      logger.error(`Invalid cron expression for payment sync: ${paymentSyncSchedule}, using default: ${DEFAULT_PAYMENT_SYNC_SCHEDULE}`);
      cron.schedule(DEFAULT_PAYMENT_SYNC_SCHEDULE, paymentSyncTask);
    } else {
      // Schedule payment sync task
      cron.schedule(paymentSyncSchedule, paymentSyncTask);
      logger.info(`Scheduled payment synchronization task: ${paymentSyncSchedule} (threshold: ${paymentSyncThreshold} hours)`);
    }
    
    // Run immediately on startup to catch any issues
    logger.info('Running initial payment synchronization on startup');
    paymentSyncTask();
    
    logger.info('All scheduled tasks initialized successfully');
  } catch (error: any) {
    logger.error(`Error initializing scheduled tasks: ${error.message}`, error);
  }
};

/**
 * Run the payment sync task manually (for testing or admin-triggered sync)
 */
export const runPaymentSyncManually = async (): Promise<any> => {
  try {
    logger.info('Manually running payment synchronization task');
    const results = await synchronizePayments(paymentSyncThreshold);
    return {
      success: true,
      processed: results.length,
      updated: results.filter(r => r.previousStatus !== r.newStatus).length,
      results
    };
  } catch (error: any) {
    logger.error(`Error in manual payment sync: ${error.message}`, error);
    return {
      success: false,
      error: error.message
    };
  }
};
