import {Request} from 'express';

import logger from './logger';

type LogLevel = 'info' | 'error' | 'debug' | 'warn';

export interface LogMeta {
    label?: string;
    function?: string;
    requestId?: string;
    userId?: number;
    email?: string,
    error?: unknown,
    [key: string]: any;
}

const createScopedLogger = (label: string) => {
    return {
        log: (level: LogLevel, message: string, meta: LogMeta = {}) => {
            logger.log(level, message, { label, ...meta });
        },
        info: (message: string, meta: LogMeta = {}) => {
            logger.info(message, { label, ...meta });
        },
        error: (message: string, meta: LogMeta = {}) => {
            logger.error(message, { label, ...meta });
        },
        debug: (message: string, meta: LogMeta = {}) => {
            logger.debug(message, { label, ...meta });
        },
        warn: (message: string, meta: LogMeta = {}) => {
            logger.warn(message, { label, ...meta });
        },
    };
};

const buildLogMeta = (req: Request, functionName: string): LogMeta => {
    const { requestId, userId, email } = req;
    return {
        function: functionName,
        requestId,
        userId,
        email
    };
}

export {
    createScopedLogger,
    buildLogMeta
};
