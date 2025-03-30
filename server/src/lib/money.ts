export const formatMoney = (amount: number | string): string => {
    return Number(amount).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export const parseMoney = (amount: string): number => {
    return Number(amount.replace(/[$,]/g, ''));
};

export const roundMoney = (amount: number): number => {
    return Math.round(amount * 100) / 100;
};

export const splitMoney = (amount: number, parts: number): number => {
    return roundMoney(amount / parts);
};
