import { Request, Response, NextFunction } from "express";
import Booking from "../models/Booking";
import Service from "../models/Service";
import SavedService from "../models/SavedService";
import User from "../models/User";
import { PopulatedBooking } from "../types/mongoose";
import { Document } from "mongoose";

// @desc    Get dashboard stats for customer
// @route   GET /api/dashboard/stats
// @access  Private (Customer only)
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is a customer
    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can access this resource",
      });
    }

    // Get counts of bookings by status
    const activeBookingsCount = await Booking.countDocuments({
      customer: req.user.id,
      status: { $in: ["pending", "confirmed"] },
    });

    const upcomingServicesCount = await Booking.countDocuments({
      customer: req.user.id,
      status: "confirmed",
      date: { $gte: new Date() },
    });

    const completedServicesCount = await Booking.countDocuments({
      customer: req.user.id,
      status: "completed",
    });

    // Get count of saved services
    const savedServicesCount = await SavedService.countDocuments({
      user: req.user.id,
    });

    // Get user credits and subscription info
    const user = await User.findById(req.user.id);
    const credits = user ? user.credits : 0;
    const subscriptionType = user ? user.subscriptionType : 'none';
    const subscriptionStatus = user ? user.subscriptionStatus : 'none';

    res.status(200).json({
      success: true,
      data: {
        activeBookings: activeBookingsCount,
        upcomingServices: upcomingServicesCount,
        completedServices: completedServicesCount,
        savedServices: savedServicesCount,
        credits,
        subscriptionType,
        subscriptionStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get upcoming services for customer
// @route   GET /api/dashboard/upcoming-services
// @access  Private (Customer only)
export const getUpcomingServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is a customer
    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can access this resource",
      });
    }

    // Get upcoming bookings
    const upcomingBookings = await Booking.find({
      customer: req.user.id,
      status: { $in: ["pending", "confirmed"] },
      date: { $gte: new Date() },
    })
      .sort({ date: 1 })
      .limit(5)
      .populate({
        path: "service",
        select: "name category",
      })
      .populate({
        path: "provider",
        select: "name",
      });

    // Format the response
    const formattedBookings = upcomingBookings.map((booking) => {
      // Cast the booking to the populated type
      const populatedBooking = booking as unknown as PopulatedBooking;

      // Get service name
      let serviceName = "Service";
      if (populatedBooking.service && typeof populatedBooking.service === "object" && 'name' in populatedBooking.service) {
        serviceName = populatedBooking.service.name;
      }

      // Get provider name
      let providerName = "Provider";
      if (populatedBooking.provider && typeof populatedBooking.provider === "object" && 'name' in populatedBooking.provider) {
        providerName = populatedBooking.provider.name;
      }

      return {
        _id: booking._id,
        serviceName,
        providerName,
        date: booking.date,
        time: booking.timeSlot,
        status: booking.status,
        price: booking.price,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedBookings.length,
      data: formattedBookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recent bookings for customer
// @route   GET /api/dashboard/recent-bookings
// @access  Private (Customer only)
export const getRecentBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is a customer
    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can access this resource",
      });
    }

    // Get recent bookings
    const recentBookings = await Booking.find({
      customer: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "service",
        select: "name category",
      })
      .populate({
        path: "provider",
        select: "name",
      });

    // Format the response
    const formattedBookings = recentBookings.map((booking) => {
      // Cast the booking to the populated type
      const populatedBooking = booking as unknown as PopulatedBooking;

      // Get service name
      let serviceName = "Service";
      if (populatedBooking.service && typeof populatedBooking.service === "object" && 'name' in populatedBooking.service) {
        serviceName = populatedBooking.service.name;
      }

      // Get provider name
      let providerName = "Provider";
      if (populatedBooking.provider && typeof populatedBooking.provider === "object" && 'name' in populatedBooking.provider) {
        providerName = populatedBooking.provider.name;
      }

      return {
        _id: booking._id,
        serviceName,
        providerName,
        date: booking.date,
        time: booking.timeSlot,
        status: booking.status,
        price: booking.price,
        createdAt: booking.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedBookings.length,
      data: formattedBookings,
    });
  } catch (err) {
    next(err);
  }
};
