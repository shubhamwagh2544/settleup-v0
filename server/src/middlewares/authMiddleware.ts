import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import CustomError from '../error/customError';
import { JWT_SECRET } from '../config/config';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authorization = req.header('Authorization');
        if (!authorization) {
            throw new CustomError('Please authenticate first', 401);
        }

        let data = authorization.split(' ');
        if (data[0] !== 'Bearer' || data.length !== 2) {
            throw new CustomError('Please authenticate first', 401);
        }

        const token = data[1];

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, email: string };
        req.userId = decoded.userId;
        req.email = decoded.email;

        next();
    } catch (error: any) {
        res.status(401).send({ error: error.message });
    }
}