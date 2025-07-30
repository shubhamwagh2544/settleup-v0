import { isNil } from 'lodash';

import CustomError from '../error/customError';
import DbConfig from '../config/dbConfig';
import { createScopedLogger, LogMeta } from '../utils/loggerWrapper';

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

    async updateUser(params: object, meta: LogMeta) {

    }

    async deleteUser(id: number) {
        // await this.getUserByIdOrEmail(id, null);
    }
}

export default UserService;
