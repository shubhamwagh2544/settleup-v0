import { User } from '../user/UserTypes';
import { Expense } from '../expense/ExpenseTypes';

export interface UserExpense {
    id: number;
    userId: number;
    expenseId: number;
    isLender: boolean;
    amountOwed?: number | null;

    // Relations
    user: User;
    expense: Expense;
}
