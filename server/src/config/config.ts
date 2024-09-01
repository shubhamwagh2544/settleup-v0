import dotenv from 'dotenv';

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV;
export const NODE_PORT = process.env.NODE_PORT;
export const POSTGRES_URL = process.env.POSTGRES_URL;
