import { Request, Response, NextFunction } from "express";
import Booking from "../models/Booking";
import Service from "../models/Service";
import Review from "../models/Review";
import { Document, Types } from "mongoose";
import { IService } from "../models/Service";

// @desc    Get dashboard stats for provider
// @route   GET /api/dashboard/provider/stats
// @access  Private (Provider only)
export const getProviderDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is a provider
    if (req.user?.role !== "provider" && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only providers can access this resource",
      });
    }

    // Get count of services offered by the provider
    const servicesOfferedCount = await Service.countDocuments({
      provider: req.user.id,
    });

    // Get count of active bookings
    const activeBookingsCount = await Booking.countDocuments({
      provider: req.user.id,
      status: { $in: ["pending", "confirmed"] },
    });

    // Get count of pending requests
    const pendingRequestsCount = await Booking.countDocuments({
      provider: req.user.id,
      status: "pending",
    });

    // Calculate total earnings (sum of all completed bookings)
    const earnings = await Booking.aggregate([
      {
        $match: {
          provider: req.user.id,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
        },
      },
    ]);

    const totalEarnings = earnings.length > 0 ? earnings[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        servicesOffered: servicesOfferedCount,
        activeBookings: activeBookingsCount,
        pendingRequests: pendingRequestsCount,
        totalEarnings: totalEarnings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recent activity for provider
// @route   GET /api/dashboard/provider/recent-activity
// @access  Private (Provider only)
export const getProviderRecentActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is a provider
    if (req.user?.role !== "provider" && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only providers can access this resource",
      });
    }

    // Get recent bookings
    const recentBookings = await Booking.find({
      provider: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "service",
        select: "name",
      });

    // Get recent reviews
    const recentReviews = await Review.find({
      service: { $in: await Service.find({ provider: req.user.id }).distinct('_id') }
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({
        path: "service",
        select: "name",
      });

    // Format the response
    const formattedActivity = [
      ...recentBookings.map((booking) => {
        // Get service name safely
        let serviceName = "Service";
        if (booking.service && typeof booking.service === "object" && 'name' in booking.service) {
          serviceName = booking.service.name as string;
        }

        return {
          id: booking._id,
          type: booking.status === "completed" ? "completed" : "booking",
          service: serviceName,
          amount: booking.price,
          date: booking.createdAt,
        };
      }),
      ...recentReviews.map((review) => {
        // Get service name safely
        let serviceName = "Service";
        if (review.service && typeof review.service === "object" && 'name' in review.service) {
          serviceName = review.service.name as string;
        }

        return {
          id: review._id,
          type: "review",
          service: serviceName,
          rating: review.rating,
          date: review.createdAt,
        };
      }),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

    res.status(200).json({
      success: true,
      count: formattedActivity.length,
      data: formattedActivity,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get popular services for provider
// @route   GET /api/dashboard/provider/popular-services
// @access  Private (Provider only)
export const getProviderPopularServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is a provider
    if (req.user?.role !== "provider" && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only providers can access this resource",
      });
    }

    // Get popular services based on bookings count
    const popularServices = await Service.find({})
      .sort({ bookings: -1, rating: -1 })
      .limit(3)
      .select("name category basePrice rating");

    // Format the response
    const formattedServices = popularServices.map((service) => ({
      id: service._id,
      name: service.name,
      category: service.category,
      price: service.basePrice,
      rating: service.rating,
    }));

    res.status(200).json({
      success: true,
      count: formattedServices.length,
      data: formattedServices,
    });
  } catch (err) {
    next(err);
  }
};
