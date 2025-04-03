import { isNil } from 'lodash';
import DbConfig from '../config/dbConfig';
import CustomError from '../error/customError';
import { validateAccountNumber, formatAccountNumber, restoreAccountNumber } from '../utils/accountUtils';

const prisma = DbConfig.getInstance();

class AccountService {
    private static instance: AccountService;

    private constructor() { }

    public static getInstance(): AccountService {
        if (isNil(AccountService.instance)) {
            AccountService.instance = new AccountService();
        }
        return AccountService.instance;
    }

    async createAccount(accountName: string, accountType: string, userId: number) {
        // at max 3 accounts
        const accountCount = await prisma.account.count({
            where: {
                userId
            }
        });
        if (accountCount >= 3) {
            throw new CustomError('Cannot add more than 3 accounts', 409);
        }

        // Generate unique account number
        const accountNumber = await this.generateUniqueAccountNumber();

        // create account
        return prisma.account.create({
            data: {
                accountName,
                accountType,
                userId,
                accountNumber,
                balance: 0,
                status: 'active'
            }
        });
    }

    // private method to generate unique account numbers
    private async generateUniqueAccountNumber(): Promise<string> {
        const ACCOUNT_NUMBER_LENGTH = 12; // Standard length for account numbers
        const MAX_ATTEMPTS = 10; // Maximum attempts to generate unique number

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            // Generate random number with padding
            const randomPart = Math.floor(Math.random() * 1000000000000).toString().padStart(ACCOUNT_NUMBER_LENGTH, '0');

            // Add prefix based on environment (e.g., 'DEV' for development)
            const accountNumber = `${process.env.NODE_ENV === 'production' ? '' : 'DEV'}${randomPart}`;

            // Check if account number already exists
            const existingAccount = await prisma.account.findUnique({
                where: {
                    accountNumber
                }
            });

            if (!existingAccount) {
                return accountNumber;
            }
        }

