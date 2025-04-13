import { Request, Response, NextFunction } from 'express';
import {v4 as uuidV4} from 'uuid';

const requestIdMiddleware = (req: Request, res: Response, next: NextFunction)=> {
    const requestId = uuidV4();
    req.requestId = requestId;

    res.setHeader('Request-Id', requestId);

    next();
}

export default requestIdMiddleware;
