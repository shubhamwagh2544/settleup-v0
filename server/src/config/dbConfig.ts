import { PrismaClient } from '@prisma/client';
import { isNil } from 'lodash';
import { userModel } from '../model-extensions/userModel';

class DbConfig {
    private static prisma: ReturnType<typeof DbConfig.createPrismaInstance>;

    private static createPrismaInstance() {
        return new PrismaClient({
            log: ['query']
        }).$extends(userModel);
    }

    public static getInstance() {
        if (isNil(DbConfig.prisma)) {
            DbConfig.prisma = DbConfig.createPrismaInstance();
        }
        return DbConfig.prisma;
    }

    public static async connectDatabase() {
        try {
            DbConfig.prisma.$connect();
        } catch (error) {
            console.error('Error connecting to the database:', error);
        }
    }

    public static async disconnectDatabase() {
        try {
            DbConfig.prisma.$disconnect();
            console.log('Disconnected from the database');
        } catch (error) {
            console.error('Error disconnecting from the database:', error);
        }
    }

    public static async createDefaultRoom() {
        let defaultRoom;
        defaultRoom = await DbConfig.prisma.room.findUnique({
            where: {
                id: 0,
                name: 'DEFAULT_ROOM',
                isDefault: true,
            },
        });
        if (!defaultRoom) {
            defaultRoom = await DbConfig.prisma.room.create({
                data: {
                    id: 0,
                    name: 'DEFAULT_ROOM',
                    description: 'This is default room for all platform users',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    roomType: 'public',
                    roomPic: null,
                    isActive: true,
                    isDefault: true,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    isDefault: true,
                },
            });
        }
        return defaultRoom;
    }

    public static async createAdminUser() {
        let adminUser;
        adminUser = await DbConfig.prisma.user.findUnique({
            where: {
                id: 0,
                email: 'admin@splitwise.com',
            },
        });
        if (!adminUser) {
            adminUser = await DbConfig.prisma.user.create({
                data: {
                    id: 0,
                    email: 'admin@splitwise.com',
                    password: 'admin',
                    firstName: 'Admin',
                    lastName: 'User',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    isAdmin: true,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isAdmin: true,
                },
            });
        }
        return adminUser;
    }
}

export default DbConfig;
