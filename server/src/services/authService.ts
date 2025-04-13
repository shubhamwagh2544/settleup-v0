import { isNil } from 'lodash';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import CustomError from '../error/customError';
import DbConfig from '../config/dbConfig';
import { JWT_SECRET } from '../config/config';
import { createScopedLogger, LogMeta } from '../utils/loggerWrapper';

const LoggerLabel = 'AuthService';
const prisma = DbConfig.getInstance();
const logger = createScopedLogger(LoggerLabel);

class AuthService {
    private static instance: AuthService;
    private readonly saltRounds = 10;

    private constructor() {
        logger.info(`AuthService initialized`, {function: 'constructor'});
    }

    public static getInstance() {
        if (isNil(AuthService.instance)) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async signUp(firstname: string, lastname: string, email: string, password: string, meta: LogMeta) {
        logger.info(`SignUp initiated for email: ${email}`, meta);
        // Todo: Validate inputs: zod
        if (!email || !password || !firstname || !lastname) {
            logger.warn(`Missing required fields while sign up`, meta);
            throw new CustomError('Email and password are required', 400);
        }

        logger.info('Checking if user exists in database', meta);
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                email: true,
            },
        });
        if (existingUser) {
            logger.warn('User already exists in the database', meta);
            throw new CustomError('User already exists', 409);
        }

        logger.debug('Hashing user password', meta);
        const hashedPassword = await bcrypt.hash(password, this.saltRounds);

        logger.info('Creating user in sign up', meta);
        const user = await prisma.user.create({
            data: {
                firstName: firstname,
                lastName: lastname,
                email,
                password: hashedPassword,
            },
        });

        logger.info('Signing JWT token', meta);
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '1d',
        });

        // todo: joins default room

        const { password: _, ...userWithoutPassword } = user;
        return [userWithoutPassword, token];
    }

    async signIn(email: string, password: string, meta: LogMeta) {
        logger.info(`SignIn initiated for email: ${email}`, meta);

        logger.info('Checking if user exists in database', meta);
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
            },
        });

        if (isNil(user)) {
            logger.warn('User does not exist in database', meta);
            throw new CustomError('User not found', 404);
        }

        // non-admin check
        if (user.id !== 0) {
            logger.debug('Checking hashed password match', meta);
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                logger.warn('Invalid password for user', meta);
                throw new CustomError('Invalid email or password', 400);
            }
        }

        logger.info('Signing JWT token', meta);
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '1d',
        });

        const { password: _, ...userWithoutPassword } = user;
        return [userWithoutPassword, token];
    }
}

export default AuthService;
