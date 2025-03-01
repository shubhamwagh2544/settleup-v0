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
        this.accountRouter.post('/', accountController.createAccount);
    }

    public getRouter(): Router {
        return this.accountRouter;
    }

}

export default AccountRoutes;
