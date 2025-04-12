import express, { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { isNil } from 'lodash';
import AccountController from '../controllers/accountController';

const accountController = AccountController.getInstance();

class AccountRoutes {
    private static instance: AccountRoutes;
    private readonly accountRouter: Router;

    private constructor() {
        this.accountRouter = express.Router();
        this.initializeRoutes();
    }

    public static getInstance(): AccountRoutes {
        if (isNil(AccountRoutes.instance)) {
            AccountRoutes.instance = new AccountRoutes();
        }
        return AccountRoutes.instance;
    }

    private initializeRoutes(): void {
        this.accountRouter.post('/user', authMiddleware, accountController.createAccount);
        this.accountRouter.get('/user/:userId', authMiddleware, accountController.getAccountsForUser);
        this.accountRouter.get('/:accountId/user/:userId', authMiddleware, accountController.getAccountByAccountId);
        this.accountRouter.post(
            '/:accountId/user/:userId/deposit',
            authMiddleware,
            accountController.addMoneyToAccount
        );
        this.accountRouter.get('/:accountId/transactions', authMiddleware, accountController.getAccountTransactions);
        this.accountRouter.delete('/:accountId', authMiddleware, accountController.deleteAccount);
        this.accountRouter.get('/search', authMiddleware, accountController.searchAccounts);
        this.accountRouter.post('/:accountId/transfer', authMiddleware, accountController.transferMoney);
    }

    public getRouter(): Router {
        return this.accountRouter;
    }
}

export default AccountRoutes;
