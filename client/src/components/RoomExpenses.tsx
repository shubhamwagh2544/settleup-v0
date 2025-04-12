import { Button } from '@/components/ui/button';
import { find, get, isEmpty } from 'lodash';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import BACKEND_URL from '@/config';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Receipt, Wallet, DollarSign, Trash2, CreditCard, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function RoomExpenses() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [room, setRoom] = useState(null);

    const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
    const loggedInUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [expensesResponse, roomResponse] = await Promise.all([
                    axios.get(`${BACKEND_URL}/expense/room/${roomId}`, {
                        headers: { Authorization: `Bearer ${getToken()}` },
                    }),
                    axios.get(`${BACKEND_URL}/room/${roomId}`, {
                        headers: { Authorization: `Bearer ${getToken()}` },
                    }),
                ]);

                setExpenses(expensesResponse.data);
                setRoom(roomResponse.data);
            } catch (err) {
                console.error(err);
                setError('Error fetching data');
                toast.error('Failed to load expenses');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomId]);

    async function deleteExpense(expenseId: number) {
        try {
            const response = await axios.delete(`${BACKEND_URL}/expense/${expenseId}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            if (response?.data.includes('Delete Successful') && response?.status === 200) {
                toast.success('Expense deleted successfully');
                setExpenses(expenses.filter((exp: any) => exp.id !== expenseId));
            }
        } catch (error: AxiosError | any) {
            if (error.status === 409 || error.status === 404) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to delete expense');
            }
        }
    }

    function handlePayExpense(expense: any) {
        setSelectedExpense(expense);
        setIsPaymentDialogOpen(true);
    }

    const filteredExpenses = expenses.filter(
        (expense: any) =>
            expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
                <Receipt className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-500">Error Loading Expenses</h2>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    // @ts-ignore
    // @ts-ignore
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/room/${roomId}`)}
                            className="hover:bg-purple-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{get(room, 'name', 'Room')} Expenses</h1>
                            <p className="text-muted-foreground">Track and manage shared expenses</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Expenses List */}
                <Card className="bg-gradient-to-br from-background to-muted/50">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Receipt className="h-5 w-5 text-primary" />
                            <CardTitle>All Expenses</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                            {isEmpty(filteredExpenses) ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Receipt className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                    <p className="text-muted-foreground">No expenses found</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    <div className="space-y-4">
                                        {filteredExpenses.map((expense: any) => {
                                            const lender = expense.users.find((user: any) => user.isLender);
                                            const borrowers = expense.users.filter((user: any) => !user.isLender);
                                            const isLender = lender?.id === Number(loggedInUserId);
                                            // const userBorrower = borrowers.find((b: any) => b.userId === Number(loggedInUserId));

                                            return (
                                                <motion.div
                                                    key={expense.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className="bg-white rounded-lg shadow-sm border p-6 space-y-4"
                                                >
                                                    {/* Expense Header */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <h3 className="text-lg font-semibold">{expense.name}</h3>
                                                            {expense.description && (
                                                                <p className="text-muted-foreground">
                                                                    {expense.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant="outline">
                                                                    <DollarSign className="h-3 w-3 mr-1" />$
                                                                    {expense.amount}
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    <Users className="h-3 w-3 mr-1" />
                                                                    {borrowers.length + 1} members
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        {isLender && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => deleteExpense(expense.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <Separator />

                                                    {/* Lender Info */}
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                                                            <Wallet className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Paid by</p>
                                                            <p className="font-medium">{lender?.fullName}</p>
                                                        </div>
                                                    </div>

                                                    {/* Borrowers List */}
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium">Split with</p>
                                                        {borrowers.map((borrower: any) => {
                                                            const isBorrower =
                                                                borrower.userId === Number(loggedInUserId);
                                                            return (
                                                                <div
                                                                    key={borrower.userId}
                                                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                                                                            {borrower.fullName.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium">
                                                                                {borrower.fullName}
                                                                            </p>
                                                                            <p className="text-sm text-red-500 font-semibold">
                                                                                Owes ${borrower.amountOwed}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {isBorrower && (
                                                                        <Button
                                                                            onClick={() => handlePayExpense(expense)}
                                                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                                                        >
                                                                            <CreditCard className="h-4 w-4 mr-2" />
                                                                            Pay Now
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </AnimatePresence>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-gradient-to-br from-background to-muted/50">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl">Payment Details</DialogTitle>
                        <DialogDescription>Review and confirm your payment</DialogDescription>
                    </DialogHeader>

                    {selectedExpense && (
                        <div className="px-6 py-4 space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Expense</p>
                                <p className="font-medium text-lg">{get(selectedExpense, 'name')}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                                <p className="text-2xl font-bold text-primary">
                                    $
                                    {
                                        find(
                                            get(selectedExpense, 'users'),
                                            (u: any) => u.userId === Number(loggedInUserId)
                                        )?.amountOwed
                                    }
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Payment Method</p>
                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <p className="font-medium">Credit/Debit Card</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                onClick={() => {
                                    toast.success('Payment initiated successfully');
                                    setIsPaymentDialogOpen(false);
                                }}
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Confirm Payment
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
