import express from 'express';
import {
  getDashboardStats,
  getUpcomingServices,
  getRecentBookings
} from '../controllers/dashboard';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/stats', protect, authorize('customer'), getDashboardStats);
router.get('/upcoming-services', protect, authorize('customer'), getUpcomingServices);
router.get('/recent-bookings', protect, authorize('customer'), getRecentBookings);

export { router };
