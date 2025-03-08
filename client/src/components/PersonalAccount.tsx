import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BACKEND_URL from '@/config.ts';
import { get } from 'lodash';
import { Account } from '@/types/Account.ts';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PersonalAccount() {
    const { accountId } = useParams();  // Get account ID from URL
    const [account, setAccount] = useState<Account>();
    const [loading, setLoading] = useState(true);
    const userId = get(location, 'state.userId') || localStorage.getItem('userId') || null;

    useEffect(() => {
        async function fetchAccount() {
            try {
                const response = await axios.get<Account>(`${BACKEND_URL}/account/${accountId}/user/${userId}`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
                });
                setAccount(response.data);
            } catch (error) {
                console.error('Error fetching account details:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAccount();
    }, [accountId]);

    if (loading) return <p className="text-center text-gray-500">Loading account details...</p>;
    if (!account) return <p className="text-center text-red-500">Account not found.</p>;

    return (
        <div className="flex p-2 m-2">
            <Card className="w-96 shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-lg font-medium">{account.accountName}</p>
                    <p className="text-gray-600">Type: <span className="font-semibold">{account.accountType}</span></p>
                    <p className="text-gray-600">Balance: <span className="font-semibold">${account.balance}</span></p>
                    <p className={`text-sm font-semibold ${account.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                        Status: {account.status}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button variant="secondary" onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
