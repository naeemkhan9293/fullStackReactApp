import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

interface ErrorResponse extends Error {
  statusCode?: number;
  code?: number;
  value?: string;
  errors?: any;
}

const errorHandler = (err: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with details
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
    error: err,
    requestBody: req.body,
    requestParams: req.params,
    requestQuery: req.query,
    statusCode: error.statusCode || 500
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new Error(message) as ErrorResponse;
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message) as ErrorResponse;
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message);
    error = new Error(message.join(', ')) as ErrorResponse;
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

export default errorHandler;
