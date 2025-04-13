import {Express, Request, Response} from 'express';

declare global {
    namespace Express {
        interface Request {
            userId?: number,
            email?: string,
            requestId?: string,
            [key: string]: any,
        }
    }
}
