import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

import CustomError from '../error/customError';
import { createScopedLogger } from '../utils/loggerWrapper';

const LoggerLabel = 'ErrorHandler';
const logger = createScopedLogger(LoggerLabel);

export default function errorHandler(err: unknown, req: Request, res: Response) {
    const requestId = req.requestId;
    const meta = { requestId };

    if (err instanceof CustomError) {
        logger.warn('Handled CustomError', { ...meta, error: err });
        return res.status(err.statusCode).json({
            status: 'error',
            statusCode: err.statusCode,
            message: err.message,
            ...(err.meta && { meta: err.meta }),
        });
    }

    if (err instanceof ZodError) {
        logger.warn('Zod validation error', { ...meta, validationErrors: err.format() });
        return res.status(422).json({
            status: 'fail',
            statusCode: 422,
            message: 'Validation failed',
            errors: err.format(),
        });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error('Prisma client error', { ...meta, error: err });
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'A database error occurred',
            code: err.code,
            meta: err.meta,
        });
    }

    logger.error('Unexpected internal server error', { ...meta, error: err });
    return res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Internal Server Error',
    });
}
