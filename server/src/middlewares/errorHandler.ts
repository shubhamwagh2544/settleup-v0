import { Request, Response } from 'express';
import CustomError from '../error/customError';

export default function errorHandler(err: Error | unknown, req: Request, res: Response) {
    console.error('Error: ', err);

    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            status: 'error',
            statusCode: err.statusCode,
            message: err.message
        });
    }

    // Handle other types of errors
    return res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Internal Server Error'
    });
}