import { Request, Response } from 'express';
import { isNil } from 'lodash';

import errorHandler from '../middlewares/errorHandler';
import ExpenseService from '../services/expenseService';

const expenseService = ExpenseService.getInstance();

class ExpenseController {
    private static instance: ExpenseController;

    private constructor() { }

    public static getInstance() {
        if (isNil(ExpenseController.instance)) {
            ExpenseController.instance = new ExpenseController();
        }
        return ExpenseController.instance;
    }

    async createExpense(req: Request, res: Response) {
        try {
            const { userId, roomId, name, description, amount, splitWith } = req.body;
            const expense = await expenseService.createExpense(userId, roomId, name, description, amount, splitWith);
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

    async deleteExpense(req: Request, res: Response) {
        try {
            const { expenseId } = req.params;
            const success = await expenseService.deleteExpense(parseInt(expenseId));
            return res.status(200).json(success);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getExpenseById(req: Request, res: Response) {
        try {
            const { roomId, expenseId } = req.params;
            const expense = await expenseService.getExpenseById(Number(roomId), Number(expenseId));
            return res.status(200).json(expense);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async updateExpense(req: Request, res: Response) {
        try {
            const { roomId, expenseId } = req.params;
            const { userId, amount } = req.body;
            const expense = await expenseService.updateExpense(Number(roomId), Number(expenseId), Number(userId), Number(amount));
            return res.status(200).json(expense);
        } catch (error) {
            return errorHandler(error, req, res);
        }

    }

    async settleExpense(req: Request, res: Response) {
        try {
            const { expenseId } = req.params;
            const success = await expenseService.settleExpense(Number(expenseId));
            return res.status(200).json(success);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

}

export default ExpenseController;
