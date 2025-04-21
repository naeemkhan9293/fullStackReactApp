import express from 'express';
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getProviderServices,
  getUserServices,
  updateServiceStatus,
} from '../controllers/services';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorize('provider', 'admin'), createService);

// Define specific routes before parameterized routes
router.route('/me')
  .get(protect, authorize('provider', 'admin'), getUserServices);

router.route('/provider/:providerId')
  .get(getProviderServices);

// Parameterized routes should come after specific routes
router.route('/:id/status')
  .patch(protect, authorize('provider', 'admin'), updateServiceStatus);

router.route('/:id')
  .get(getService)
  .put(protect, authorize('provider', 'admin'), updateService)
  .delete(protect, authorize('provider', 'admin'), deleteService);

export { router };
