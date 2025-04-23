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
import { protect } from '../middleware/auth';
import { checkAccess } from '../middleware/accessControl';

const router = express.Router();

router.route('/')
  .get(getServices) // Public access - no middleware
  .post(protect, checkAccess('service', 'createOwn'), createService);

// Define specific routes before parameterized routes
router.route('/me')
  .get(protect, checkAccess('service', 'readOwn'), getUserServices);

router.route('/provider/:providerId')
  .get(getProviderServices); // Public access - no middleware

// Parameterized routes should come after specific routes
router.route('/:id/status')
  .patch(protect, checkAccess('service', 'updateOwn', 'id'), updateServiceStatus);

router.route('/:id')
  .get(getService) // Public access - no middleware
  .put(protect, checkAccess('service', 'updateOwn', 'id'), updateService)
  .delete(protect, checkAccess('service', 'deleteOwn', 'id'), deleteService);

export { router };
