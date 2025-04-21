import express from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviews';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(protect, authorize('customer'), createReview);

router.route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export { router };
