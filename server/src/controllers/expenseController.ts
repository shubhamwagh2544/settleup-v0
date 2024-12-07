import { Request, Response } from 'express';
import { isNil } from 'lodash';

import errorHandler from '../middlewares/errorHandler';
import ExpenseService from '../services/expenseService';

const expenseService = ExpenseService.getInstance();

class ExpenseController {
    private static instance: ExpenseController;

    private constructor() {}

    public static getInstance() {
        if (isNil(ExpenseController.instance)) {
            ExpenseController.instance = new ExpenseController();
        }
        return ExpenseController.instance;
    }

    async createExpense(req: Request, res: Response) {
        try {
            const { userId, roomId, name, description,amount,splitWith } = req.body;
            const expense = await expenseService.createExpense(userId, roomId, name, description,amount,splitWith);
            return res.status(201).json(expense);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getExpensesForRoom(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const expenses = await expenseService.getExpensesForRoom(Number(roomId));
            return res.status(200).json(expenses);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

}

export default ExpenseController;
