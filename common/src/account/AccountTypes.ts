import { User } from '../user/UserTypes';
import { Transaction } from '../transaction/TransactionTypes';

export interface Account {
    id: number;
    accountType: string;
    status: string;
    balance: number;
    lastLoginAt?: Date | null;
    failedLoginAttempts?: number | null;
    verificationToken?: string | null;
    resetPasswordToken?: string | null;
    resetPasswordExpires?: Date | null;
    twoFactorSecret?: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    userId: number;
    user: User;
    sentTransactions?: Transaction[];
    receivedTransactions?: Transaction[];
}
