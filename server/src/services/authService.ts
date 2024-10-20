import { isNil } from 'lodash';
import bcrypt from 'bcrypt';

import CustomError from '../error/customError';
import DbConfig from '../config/dbConfig';

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

    async signUp(email: string, password: string) {
        // Todo: Validate inputs: zod
        if (!email || !password) {
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
                email,
                password: hashedPassword,
            },
        });

        // todo: joins default room

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
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

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export default AuthService;