import { Room } from '../room/RoomTypes';
import { UserExpense } from '../user-expense/UserExpenseTypes';
import { Transaction } from '../transaction/TransactionTypes';

export interface Expense {
    id: number;
    name: string;
    description?: string | null;
    amount: number;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    roomId: number;
    room: Room;
    users?: UserExpense[];
    transactions?: Transaction[];
}
