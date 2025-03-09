import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import BACKEND_URL from '@/config.ts';
import { get, isNil } from 'lodash';
import { Account } from '@/types/Account.ts';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PersonalAccount() {
    const { accountId } = useParams();  // Get account ID from URL
    const [account, setAccount] = useState<Account>();
    const [loading, setLoading] = useState(true);
    const [isAddMoneyDialogOpen, setIsAddMoneyDialogOpen] = useState(false);
    const [amount, setAmount] = useState('');
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

    async function handleDeposit() {
        const depositAmount = parseFloat(amount);

        if (!amount || isNaN(depositAmount) || depositAmount <= 0) {
            toast.error('Enter a valid deposit amount');
            return;
        }

        try {
            const response = await axios.post(
                `${BACKEND_URL}/account/${accountId}/user/${userId}/deposit`,
                { amount: depositAmount },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (response.status === 200 && !isNil(response.data.balance)) {
                toast.success('Money deposited successfully');
                setIsAddMoneyDialogOpen(false);
                setAmount('');

                setAccount((prev) => prev ? { ...prev, balance: parseFloat(response.data.balance.toFixed(2)) } : prev);
            } else {
                toast.error('Unexpected response from server');
            }
        } catch (error: AxiosError | any) {
            console.error('Error depositing money:', error);

            const errorMessage = error.response?.data?.message || 'Failed to deposit money';
            toast.error(errorMessage);
        }
    }

    async function handleSendMoney() {

    }
    async function handleViewTransactions() {

    }

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
                <CardFooter className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                        <Button variant="default" onClick={() => setIsAddMoneyDialogOpen(true)}>
                            Add Money
                        </Button>
                        <Button variant="default" onClick={handleSendMoney}>
                            Send Money
                        </Button>
                    </div>

                    <div className="flex flex-row gap-2">
                        <Button variant="default" onClick={handleViewTransactions}>
                            View Transactions
                        </Button>
                        <Button variant="secondary" onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <Dialog open={isAddMoneyDialogOpen} onOpenChange={setIsAddMoneyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Money</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Label htmlFor="amount">Amount to Deposit</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="default" onClick={handleDeposit}>
                            Add
                        </Button>
                        <Button variant="secondary" onClick={() => {
                            setAmount('');
                            setIsAddMoneyDialogOpen(false)
                        }}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
