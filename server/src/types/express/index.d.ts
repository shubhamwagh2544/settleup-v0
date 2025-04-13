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
