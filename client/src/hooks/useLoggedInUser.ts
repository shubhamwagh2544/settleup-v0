import { useEffect, useState } from 'react';
import api from '@/apis/axios.ts';

export function useLoggedInUser() {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await api.get(`/auth/me`);
                setUser(response.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUser()
            .then(() => console.log('logged in user fetched successfully'))
            .catch((error) => console.error('error fetching logged in user', error));
    }, []);

    return { user, loading, error };
}
