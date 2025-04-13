import winston from 'winston';
import { NODE_ENV } from '../config/config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, label, function: func, stack, ...metadata }) => {
    let logMessage = `${timestamp} ${level}:`;

    if (label) logMessage += ` [${label}]`;
    if (func) logMessage += `::[${func}]`;

    logMessage += `: ${message}`;

    if (stack) logMessage += `\nStack: ${stack}`;

    if (Object.keys(metadata).length) {
        logMessage += ` ${JSON.stringify(metadata)}`;
    }
    return logMessage;
});

const logger = winston.createLogger({
    level: NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), // Log stack trace for errors
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: combine(colorize(), logFormat)
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});


export default logger;
