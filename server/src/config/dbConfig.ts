import { PrismaClient } from '@prisma/client';
import { isNil } from 'lodash';

class DbConfig {
    private static prisma: PrismaClient;

    private constructor() {}

    public static getInstance() {
        if (isNil(DbConfig.prisma)) {
            DbConfig.prisma = new PrismaClient();
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
}

export default DbConfig;
