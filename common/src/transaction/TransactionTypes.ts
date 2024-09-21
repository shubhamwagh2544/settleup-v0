import { TransactionStatus, TransactionType } from '../enums/CommonEnums';
import { Account } from '../account/AccountTypes';
import { User } from '../user/UserTypes';
import { Expense } from '../expense/ExpenseTypes';

export interface Transaction {
    id: number;
    amount: number;
    type: TransactionType;
    description?: string | null;
    createdAt: Date;
    status: TransactionStatus;

    // Relations
    senderAccountId?: number | null;
    senderAccount?: Account | null;
    receiverAccountId?: number | null;
    receiverAccount?: Account | null;
    senderId?: number | null;
    sender?: User | null;
    receiverId?: number | null;
    receiver?: User | null;
    expenseId?: number | null;
    expense?: Expense | null;
}