        throw new CustomError('Failed to generate unique account number', 500);
    }

    async getAccountsForUser(userId: number) {
        return prisma.account.findMany({
            where: {
                userId,
                status: 'active'
            }
        })
    }

    async getAccountByAccountId(userId: number, accountId: number) {
        // check if account exists
        const account = await prisma.account.findUnique({
            where: {
                id: accountId,
                userId,
                status: 'active'
            }
        })
        if (isNil(account)) {
            throw new CustomError('Account not Found', 404);
        }
        return account;
    }

    async addMoneyToAccount(userId: number, accountId: number, amount: number) {
        if (amount <= 0) {
            throw new CustomError('Invalid deposit amount', 400);
        }
        // prisma transaction
        return await prisma.$transaction(async (tx) => {
            // fetch account inside tx to avoid race conditions
            const account = await tx.account.findUnique({
                where: {
                    id: accountId,
                    userId,
                    status: 'active'
                },
                select: {
                    balance: true
                }
            });
            if (isNil(account)) {
                throw new CustomError('Account not Found or Inactive', 404);
            }

            // update balance in the transaction
            let updatedAccount;
            let transactionStatus: 'COMPLETED' | 'FAILED' = 'COMPLETED';
            try {
                updatedAccount = await tx.account.update({
                    where: {
                        id: accountId
                    },
                    data: {
                        balance: {
                            increment: amount
                        }
                    },
                    select: {
                        balance: true
                    }
                });
            } catch (error) {
                transactionStatus = 'FAILED';

                await tx.transaction.create({
                    data: {
                        amount,
                        type: 'DEPOSIT',
                        description: 'Self Deposit',
                        status: transactionStatus,
                        senderId: userId,
                        receiverId: userId,
                        senderAccountId: accountId,
                        receiverAccountId: accountId,
                        createdAt: new Date()
                    }
                });

                throw new CustomError('Deposit Failed', 500);
            }

            // log the transaction
            await tx.transaction.create({
                data: {
                    amount,
                    type: 'DEPOSIT',
                    description: 'Self Deposit',
                    status: transactionStatus,
                    senderId: userId,
                    receiverId: userId,
                    senderAccountId: accountId,
                    receiverAccountId: accountId,
                    createdAt: new Date()
                }
            });

            return { balance: Number(updatedAccount.balance) };
        }, { timeout: 30000 })
    }

    async getAccountTransactions(accountId: number) {
        if (isNil(accountId)) {
            throw new CustomError('Invalid AccountId', 400);
        }

        // Check if account exists
        const account = await prisma.account.findUnique({
            where: {
                id: accountId,
                status: 'active'
            }
        });

        if (!account) {
            throw new CustomError('Account not found or inactive', 404);
        }

        // Get all transactions for this account
        return prisma.transaction.findMany({
            where: {
                OR: [
                    { senderAccountId: accountId },
                    { receiverAccountId: accountId }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async deleteAccount(accountId: number) {
        // Check if account exists and has no pending transactions
        const account = await prisma.account.findUnique({
            where: {
                id: accountId,
                status: 'active'
            },
            include: {
                sentTransactions: {
                    where: {
                        status: 'PENDING'
                    }
                },
                receivedTransactions: {
                    where: {
                        status: 'PENDING'
                    }
                }
            }
        });

        if (!account) {
            throw new CustomError('Account not found', 404);
        }

        // Check if account has any balance
        if (Number(account.balance) > 0) {
            throw new CustomError('Cannot delete account with remaining balance', 409);
        }

        // Check both sent and received pending transactions
        const hasPendingTransactions =
            account.sentTransactions.length > 0 ||
            account.receivedTransactions.length > 0;

        if (hasPendingTransactions) {
            throw new CustomError('Cannot delete account with pending transactions', 409);
        }

        // Soft delete by updating status
        await prisma.account.update({
            where: { id: accountId },
            data: { status: 'inactive' }
        });

        return 'Account deleted successfully';
    }

    async searchRecipientAccounts(searchTerm: string, excludeAccountId: number) {
        return prisma.account.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            {
                                accountNumber: {
                                    contains: searchTerm.replace(/\D/g, '') // Remove non-digits for searching
                                }
                            },
                            { accountName: { contains: searchTerm } },
                            {
                                user: {
                                    OR: [
                                        { firstName: { contains: searchTerm } },
                                        { lastName: { contains: searchTerm } }
                                    ]
                                }
                            }
                        ]
                    },
                    { id: { not: excludeAccountId } },
                    { status: 'active' }
                ]
            },
            select: {
                id: true,
                accountNumber: true,
                accountName: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            take: 5
        }).then(accounts => accounts.map(account => ({
            ...account,
            accountNumber: formatAccountNumber(account.accountNumber) // Format for display
        })));
    }

    async transferMoney(senderAccountId: number, recipientAccountNumber: string, amount: number) {
        // Start transaction
        return await prisma.$transaction(async (tx) => {
            // Get sender account
            const senderAccount = await tx.account.findUnique({
                where: {
                    id: senderAccountId,
                    status: 'active'
                }
            });

            if (!senderAccount) {
                throw new CustomError('Sender account not found', 404);
            }

            // Get recipient account
            const recipientAccount = await tx.account.findUnique({
                where: {
                    accountNumber: restoreAccountNumber(recipientAccountNumber),
                    status: 'active'
                }
            });

            if (!recipientAccount) {
                throw new CustomError('Recipient account not found', 404);
            }

            // Check sufficient balance
            if (Number(senderAccount.balance) < amount) {
                throw new CustomError('Insufficient balance', 400);
            }

            // Update sender balance
            await tx.account.update({
                where: { id: senderAccountId },
                data: { balance: { decrement: amount } }
            });

            // Update recipient balance
            await tx.account.update({
                where: { id: recipientAccount.id },
                data: { balance: { increment: amount } }
            });

            // Create transaction record
            await tx.transaction.create({
                data: {
                    amount,
                    type: 'TRANSFER',
                    status: 'COMPLETED',
                    description: 'Account Transfer',
                    senderId: senderAccount.userId,
                    receiverId: recipientAccount.userId,
                    senderAccountId: senderAccount.id,
                    receiverAccountId: recipientAccount.id
                }
            });

            // Create transaction record for recipient
            await tx.transaction.create({
                data: {
                    amount,
                    type: 'TRANSFER',
                    status: 'COMPLETED',
                    description: 'Received money from account ' + senderAccount.accountNumber,
                    senderId: senderAccount.userId,
                    receiverId: recipientAccount.userId,
                    senderAccountId: senderAccount.id,
                    receiverAccountId: recipientAccount.id
                }
            });

            return {
                message: 'Transfer successful',
                balance: Number(senderAccount.balance) - amount
            };
        }, { timeout: 30000 });
    }
}

export default AccountService;
