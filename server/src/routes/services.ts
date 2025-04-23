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
  .get(checkAccess('service', 'readAny'), getServices)
  .post(protect, checkAccess('service', 'createOwn'), createService);

// Define specific routes before parameterized routes
router.route('/me')
  .get(protect, checkAccess('service', 'readOwn'), getUserServices);

router.route('/provider/:providerId')
  .get(checkAccess('service', 'readAny'), getProviderServices);

// Parameterized routes should come after specific routes
router.route('/:id/status')
  .patch(protect, checkAccess('service', 'updateOwn', 'id'), updateServiceStatus);

router.route('/:id')
  .get(checkAccess('service', 'readAny'), getService)
  .put(protect, checkAccess('service', 'updateOwn', 'id'), updateService)
  .delete(protect, checkAccess('service', 'deleteOwn', 'id'), deleteService);

export { router };
