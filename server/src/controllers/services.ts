import { Request, Response, NextFunction } from 'express';
import Service from '../models/Service';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Service.find(JSON.parse(queryStr)).populate('provider', 'name avatar');

    // Select Fields
    if (req.query.select) {
      const fields = (req.query.select as string).split(',').join(' ');
      query = query.select(fields) as typeof query;
    }

    // Sort
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Service.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const services = await query;

    // Pagination result
    const pagination: any = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: services.length,
      pagination,
      data: services,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'name avatar bio');

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider only)
export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add user to req.body
    req.body.provider = req.user?.id;

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider only)
export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this service',
      });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider only)
export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this service',
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get services by provider
// @route   GET /api/services/provider/:providerId
// @access  Public
export const getProviderServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await Service.find({ provider: req.params.providerId });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's services
// @route   GET /api/services/me
// @access  Private (Provider only)
export const getUserServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await Service.find({ provider: req.user?.id });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update service status
// @route   PATCH /api/services/:id/status
// @access  Private (Provider only)
export const updateServiceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!['active', 'draft', 'paused'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value',
      });
    }

    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this service',
      });
    }

    service = await Service.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};
