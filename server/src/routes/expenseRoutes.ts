import express, { Router } from 'express';
import { isNil } from 'lodash';
import { authMiddleware } from '../middlewares/authMiddleware';
import ExpenseController from '../controllers/expenseController';

const expenseController = ExpenseController.getInstance();

class ExpenseRoutes {
    private static instance: ExpenseRoutes;
    private readonly expenseRouter: Router;

    private constructor() {
        this.expenseRouter = express.Router();
        this.initialiseRoutes();
    }

    public static getInstance() {
        if (isNil(ExpenseRoutes.instance)) {
            ExpenseRoutes.instance = new ExpenseRoutes();
        }
        return ExpenseRoutes.instance;
    }

    private initialiseRoutes() {
        this.expenseRouter.post('/', authMiddleware, expenseController.createExpense);
        this.expenseRouter.get('/room/:roomId', authMiddleware, expenseController.getExpensesForRoom);
        this.expenseRouter.delete('/:expenseId', authMiddleware, expenseController.deleteExpense);
    }

    public getRouter() {
        return this.expenseRouter;
    }
}

export default ExpenseRoutes;
