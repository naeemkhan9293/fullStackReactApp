import express from 'express';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getMyBookings,
} from '../controllers/bookings';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getBookings)
  .post(protect, authorize('customer'), createBooking);

router.route('/me')
  .get(protect, getMyBookings);

router.route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBookingStatus)
  .delete(protect, authorize('admin'), deleteBooking);

export { router };
