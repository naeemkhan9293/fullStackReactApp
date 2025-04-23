import express from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviews';
import { protect } from '../middleware/auth';
import { checkAccess } from '../middleware/accessControl';

const router = express.Router();

router.route('/')
  .get(checkAccess('review', 'readAny'), getReviews)
  .post(protect, checkAccess('review', 'createOwn'), createReview);

router.route('/:id')
  .get(checkAccess('review', 'readAny'), getReview)
  .put(protect, checkAccess('review', 'updateOwn', 'id'), updateReview)
  .delete(protect, checkAccess('review', 'deleteOwn', 'id'), deleteReview);

export { router };
