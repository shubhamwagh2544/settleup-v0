import { isNil } from 'lodash';
import DbConfig from '../config/dbConfig';
import CustomError from '../error/customError';

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
        })
        if (accountCount >= 3) {
            throw new CustomError('Cannot add more than 3 accounts', 409);
        }
        // create account
        return prisma.account.create({
            data: {
                accountName,
                accountType,
                userId
            }
        })
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
}

export default AccountService;
