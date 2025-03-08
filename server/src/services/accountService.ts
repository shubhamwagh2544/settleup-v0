import { isNil } from 'lodash';
import DbConfig from '../config/dbConfig';
import CustomError from '../error/customError';

const prisma = DbConfig.getInstance();

class AccountService {
    private static instance: AccountService;

    private constructor() {}

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
                userId
            }
        })
        if (isNil(account)) {
            throw new CustomError('Account not Found', 404);
        }
        return account;
    }
}

export default AccountService;
