import { isNil } from 'lodash';

import CustomError from '../error/customError';
import DbConfig from '../config/dbConfig';
import { createScopedLogger, LogMeta } from '../utils/loggerWrapper';
import { User } from '@prisma/client';
import { userSchema } from '../validations/userValidations';

const LoggerLabel = 'UserService';
const prisma = DbConfig.getInstance();
const logger = createScopedLogger(LoggerLabel);

class UserService {
    private static instance: UserService;

    private constructor() {
        logger.info('UserService initialized', {function: 'constructor'});
    }

    public static getInstance() {
        if (isNil(UserService.instance)) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    async getUserByIdOrEmail(id: number | null | undefined, email: string | null | undefined, meta: LogMeta) {
        logger.info(`Fetching user for Id/Email: ${meta.userId} / ${meta.email}`, meta);
        const where = id ? { id } : email ? { email } : null;
        if (isNil(where)) {
            logger.warn('Invalid userId or email', meta);
            throw new CustomError('Invalid userId or email', 404);
        }

        logger.info('Checking if user exists in the database', meta);
        const user = await prisma.user.findUnique({ where });
        if (isNil(user)) {
            logger.warn('User does not exist in the database', meta);
            throw new CustomError('User not found', 404);
        }

        // todo: joins default room

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async getUsers(meta: LogMeta) {
        logger.info('Fetching all users from database', meta);
        return prisma.user.findMany({
            where: {
                isActive: true,
                id: {
                    not: 0,
                },
            },
        });
    }

    async getUserInfo(id: number) {
        // User => Rooms => Accounts => Expenses
    }

    async updateUser(params: Partial<User>, meta: LogMeta) {
        const validatorResult = userSchema.safeParse(params);
        if (validatorResult.error) {
            throw new CustomError(validatorResult.error.message, 400);
        }

        const email = params.email;
        const user: Partial<User> = await this.getUserByIdOrEmail(null, email, meta);
        if (isNil(user)) {
            throw new CustomError('User not found', 404);
        }

        const allowedFields = ['firstName', 'lastName', 'password', 'phoneNumber', 'address', 'profilePic'];
        const updatedData: Record<string, any> = {};
        const paramsRecord = params as Record<string, any>;
        const userRecord = user as Record<string, any>;

        for (const key of allowedFields) {
            if (key in params && key in user && userRecord[key] !== paramsRecord[key]) {
                updatedData[key] = paramsRecord[key];
            }
        }

        if (Object.keys(updatedData).length !== 0) {
            // Return the updated user directly
            let updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: updatedData,
            });
            const {password, ...updatedUserWithoutPassword} = updatedUser;
            return updatedUserWithoutPassword;
        }

        return user;
    }

    async deleteUser(id: number) {
        // await this.getUserByIdOrEmail(id, null);
    }
}

export default UserService;
