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
import { protect } from '../middleware/auth';
import { checkAccess } from '../middleware/accessControl';

const router = express.Router();

// Customer dashboard routes
router.get('/stats', protect, checkAccess('customerDashboard', 'readOwn'), getDashboardStats);
router.get('/upcoming-services', protect, checkAccess('customerDashboard', 'readOwn'), getUpcomingServices);
router.get('/recent-bookings', protect, checkAccess('customerDashboard', 'readOwn'), getRecentBookings);

// Provider dashboard routes
router.get('/provider/stats', protect, checkAccess('providerDashboard', 'readOwn'), getProviderDashboardStats);
router.get('/provider/recent-activity', protect, checkAccess('providerDashboard', 'readOwn'), getProviderRecentActivity);
router.get('/provider/popular-services', protect, checkAccess('providerDashboard', 'readOwn'), getProviderPopularServices);

export { router };
