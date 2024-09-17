import CustomError from '../error/customError';
import bcrypt from 'bcrypt';
import DbConfig from '../config/dbConfig';
import { isNil } from 'lodash';

const prisma = DbConfig.getInstance();

class UserService {
    private static instance: UserService;
    private readonly saltRounds = 10;

    private constructor() {}

    public static getInstance() {
        if (isNil(UserService.instance)) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
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
        // check if password matches
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new CustomError('Invalid email or password', 400);
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async getUserByIdOrEmail(id: number | null | undefined, email: string | null | undefined) {
        let where = null;
        if (id) {
            where = { id };
        } else if (email) {
            where = { email };
        } else {
            throw new CustomError('User not found', 404);
        }

        const user = await prisma.user.findUnique({ where });
        if (isNil(user)) {
            throw new CustomError('User not found', 404);
        }

        // todo: joins default room

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async getActiveUsers() {
        return prisma.user.findMany({
            where: {
                isActive: true,
            },
        });
    }

    async updateUser(id: number) {
        await this.getUserByIdOrEmail(id, null);
    }

    async deleteUser(id: number) {
        await this.getUserByIdOrEmail(id, null);
    }
}

export default UserService;
