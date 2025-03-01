import { isNil } from 'lodash';

import CustomError from '../error/customError';
import DbConfig from '../config/dbConfig';

const prisma = DbConfig.getInstance();

class UserService {
    private static instance: UserService;

    private constructor() {}

    public static getInstance() {
        if (isNil(UserService.instance)) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
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

    async getUsers() {
        return prisma.user.findMany({
            where: {
                isActive: true,
                id: {
                    not: 0,
                }
            },
        });
    }

    async getUserInfo(id: number) {
        // User => Rooms => Accounts => Expenses

    }

    async updateUser(id: number) {
        await this.getUserByIdOrEmail(id, null);
    }

    async deleteUser(id: number) {
        await this.getUserByIdOrEmail(id, null);
    }
}

export default UserService;
