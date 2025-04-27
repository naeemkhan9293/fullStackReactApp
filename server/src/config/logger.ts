import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(
    ({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${stack ? '\n' + stack : ''}`;
    }
  )
);

// Define colored console format for development
const coloredConsoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(
    ({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${stack ? '\n' + stack : ''}`;
    }
  )
);

// Create file transports
const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
});

const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
});

// Create console transport with appropriate format based on environment
const consoleTransport = new winston.transports.Console({
  format: coloredConsoleFormat,
  level: 'debug', // Always show debug logs for now
});

// Create the logger
const logger = winston.createLogger({
  level: 'debug', // Always use debug level for now
  format: logFormat,
  defaultMeta: { service: 'local-connect-api' },
  transports: [
    fileTransport,
    errorFileTransport,
    consoleTransport
  ],
  exitOnError: false
});

// Create a stream object for Morgan integration
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger, stream };
