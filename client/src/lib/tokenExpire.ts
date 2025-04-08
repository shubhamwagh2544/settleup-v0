import { AxiosError } from 'axios';

export function checkIfTokenExpired(error: AxiosError | Error | any) {
    if (error.status === 401 && error?.response?.data) {
        const message: string = error.response.data.error;
        if (message.includes('jwt expired')) {
            return true;
        }
    }
    return false;
}
