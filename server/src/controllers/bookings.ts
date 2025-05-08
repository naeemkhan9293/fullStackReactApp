import { Request, Response, NextFunction } from "express";
import Booking from "../models/Booking";
import Service from "../models/Service";
import User from "../models/User";
import { deductCredits, hasEnoughCredits } from "../utils/creditTransaction";

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin only)
export const getBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let query;

    // If user is admin, get all bookings
    if (req.user?.role === "admin") {
      query = Booking.find()
        .populate({
          path: "service",
          select: "name category",
        })
        .populate({
          path: "customer",
          select: "name email",
        })
        .populate({
          path: "provider",
          select: "name email",
        });
    } else {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access all bookings",
      });
    }

    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings for current user (customer or provider)
// @route   GET /api/bookings/me
// @access  Private
export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let query;

    if (req.user?.role === "customer") {
      query = Booking.find({ customer: req.user.id })
        .populate({
          path: "service",
          select: "name category",
        })
        .populate({
          path: "provider",
          select: "name email phone",
        });
    } else if (req.user?.role === "provider") {
      query = Booking.find({ provider: req.user.id })
        .populate({
          path: "service",
          select: "name category",
        })
        .populate({
          path: "customer",
          select: "name email phone",
        });
    } else {
      return res.status(403).json({
        success: false,
        error: "Invalid user role",
      });
    }

    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "service",
        select: "name category description",
      })
      .populate({
        path: "customer",
        select: "name email phone",
      })
      .populate({
        path: "provider",
        select: "name email phone",
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Make sure user is booking owner or provider
    // When fields are populated, we need to access the _id property
    const customerId =
      typeof booking.customer === "object" && booking.customer?._id
        ? booking.customer._id.toString()
        : booking.customer
        ? booking.customer.toString()
        : "";

    const providerId =
      typeof booking.provider === "object" && booking.provider?._id
        ? booking.provider._id.toString()
        : booking.provider
        ? booking.provider.toString()
        : "";

    // Check if the current user is either the customer, provider, or admin
    const isCustomer = customerId === req.user?.id;
    const isProvider = providerId === req.user?.id;
    const isAdmin = req.user?.role === "admin";

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(401).json({
        success: false,
        error:
          "Not authorized to access this booking. It may belong to another user.",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private (Customer only)
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is a customer
    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can create bookings",
      });
    }

    // Add customer to req.body
    req.body.customer = req.user.id;

    // Get service to check if it exists and get provider ID
    const service = await Service.findById(req.body.service);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    // Add provider to req.body
    req.body.provider = service.provider;

    // Create the booking with unpaid payment status
    const booking = await Booking.create({
      ...req.body,
      paymentStatus: 'unpaid'
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Customer, Provider, or Admin)
export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let booking = await Booking.findById(req.params.id).populate('paymentId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Check permissions based on the status change
    const { status } = req.body;

    // Customers can only cancel their own bookings
    if (req.user?.role === "customer") {
      if (booking.customer.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: "Not authorized to update this booking",
        });
      }

      if (status !== "cancelled") {
        return res.status(403).json({
          success: false,
          error: "Customers can only cancel bookings",
        });
      }

      // Check if payment has been made
      if (booking.paymentStatus === 'paid' && status === 'cancelled') {
        return res.status(400).json({
          success: false,
          error: "Cannot cancel a booking that has been paid. Please contact support.",
        });
      }
    }

    // Providers can confirm, complete, or cancel bookings for their services
    if (req.user?.role === "provider") {
      if (booking.provider.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: "Not authorized to update this booking",
        });
      }

      if (!["confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(403).json({
          success: false,
          error: "Providers can only confirm, complete, or cancel bookings",
        });
      }

      // Check if payment has been made before allowing completion
      if (status === 'completed' && booking.paymentStatus !== 'paid') {
        return res.status(400).json({
          success: false,
          error: "Cannot mark as completed until customer has paid",
        });
      }
    }

    // Update booking
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    // If booking is marked as completed, release payment to provider
    if (status === 'completed' && booking && booking.paymentStatus === 'paid') {
      // Import the Payment model and releasePayment function
      const Payment = require('../models/Payment').default;
      const Wallet = require('../models/Wallet').default;
      const Transaction = require('../models/Transaction').default;

      if (booking.paymentId) {
        const payment = await Payment.findById(booking.paymentId);

        if (payment && payment.status === 'held') {
          // Find or create provider wallet
          let wallet = await Wallet.findOne({ user: payment.provider });

          if (!wallet) {
            wallet = await Wallet.create({
              user: payment.provider,
              balance: 0,
              isActive: true,
            });
          }

          // Update wallet balance
          wallet.balance += payment.amount;
          await wallet.save();

          // Create transaction record
          await Transaction.create({
            wallet: wallet._id,
            user: payment.provider,
            amount: payment.amount,
            type: 'service_payment',
            status: 'completed',
            booking: booking._id,
            description: `Payment for booking #${booking._id}`,
          });

          // Update payment status
          payment.status = 'released';
          payment.releaseDate = new Date();
          await payment.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin only)
export const deleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Only admin can delete bookings
    if (req.user?.role !== "admin") {
      return res.status(401).json({
        success: false,
        error: "Not authorized to delete bookings",
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
