import express from 'express';
import {
  createPaymentIntent,
  handleWebhook,
  releasePayment,
  syncPayments,
} from '../controllers/payment';
import { protect } from '../middleware/auth';
import { checkAccess } from '../middleware/accessControl';

const router = express.Router();

// Public routes
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/create-intent', protect, checkAccess('payment', 'createOwn'), createPaymentIntent);
router.post('/release', protect, checkAccess('payment', 'updateAny'), releasePayment);
router.post('/sync', protect, checkAccess('payment', 'updateAny'), syncPayments);

export { router };
