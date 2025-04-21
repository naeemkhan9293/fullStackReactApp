import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Service from '../models/Service';
import Booking from '../models/Booking';

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query;

    // Check if there's a serviceId query param
    if (req.query.service) {
      query = Review.find({ service: req.query.service }).populate({
        path: 'user',
        select: 'name avatar',
      });
    } else {
      query = Review.find().populate({
        path: 'user',
        select: 'name avatar',
      }).populate({
        path: 'service',
        select: 'name category',
      });
    }

    const reviews = await query;

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: 'user',
      select: 'name avatar',
    }).populate({
      path: 'service',
      select: 'name category',
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Customer only)
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is a customer
    if (req.user?.role !== 'customer') {
      return res.status(403).json({
        success: false,
        error: 'Only customers can create reviews',
      });
    }

    // Add user to req.body
    req.body.user = req.user.id;

    // Check if service exists
    const service = await Service.findById(req.body.service);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    // Check if user has booked and completed this service
    const booking = await Booking.findOne({
      customer: req.user.id,
      service: req.body.service,
      status: 'completed',
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        error: 'You can only review services you have booked and completed',
      });
    }

    // Check if user already reviewed this service
    const existingReview = await Review.findOne({
      user: req.user.id,
      service: req.body.service,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this service',
      });
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this review',
      });
    }

    // Only allow rating and comment to be updated
    const { rating, comment } = req.body;
    const updateData = { rating, comment };

    review = await Review.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or Admin)
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this review',
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
