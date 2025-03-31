import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import BACKEND_URL from '@/config';
import { isEmpty, isNil } from 'lodash';
import { Account } from '@/types/Account';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    ArrowDownRight,
    ArrowLeft,
    ArrowUpRight,
    Building,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    DollarSign,
    History,
    PlusCircle,
    Receipt,
    SendHorizontal,
    Wallet,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Transaction {
    id: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'EXPENSE_SETTLEMENT';
    amount: number;
    description: string;
    status: 'COMPLETED' | 'FAILED';
    createdAt: string;
    senderId: number;
    receiverId: number;
    senderAccountId: number;
    receiverAccountId: number | null;
}

export default function PersonalAccount() {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddMoneyDialogOpen, setIsAddMoneyDialogOpen] = useState(false);
    const [isSendMoneyDialogOpen, setIsSendMoneyDialogOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

    useEffect(() => {
        async function fetchAccount() {
            try {
                const response = await axios.get<Account>(`${BACKEND_URL}/account/${accountId}/user/${userId}`, {
                    headers: { "Authorization": `Bearer ${getToken()}` }
                });
                setAccount(response.data);
            } catch (error) {
                console.error('Error fetching account details:', error);
                toast.error('Failed to load account details');
            } finally {
                setLoading(false);
            }
        }

        fetchAccount();
    }, [accountId, userId]);

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const response = await axios.get(`${BACKEND_URL}/account/${accountId}/transactions`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                setTransactions(response.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                toast.error('Failed to load transactions');
            }
        }

        if (accountId) {
            fetchTransactions();
        }
    }, [accountId, userId]);

    async function handleDeposit() {
        const depositAmount = parseFloat(amount);

        if (!amount || isNaN(depositAmount) || depositAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            const response = await axios.post(
                `${BACKEND_URL}/account/${accountId}/user/${userId}/deposit`,
                { amount: depositAmount },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );

            if (response.status === 200 && !isNil(response.data.balance)) {
                toast.success('Money added successfully');
                setIsAddMoneyDialogOpen(false);
                setAmount('');

                // Update account balance
                setAccount((prev) => prev ? { ...prev, balance: parseFloat(response.data.balance.toFixed(2)) } : prev);

                // Refresh transactions
                const transactionsResponse = await axios.get(`${BACKEND_URL}/account/${accountId}/transactions`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                setTransactions(transactionsResponse.data);
            }
        } catch (error: AxiosError | any) {
            const errorMessage = error.response?.data?.message || 'Failed to add money';
            toast.error(errorMessage);
        }
    }

    async function handleSendMoney() {
        const sendAmount = parseFloat(amount);

        if (!amount || isNaN(sendAmount) || sendAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!recipientEmail) {
            toast.error('Please enter recipient email');
            return;
        }

        try {
            const response = await axios.post(
                `${BACKEND_URL}/account/${accountId}/transfer`,
                {
                    amount: sendAmount,
                    recipientEmail: recipientEmail
                },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );

            if (response.status === 200) {
                toast.success('Money sent successfully');
                setIsSendMoneyDialogOpen(false);
                setAmount('');
                setRecipientEmail('');

                // Update account balance
                setAccount((prev) => prev ? { ...prev, balance: parseFloat(response.data.balance.toFixed(2)) } : prev);

                // Refresh transactions
                const transactionsResponse = await axios.get(`${BACKEND_URL}/account/${accountId}/transactions`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                setTransactions(transactionsResponse.data);
            }
        } catch (error: AxiosError | any) {
            const errorMessage = error.response?.data?.message || 'Failed to send money';
            toast.error(errorMessage);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-500">Account Not Found</h2>
                <p className="text-muted-foreground mt-2">The requested account could not be found.</p>
                <Button
                    variant="outline"
                    onClick={() => navigate('/main-room')}
                    className="mt-4"
                >
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/main-room')}
                            className="hover:bg-purple-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {account.accountName}
                            </h1>
                            <p className="text-muted-foreground">
                                Manage your {account.accountType.toLowerCase()} account
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant={account.status === 'active' ? 'default' : 'destructive'}
                        className="text-sm"
                    >
                        {account.status === 'active' ? (
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                        ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </Badge>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Account Overview Card */}
                    <Card className="lg:col-span-1 bg-gradient-to-br from-background to-muted/50">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Wallet className="h-5 w-5 text-primary" />
                                <CardTitle>Account Overview</CardTitle>
                            </div>
                            <CardDescription>Your account details and balance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Current Balance</p>
                                <div className="flex items-baseline space-x-2">
                                    <h2 className="text-4xl font-bold text-primary">
                                        ${typeof account.balance === 'string'
                                            ? parseFloat(account.balance).toFixed(2)
                                            : account.balance.toFixed(2)}
                                    </h2>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">Account Type</p>
                                    <Badge variant="outline" className="capitalize">
                                        {account.accountType === 'saving' ? (
                                            <Building className="h-3 w-3 mr-1" />
                                        ) : (
                                            <CreditCard className="h-3 w-3 mr-1" />
                                        )}
                                        {account.accountType}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">Created On</p>
                                    <Badge variant="outline">
                                        {new Date(account.createdAt).toLocaleDateString()}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">Last Updated</p>
                                    <Badge variant="outline">
                                        {new Date(account.updatedAt).toLocaleDateString()}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <Button
                                    onClick={() => setIsAddMoneyDialogOpen(true)}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Money
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSendMoneyDialogOpen(true)}
                                >
                                    <SendHorizontal className="h-4 w-4 mr-2" />
                                    Send Money
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transactions Card */}
                    <Card className="lg:col-span-2 bg-gradient-to-br from-background to-muted/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <History className="h-5 w-5 text-primary" />
                                    <CardTitle>Transaction History</CardTitle>
                                </div>
                            </div>
                            <CardDescription>Your recent account transactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                {isEmpty(transactions) ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <History className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                        <p className="text-muted-foreground">No transactions found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transactions.map((transaction) => (
                                            <motion.div
                                                key={transaction.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <h3 className="font-medium">
                                                                {transaction.description}
                                                            </h3>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant="outline">
                                                                    {transaction.type === 'DEPOSIT' ? (
                                                                        <ArrowDownRight className="h-3 w-3 mr-1 text-green-500" />
                                                                    ) : transaction.type === 'WITHDRAWAL' ? (
                                                                        <ArrowUpRight className="h-3 w-3 mr-1 text-red-500" />
                                                                    ) : (
                                                                        <Receipt className="h-3 w-3 mr-1 text-purple-500" />
                                                                    )}
                                                                    {transaction.type}
                                                                </Badge>
                                                                <Badge variant={transaction.status === 'COMPLETED' ? 'success' : 'destructive'}>
                                                                    {transaction.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant={transaction.type === 'DEPOSIT' ? 'success' : 'destructive'}
                                                            className="text-lg"
                                                        >
                                                            {transaction.type === 'DEPOSIT' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                        <CalendarDays className="h-4 w-4" />
                                                        <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Money Dialog */}
            <Dialog open={isAddMoneyDialogOpen} onOpenChange={setIsAddMoneyDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-gradient-to-br from-background to-muted/50">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl">Add Money</DialogTitle>
                        <DialogDescription>
                            Add funds to your account
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAmount('');
                                    setIsAddMoneyDialogOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeposit}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Money
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Money Dialog */}
            <Dialog open={isSendMoneyDialogOpen} onOpenChange={setIsSendMoneyDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-gradient-to-br from-background to-muted/50">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl">Send Money</DialogTitle>
                        <DialogDescription>
                            Transfer money to another account
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="recipientEmail">Recipient Email</Label>
                            <Input
                                id="recipientEmail"
                                type="email"
                                placeholder="Enter recipient's email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sendAmount">Amount</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="sendAmount"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAmount('');
                                    setRecipientEmail('');
                                    setIsSendMoneyDialogOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSendMoney}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                <SendHorizontal className="h-4 w-4 mr-2" />
                                Send Money
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
