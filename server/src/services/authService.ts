import { isNil } from 'lodash';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import CustomError from '../error/customError';
import DbConfig from '../config/dbConfig';
import { JWT_SECRET } from '../config/config';

const prisma = DbConfig.getInstance();

class AuthService {
    private static instance: AuthService;
    private readonly saltRounds = 10;

    private constructor() {}

    public static getInstance() {
        if (isNil(AuthService.instance)) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async signUp(firstname: string, lastname: string, email: string, password: string) {
        // Todo: Validate inputs: zod
        if (!email || !password || !firstname || !lastname) {
            throw new CustomError('Email and password are required', 400);
        }
        // check if user already exists
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
            throw new CustomError('User already exists', 409);
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, this.saltRounds);

        const user = await prisma.user.create({
            data: {
                firstName: firstname,
                lastName: lastname,
                email,
                password: hashedPassword,
            },
        });

        // create a token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '1d',
        });

        // todo: joins default room

        const { password: _, ...userWithoutPassword } = user;
        return [ userWithoutPassword, token ];
    }

    async signIn(email: string, password: string) {
        // check if user already exists
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
            throw new CustomError('User not found', 404);
        }

        // non-admin check
        if (user.id !== 0) {
            // check if password matches
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new CustomError('Invalid email or password', 400);
            }
        }

        // create a token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '1d',
        });

        const { password: _, ...userWithoutPassword } = user;
        return [ userWithoutPassword, token ];
    }
}

export default AuthService;