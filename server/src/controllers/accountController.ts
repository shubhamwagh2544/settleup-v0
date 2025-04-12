import { Request, Response } from 'express';
import { isNil } from 'lodash';
import { userIdSchema } from '../validations/userValidations';
import errorHandler from '../middlewares/errorHandler';
import AccountService from '../services/accountService';

const accountService = AccountService.getInstance();

declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

class AccountController {
    private static instance: AccountController;

    private constructor() {}

    public static getInstance(): AccountController {
        if (isNil(AccountController.instance)) {
            AccountController.instance = new AccountController();
        }
        return AccountController.instance;
    }

    async createAccount(req: Request, res: Response) {
        try {
            const userIdValidator = userIdSchema.safeParse({ id: req.userId });
            if (!userIdValidator.success) {
                return res.status(422).json(userIdValidator.error.format());
            }
            const { id: userId } = userIdValidator.data;
            const { name: accountName, type: accountType } = req.body;
            const account = await accountService.createAccount(accountName, accountType, userId);
            return res.status(201).json(account);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getAccountsForUser(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const accounts = await accountService.getAccountsForUser(parseInt(userId));
            return res.status(200).json(accounts);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getAccountByAccountId(req: Request, res: Response) {
        try {
            const { userId, accountId } = req.params;
            const account = await accountService.getAccountByAccountId(parseInt(userId), parseInt(accountId));
            return res.status(200).json(account);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async addMoneyToAccount(req: Request, res: Response) {
        try {
            const { userId, accountId } = req.params;
            const { amount } = req.body;
            const account = await accountService.addMoneyToAccount(parseInt(userId), parseInt(accountId), amount);
            return res.status(200).json(account);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getAccountTransactions(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            const transactions = await accountService.getAccountTransactions(parseInt(accountId));
            return res.status(200).json(transactions);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async deleteAccount(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            const result = await accountService.deleteAccount(parseInt(accountId));
            return res.status(200).json(result);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async searchAccounts(req: Request, res: Response) {
        try {
            const { term, excludeId } = req.query;
            if (!term || !excludeId) {
                return res.status(400).json({ message: 'Search term and excludeId are required' });
            }
            const accounts = await accountService.searchRecipientAccounts(
                term.toString(),
                parseInt(excludeId.toString())
            );
            return res.status(200).json(accounts);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async transferMoney(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            const { amount, recipientAccountNumber } = req.body;
            const transaction = await accountService.transferMoney(parseInt(accountId), recipientAccountNumber, amount);
            return res.status(200).json(transaction);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }
}

export default AccountController;
