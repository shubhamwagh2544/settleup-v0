export type AccountType = 'saving' | 'current';

type AccountStatus = 'active' | 'inactive' | 'suspended';

export type Account = {
    id: number;
    accountName: string;
    accountType: AccountType;
    status: AccountStatus;
    balance: number;
    lastLoginAt?: string | null; // Using string to store DateTime as ISO format
    failedLoginAttempts?: number;
    verificationToken?: string | null;
    resetPasswordToken?: string | null;
    resetPasswordExpires?: string | null;
    twoFactorSecret?: string | null;
    createdAt: string; // Date stored as ISO string
    updatedAt: string;
    userId: number;
};
