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
    Trash2,
    Search,
    CheckCircle,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

interface RecipientAccount {
    id: number;
    accountNumber: string;
    accountName: string;
    user: {
        firstName: string;
        lastName: string;
    };
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
    const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [recipientAccounts, setRecipientAccounts] = useState<RecipientAccount[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<RecipientAccount | null>(null);
    const [isSearching, setIsSearching] = useState(false);

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
        if (!selectedRecipient || !amount) {
            toast.error('Please select a recipient and enter an amount');
            return;
        }

        const sendAmount = parseFloat(amount);
        if (isNaN(sendAmount) || sendAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            const response = await axios.post(
                `${BACKEND_URL}/account/${accountId}/transfer`,
                {
                    recipientAccountNumber: selectedRecipient.accountNumber,
                    amount: sendAmount
                },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );

            if (response.status === 200) {
                toast.success('Money sent successfully');
                setIsSendMoneyDialogOpen(false);
                setAmount('');
                setSearchTerm('');
                setSelectedRecipient(null);

                // Update account balance
                setAccount((prev) => prev ? { ...prev, balance: parseFloat(response.data.balance.toFixed(2)) } : prev);

                // Refresh transactions
                const transactionsResponse = await axios.get(
                    `${BACKEND_URL}/account/${accountId}/transactions`,
                    { headers: { Authorization: `Bearer ${getToken()}` } }
                );
                setTransactions(transactionsResponse.data);
            }
        } catch (error: AxiosError | any) {
            const errorMessage = error.response?.data?.message || 'Failed to send money';
            toast.error(errorMessage);
        }
    }

    async function handleDeleteAccount() {
        try {
            const response = await axios.delete(
                `${BACKEND_URL}/account/${accountId}`,
                {
                    headers: { Authorization: `Bearer ${getToken()}` }
                }
            );

            if (response.status === 200) {
                toast.success('Account deleted successfully');
                navigate('/main-room');
            }
        } catch (error: AxiosError | any) {
            if (error.response?.status === 409) {
                toast.error('Cannot delete account with pending transactions');
            } else {
                toast.error('Failed to delete account');
            }
        }
    }

    const searchRecipients = async (term: string) => {
        if (!term) {
            setRecipientAccounts([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.get(
                `${BACKEND_URL}/account/search?term=${term}&excludeId=${accountId}`,
                {
                    headers: { Authorization: `Bearer ${getToken()}` }
                }
            );
            setRecipientAccounts(response.data);
        } catch (error) {
            console.error('Error searching recipients:', error);
            toast.error('Failed to search recipients');
        } finally {
            setIsSearching(false);
        }
    };

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
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setIsDeleteAccountDialogOpen(true)}
                        className="h-8 w-8 bg-red-500 hover:bg-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Account Overview Card */}
                    <Card className="lg:col-span-1 bg-gradient-to-br from-background to-muted/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Wallet className="h-5 w-5 text-primary" />
                                    <CardTitle>Account Overview</CardTitle>
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
                <DialogContent className="sm:max-w-[500px] p-0 gap-0">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl">Send Money</DialogTitle>
                        <DialogDescription>
                            Search for recipient by account number or name
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4 space-y-6">
                        {/* Recipient Search Section */}
                        <div className="space-y-4">
                            <Label>Search Recipient</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Enter account number or name..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        searchRecipients(e.target.value);
                                    }}
                                    className="pl-9"
                                />
                            </div>

                            {/* Recipients List */}
                            <ScrollArea className="h-[200px] rounded-md border">
                                {isSearching ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                ) : recipientAccounts.length > 0 ? (
                                    <div className="p-4 space-y-2">
                                        {recipientAccounts.map((recipient) => (
                                            <div
                                                key={recipient.id}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                                                    selectedRecipient?.id === recipient.id
                                                        ? "bg-primary/10 border-primary"
                                                        : "hover:bg-accent"
                                                )}
                                                onClick={() => setSelectedRecipient(recipient)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        {recipient.user.firstName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {recipient.user.firstName} {recipient.user.lastName}
                                                        </p>
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <p>{recipient.accountName}</p>
                                                            <span className="mx-2">•</span>
                                                            <p>{recipient.accountNumber}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {selectedRecipient?.id === recipient.id && (
                                                    <CheckCircle className="h-4 w-4 text-primary" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : searchTerm ? (
                                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                        <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm text-muted-foreground">No recipients found</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                        <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Search for recipients by account number or name
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        {/* Amount Section */}
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Transfer Summary */}
                        {selectedRecipient && amount && (
                            <div className="rounded-lg border p-4 space-y-3">
                                <h4 className="font-medium">Transfer Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">To</span>
                                        <span className="font-medium">
                                            {selectedRecipient.user.firstName} {selectedRecipient.user.lastName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount</span>
                                        <span className="font-medium">${Number(amount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAmount('');
                                    setSearchTerm('');
                                    setSelectedRecipient(null);
                                    setIsSendMoneyDialogOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSendMoney}
                                disabled={!selectedRecipient || !amount || Number(amount) <= 0}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                <SendHorizontal className="h-4 w-4 mr-2" />
                                Send Money
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 gap-0">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl text-red-600">Delete Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this account? This action cannot be undone.
                            {account.status === 'active' && (
                                <>
                                    {Number(account.balance) > 0 && (
                                        <p className="mt-2 text-red-500">
                                            Warning: This account has a balance of ${Number(account.balance).toFixed(2)}.
                                            Please withdraw or transfer all funds before deletion.
                                        </p>
                                    )}
                                    <p className="mt-2 text-red-500">
                                        Note: You cannot delete an account with pending transactions.
                                        Please ensure all transactions are settled before deletion.
                                    </p>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteAccountDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    await handleDeleteAccount();
                                    setIsDeleteAccountDialogOpen(false);
                                }}
                                className="bg-red-500 hover:bg-red-600"
                                disabled={Number(account.balance) > 0}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Account
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
