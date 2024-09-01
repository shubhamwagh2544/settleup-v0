import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function connectDatabase() {
    try {
        prisma.$connect();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

async function disconnectDatabase() {
    try {
        prisma.$disconnect();
        console.log('Disconnected from the database');
    } catch (error) {
        console.error('Error disconnecting from the database:', error);
    }
}

export { prisma, connectDatabase, disconnectDatabase};
