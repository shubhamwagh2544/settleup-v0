import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, label, stack, ...metadata }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    if (label) {
        logMessage = `${timestamp} ${level}: [${label}]: ${message}`; // Add the label to the message
    }
    if (stack) {
        logMessage = `${logMessage}\nStack: ${stack}`; // Add stack trace if available
    }
    if (Object.keys(metadata).length) {
        logMessage = `${logMessage} ${JSON.stringify(metadata)}`; // Log the metadata (e.g., request info, error details)
    }
    return logMessage;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), // Log stack trace for errors
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: combine(colorize(), logFormat),
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});


export default logger;
