import { Request, Response, NextFunction } from "express";
import ac from "../config/accessControl";

/**
 * Middleware to check if the user has permission to perform an action on a resource
 * @param resource The resource being accessed (e.g., 'service', 'booking')
 * @param action The action being performed ('createAny', 'readAny', 'updateAny', 'deleteAny', 'createOwn', 'readOwn', 'updateOwn', 'deleteOwn')
 * @param possessionField Optional field name in the request params that contains the resource owner ID to check ownership
 */
export const checkAccess = (
  resource: string,
  action:
    | "createAny"
    | "readAny"
    | "updateAny"
    | "deleteAny"
    | "createOwn"
    | "readOwn"
    | "updateOwn"
    | "deleteOwn",
  possessionField?: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists in request (should be set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Not authorized to access this route",
        });
      }

      // Get user role
      const { role } = req.user;
      // Check if action contains 'Own' and we need to verify ownership
      const isOwn = action.includes("Own");

      // If it's an 'Own' action and we have a possession field, verify ownership
      if (isOwn && possessionField && req.params[possessionField]) {
        const resourceId = req.params[possessionField];

        // If the resource ID doesn't match the user ID (for profile) or doesn't belong to the user,
        // then we need to check if they have 'Any' permission instead
        const isOwner = await checkOwnership(req, resource, resourceId);
        
        if (!isOwner) {
          // Check if user has 'Any' permission instead
          const anyAction = action.replace("Own", "Any") as
            | "createAny"
            | "readAny"
            | "updateAny"
            | "deleteAny";
          const permission = ac.can(role)[anyAction](resource);

          if (!permission.granted) {
            return res.status(403).json({
              success: false,
              error: "You do not have permission to perform this action",
            });
          }

          // If they have 'Any' permission, allow access
          req.accessControl = {
            permission,
            action: anyAction,
          };
          return next();
        }
      }

      // Check permission
      const permission = ac.can(role)[action](resource);

      if (!permission.granted) {
        return res.status(403).json({
          success: false,
          error: "You do not have permission to perform this action",
        });
      }

      // Add permission to request for use in controllers
      req.accessControl = {
        permission,
        action,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Helper function to check if the user owns the resource
 */
async function checkOwnership(
  req: Request,
  resource: string,
  resourceId: string
): Promise<boolean> {
  // If the resource is 'profile', check if the user is accessing their own profile
  if (resource === "profile") {
    return req.user?.id === resourceId;
  }

  // For other resources, we need to query the database
  // This is a simplified example - you'll need to implement specific checks for each resource type
  try {
    // Import models dynamically to avoid circular dependencies
    const Service = require("../models/Service").default;
    const Booking = require("../models/Booking").default;
    const Review = require("../models/Review").default;
    const SavedService = require("../models/SavedService").default;

    switch (resource) {
      case "service":
        const service = await Service.findById(resourceId);
        return service && service.provider.toString() === req.user?.id;

      case "booking":
        const booking = await Booking.findById(resourceId);
        if (!booking) return false;

        // Check if the user is either the customer or the provider of the booking
        const isCustomer = booking.customer.toString() === req.user?.id;
        const isProvider = booking.provider.toString() === req.user?.id;

        // Return true if the user is either the customer or the provider
        return isCustomer || isProvider;

      case "providerBooking":
        const providerBooking = await Booking.findById(resourceId);
        return (
          providerBooking &&
          providerBooking.provider.toString() === req.user?.id
        );

      case "review":
        const review = await Review.findById(resourceId);
        return review && review.user.toString() === req.user?.id;

      case "savedService":
        const savedService = await SavedService.findById(resourceId);
        return savedService && savedService.user.toString() === req.user?.id;

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking ownership for ${resource}:`, error);
    return false;
  }
}

// Extend Express Request interface to include accessControl
declare global {
  namespace Express {
    interface Request {
      accessControl?: {
        permission: any;
        action: string;
      };
    }
  }
}
