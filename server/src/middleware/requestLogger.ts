import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Middleware to log detailed request information
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log request details
  logger.debug(`Request: ${req.method} ${req.originalUrl}`, {
    body: req.body,
    params: req.params,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Bearer [REDACTED]' : undefined
    },
    ip: req.ip
  });

  // Store original send function
  const originalSend = res.send;

  // Override send function to log response
  res.send = function(body): Response {
    // Log response (but don't log large responses or binary data)
    const isJSON = typeof body === 'string' && body.startsWith('{') && body.endsWith('}');
    const isSmall = typeof body === 'string' && body.length < 1000;
    
    if (isJSON && isSmall) {
      try {
        const parsedBody = JSON.parse(body);
        logger.debug(`Response: ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
          statusCode: res.statusCode,
          body: parsedBody
        });
      } catch (e) {
        logger.debug(`Response: ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
          statusCode: res.statusCode,
          body: '[Unparseable JSON]'
        });
      }
    } else {
      logger.debug(`Response: ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
        statusCode: res.statusCode,
        body: '[Response body too large or not JSON]'
      });
    }
    
    // Call original send function
    return originalSend.call(this, body);
  };

  next();
};
