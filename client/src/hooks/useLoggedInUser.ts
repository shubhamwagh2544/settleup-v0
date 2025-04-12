import { useState, useEffect } from 'react';
import axios from 'axios';
import BACKEND_URL from '@/config.ts';

export function useLoggedInUser() {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await axios.get(`${BACKEND_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
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
