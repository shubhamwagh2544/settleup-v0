import { PrismaClient } from '@prisma/client';

import { isNil } from 'lodash';
import { userModel } from '../model-extensions/userModel';
import { NODE_ENV } from './config';

class DbConfig {
    private static prisma: ReturnType<typeof DbConfig.createPrismaInstance>;

    private static createPrismaInstance() {
        return new PrismaClient({
            log: NODE_ENV === 'production' ? [] : ['query']
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

    public static async createSuperAdminUser() {
        let superAdminUser;
        superAdminUser = await DbConfig.prisma.user.findUnique({
            where: {
                id: 0,
                email: 'superadmin@settleup.com',
            },
        });
        if (!superAdminUser) {
            superAdminUser = await DbConfig.prisma.user.create({
                data: {
                    id: 0,
                    email: 'superadmin@settleup.com',
                    password: 'superadmin',
                    firstName: 'SuperAdmin',
                    lastName: 'User',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    isSuperAdmin: true,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isSuperAdmin: true,
                },
            });
        }
        return superAdminUser;
    }
}

export default DbConfig;
