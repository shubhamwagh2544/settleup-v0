import * as bcrypt from 'bcrypt';
import DbConfig from '../config/dbConfig';
import AccountService from '../services/accountService';

const prisma = DbConfig.getInstance();
const accountService = AccountService.getInstance();

async function main() {
    console.log('🌱 Starting database seeding...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
        { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe' },
        { email: 'emma.wilson@example.com', firstName: 'Emma', lastName: 'Wilson' },
        { email: 'michael.brown@example.com', firstName: 'Michael', lastName: 'Brown' },
        { email: 'sarah.taylor@example.com', firstName: 'Sarah', lastName: 'Taylor' },
        { email: 'david.miller@example.com', firstName: 'David', lastName: 'Miller' },
        { email: 'lisa.anderson@example.com', firstName: 'Lisa', lastName: 'Anderson' },
        { email: 'james.martin@example.com', firstName: 'James', lastName: 'Martin' },
        { email: 'olivia.white@example.com', firstName: 'Olivia', lastName: 'White' },
        { email: 'daniel.clark@example.com', firstName: 'Daniel', lastName: 'Clark' },
        { email: 'sophia.lee@example.com', firstName: 'Sophia', lastName: 'Lee' },
    ];

    for (const user of users) {
        // Create user
        const createdUser = await prisma.user.create({
            data: {
                ...user,
                password: hashedPassword,
                isActive: true,
            },
        });

        // Create default account for user
        await prisma.account.create({
            data: {
                userId: createdUser.id,
                accountName: `${user.firstName}'s Account`,
                accountNumber: await accountService.generateUniqueAccountNumber(),
                accountType: 'saving',
                balance: 1000.00,
                status: 'active',
            },
        });

        console.log(`✅ Created user and account for ${user.firstName} ${user.lastName}`);
    }

    console.log('✅ Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        // await prisma.$disconnect();
    });
