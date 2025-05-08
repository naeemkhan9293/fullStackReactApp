import express from 'express';
import {
  getSubscriptionPlans,
  getUserSubscription,
  getAllUserSubscriptions,
  activateSubscription,
  createCheckoutSession,
  handleWebhook,
  cancelSubscription,
  resumeSubscription,
  getCreditHistory,
  purchaseCredits,
  debugAllSubscriptions,
  createTestSubscription,
  syncSubscriptions,
} from '../controllers/subscription';
import { protect } from '../middleware/auth';
import { checkAccess } from '../middleware/accessControl';

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);
router.post('/webhook', handleWebhook);

// Protected routes
router.get('/', protect, getUserSubscription);
router.get('/all', protect, getAllUserSubscriptions);
router.post('/activate/:id', protect, activateSubscription);
router.post('/checkout', protect, createCheckoutSession);
router.post('/cancel', protect, cancelSubscription);
router.post('/resume', protect, resumeSubscription);
router.get('/credits/history', protect, getCreditHistory);
router.get('/debug', protect, debugAllSubscriptions);
router.post('/debug/create', protect, createTestSubscription);
router.post('/credits/purchase', protect, purchaseCredits);
router.post('/sync', protect, syncSubscriptions);

export { router };
