import CustomError from '../error/customError';
import bcrypt from 'bcrypt';
import DbConfig from '../config/dbConfig';
import RoomService from './roomService';
import IoConfig from '../config/ioConfig';

const prisma = DbConfig.getInstance();
const roomService = RoomService.getInstance();
const io = IoConfig.getInstance();

class UserService {
    private static instance: UserService;
    private readonly saltRounds = 10;

    static getInstance() {
        if (!this.instance) {
            this.instance = new UserService();
        }
        return this.instance;
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
        });
        if (!user) {
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

    async getUserById(id: number) {
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
        });
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        // todo: joins default room

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export default UserService;
