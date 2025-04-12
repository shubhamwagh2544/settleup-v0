export const validateAccountNumber = (accountNumber: string): boolean => {
    // Remove environment prefix if present
    const number = accountNumber.replace('DEV', '');

    // Check length
    if (number.length !== 12) return false;

    // Check if all characters are digits
    if (!/^\d+$/.test(number)) return false;

    return true;
};

export const formatAccountNumber = (accountNumber: string): string => {
    // Format: XXXX-XXXX-XXXX
    const number = accountNumber.replace('DEV', '');
    return number.replace(/(\d{4})/g, '$1-').slice(0, -1);
};

export const restoreAccountNumber = (formattedAccountNumber: string): string => {
    return process.env.NODE_ENV === 'production'
        ? formattedAccountNumber.replace(/-/g, '')
        : `DEV${formattedAccountNumber.replace(/-/g, '')}`;
};
