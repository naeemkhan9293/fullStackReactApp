import express from 'express';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getMyBookings,
} from '../controllers/bookings';
import { protect } from '../middleware/auth';
import { checkAccess } from '../middleware/accessControl';

const router = express.Router();

router.route('/')
  .get(protect, checkAccess('booking', 'readAny'), getBookings)
  .post(protect, checkAccess('booking', 'createOwn'), createBooking);

router.route('/me')
  .get(protect, checkAccess('booking', 'readOwn'), getMyBookings);

router.route('/:id')
  .get(protect, checkAccess('booking', 'readOwn', 'id'), getBooking)
  .put(protect, checkAccess('booking', 'updateOwn', 'id'), updateBookingStatus)
  .delete(protect, checkAccess('booking', 'deleteAny', 'id'), deleteBooking);

export { router };
