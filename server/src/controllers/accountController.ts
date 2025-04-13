import { Request, Response } from 'express';
import { isNil } from 'lodash';
import { userIdSchema } from '../validations/userValidations';
import errorHandler from '../middlewares/errorHandler';
import AccountService from '../services/accountService';
import { buildLogMeta, createScopedLogger } from '../utils/loggerWrapper';

const LoggerLabel = 'AccountController';
const accountService = AccountService.getInstance();
const logger = createScopedLogger(LoggerLabel);

class AccountController {
    private static instance: AccountController;

    private constructor() {
        logger.info('AccountController initialized', {function: 'constructor'});
    }

    public static getInstance(): AccountController {
        if (isNil(AccountController.instance)) {
            AccountController.instance = new AccountController();
        }
        return AccountController.instance;
    }

    async createAccount(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'createAccount');
        try {
            logger.info(`Create account request for userId: ${meta.userId} and email: ${meta.email}`, meta);
            const userIdValidator = userIdSchema.safeParse({ id: req.userId });
            if (!userIdValidator.success) {
                return res.status(422).json(userIdValidator.error.format());
            }
            const { id: userId } = userIdValidator.data;
            const { name: accountName, type: accountType } = req.body;
            const account = await accountService.createAccount(accountName, accountType, userId);
            return res.status(201).json(account);
        } catch (error) {
            logger.error('Error occurred while creating account', {...meta, error});
            return errorHandler(error, req, res);
        }
    }

    async getAccountsForUser(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'getAccountsForUser');
        try {
            const { userId } = req.params;
            logger.info(`Fetching accounts for user with userId: ${userId} and email: ${meta.email}`, meta);
            const accounts = await accountService.getAccountsForUser(parseInt(userId));
            return res.status(200).json(accounts);
        } catch (error) {
            logger.error('Error occurred while fetching accounts for user', { ...meta, error });
            return errorHandler(error, req, res);
        }
    }

    async getAccountByAccountId(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'getAccountByAccountId');
        try {
            const { userId, accountId } = req.params;
            logger.info(`Fetching account for user with userId: ${userId} and accountId: ${accountId} and email: ${meta.email}`, meta);
            const account = await accountService.getAccountByAccountId(parseInt(userId), parseInt(accountId));
            return res.status(200).json(account);
        } catch (error) {
            logger.error('Error occurred while fetching account for user', { ...meta, error });
            return errorHandler(error, req, res);
        }
    }

    async addMoneyToAccount(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'addMoneyToAccount');
        try {
            const { userId, accountId } = req.params;
            logger.info(`Adding money to account for userId: ${userId} and accountId: ${accountId} and email: ${meta.email}`, meta);
            const { amount } = req.body;
            const account = await accountService.addMoneyToAccount(parseInt(userId), parseInt(accountId), amount);
            return res.status(200).json(account);
        } catch (error) {
            logger.error('Error occurred while adding money to account', { ...meta, error });
            return errorHandler(error, req, res);
        }
    }

    async getAccountTransactions(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'getAccountTransactions');
        try {
            const { accountId } = req.params;
            logger.info(`Fetching account transactions for accountId: ${accountId}`, meta);
            const transactions = await accountService.getAccountTransactions(parseInt(accountId));
            return res.status(200).json(transactions);
        } catch (error) {
            logger.error('Error occurred while fetching transactions for account', {
                label: LoggerLabel,
                function: 'getAccountTransactions',
                error
            })
            return errorHandler(error, req, res);
        }
    }

    async deleteAccount(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            logger.info(`Deleting account with accountId: ${accountId}`, {
                label: LoggerLabel,
                function: 'deleteAccount'
            });
            const result = await accountService.deleteAccount(parseInt(accountId));
            return res.status(200).json(result);
        } catch (error) {
            logger.error('Error occurred while deleting account', {
                label: LoggerLabel,
                function: 'deleteAccount',
                error
            })
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
            logger.info(`Transferring money from accountId: ${accountId} to accountNumber: ${recipientAccountNumber}`, {
                label: LoggerLabel,
                function: 'transferMoney'
            });
            const transaction = await accountService.transferMoney(parseInt(accountId), recipientAccountNumber, amount);
            return res.status(200).json(transaction);
        } catch (error) {
            logger.error('Error occurred while transferring money', {
                label: LoggerLabel,
                function: 'transferMoney',
                error
            })
            return errorHandler(error, req, res);
        }
    }
}

export default AccountController;
