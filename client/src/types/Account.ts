export type AccountType = 'saving' | 'current';

type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface Account {
    id: string;
    accountName: string;
    accountType: string;
    balance: number;
    status: string;
    expenses: Array<{
        id: string;
        name: string;
        description?: string;
        amount: number;
        date: string;
        type: 'personal' | 'group';
    }>;
    lastLoginAt?: string | null; // Using string to store DateTime as ISO format
    failedLoginAttempts?: number;
    verificationToken?: string | null;
    resetPasswordToken?: string | null;
    resetPasswordExpires?: string | null;
    twoFactorSecret?: string | null;
    createdAt: string; // Date stored as ISO string
    updatedAt: string;
    userId: number;
}
