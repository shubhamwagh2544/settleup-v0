import { UserRoom } from '../user-room/UserRoomTypes';
import { UserExpense } from '../user-expense/UserExpenseTypes';
import { Account } from '../account/AccountTypes';
import { Transaction } from '../transaction/TransactionTypes';

export interface User {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    password: string;
    phoneNumber?: string | null;
    address?: string | null;
    profilePic?: string | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    mfaEnabled?: boolean | null;
    defaultLang?: string | null;
    isAdmin: boolean;
    isPrivate?: boolean | null;

    // Relationships
    rooms?: UserRoom[];
    userExpenses?: UserExpense[];
    accounts?: Account[];
    sentTransactions?: Transaction[];
    receivedTransactions?: Transaction[];
}
