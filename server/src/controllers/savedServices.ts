import { Request, Response, NextFunction } from "express";
import SavedService from "../models/SavedService";
import Service from "../models/Service";
import { PopulatedSavedService, PopulatedService } from "../types/mongoose";
import { Document, Types } from "mongoose";

// @desc    Get all saved services for a user
// @route   GET /api/saved-services
// @access  Private
export const getSavedServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find all saved services for the user
    const savedServices = await SavedService.find({
      user: req.user?.id,
    })
      .populate({
        path: "service",
        select: "name provider category description basePrice rating images",
        populate: {
          path: "provider",
          select: "name",
        },
      });

    // Format the response
    const formattedServices = savedServices.map((savedService) => {
      // Cast to populated type
      const populatedSavedService = savedService as unknown as PopulatedSavedService;

      // Get service data and ensure it's a populated service object, not just an ID
      const serviceData = populatedSavedService.service;

      // Check if service is populated (an object, not just an ID)
      if (!serviceData || typeof serviceData !== 'object' || !('name' in serviceData)) {
        // Skip this item if service is not properly populated
        return null;
      }

      // Now we know serviceData is a PopulatedService
      const service = serviceData as PopulatedService;

      // Get provider name
      let providerName = "Provider";
      if (
        service.provider &&
        typeof service.provider === "object" &&
        'name' in service.provider
      ) {
        providerName = service.provider.name as string;
      }

      return {
        _id: savedService._id,
        serviceId: service._id,
        name: service.name,
        providerName,
        category: service.category,
        description: service.description,
        price: service.basePrice,
        rating: service.rating,
        image: service.images && service.images.length > 0 ? service.images[0] : null,
      };
    }).filter(Boolean); // Remove any null items

    res.status(200).json({
      success: true,
      count: formattedServices.length,
      data: formattedServices,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save a service
// @route   POST /api/saved-services/:serviceId
// @access  Private
export const saveService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { serviceId } = req.params;

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    // Check if already saved
    const existingSavedService = await SavedService.findOne({
      user: req.user?.id,
      service: serviceId,
    });

    if (existingSavedService) {
      return res.status(400).json({
        success: false,
        error: "Service already saved",
      });
    }

    // Create saved service
    const savedService = await SavedService.create({
      user: req.user?.id,
      service: serviceId,
    });

    res.status(201).json({
      success: true,
      data: savedService,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove a saved service
// @route   DELETE /api/saved-services/:serviceId
// @access  Private
export const removeSavedService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { serviceId } = req.params;

    // Find and remove the saved service
    const savedService = await SavedService.findOneAndDelete({
      user: req.user?.id,
      service: serviceId,
    });

    if (!savedService) {
      return res.status(404).json({
        success: false,
        error: "Saved service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
