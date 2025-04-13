class CustomError extends Error {
    statusCode: number;
    meta?: Record<string, unknown>;

    constructor(message: string, statusCode = 400, meta?: Record<string, unknown>) {
        super(message);
        this.statusCode = statusCode;
        this.meta = meta;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;
