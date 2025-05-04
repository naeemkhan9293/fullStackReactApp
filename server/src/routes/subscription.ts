import express from 'express';
import {
  getSubscriptionPlans,
  getUserSubscription,
  createCheckoutSession,
  handleWebhook,
  cancelSubscription,
  resumeSubscription,
  getCreditHistory,
} from '../controllers/subscription';
import { protect } from '../middleware/auth';
import { checkAccess } from '../middleware/accessControl';

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);
router.post('/webhook', handleWebhook);

// Protected routes
router.get('/', protect, getUserSubscription);
router.post('/checkout', protect, createCheckoutSession);
router.post('/cancel', protect, cancelSubscription);
router.post('/resume', protect, resumeSubscription);
router.get('/credits/history', protect, getCreditHistory);

export { router };
