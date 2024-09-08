import { PrismaClient } from '@prisma/client';

class DbConfig {
    private static prisma: PrismaClient;

    static getInstance() {
        if (!this.prisma) {
            this.prisma = new PrismaClient();
        }
        return this.prisma;
    }

    static async connectDatabase() {
        try {
            DbConfig.prisma.$connect();
        } catch (error) {
            console.error('Error connecting to the database:', error);
        }
    }

    static async disconnectDatabase() {
        try {
            DbConfig.prisma.$disconnect();
            console.log('Disconnected from the database');
        } catch (error) {
            console.error('Error disconnecting from the database:', error);
        }
    }
}


export default DbConfig;
