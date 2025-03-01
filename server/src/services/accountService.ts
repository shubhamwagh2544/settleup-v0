import { isNil } from 'lodash';

class AccountService {
    private static instance: AccountService;

    private constructor() {}

    public static getInstance(): AccountService {
        if (isNil(AccountService.instance)) {
            AccountService.instance = new AccountService();
        }
        return AccountService.instance;
    }

    async createAccount(userId: number) {
        return {
            userId,
        }
    }

}

export default AccountService;
