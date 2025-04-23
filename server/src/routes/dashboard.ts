import express from 'express';
import {
  getDashboardStats,
  getUpcomingServices,
  getRecentBookings
} from '../controllers/dashboard';
import {
  getProviderDashboardStats,
  getProviderRecentActivity,
  getProviderPopularServices
} from '../controllers/providerDashboard';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Customer dashboard routes
router.get('/stats', protect, authorize('customer'), getDashboardStats);
router.get('/upcoming-services', protect, authorize('customer'), getUpcomingServices);
router.get('/recent-bookings', protect, authorize('customer'), getRecentBookings);

// Provider dashboard routes
router.get('/provider/stats', protect, authorize('provider', 'admin'), getProviderDashboardStats);
router.get('/provider/recent-activity', protect, authorize('provider', 'admin'), getProviderRecentActivity);
router.get('/provider/popular-services', protect, authorize('provider', 'admin'), getProviderPopularServices);

export { router };
