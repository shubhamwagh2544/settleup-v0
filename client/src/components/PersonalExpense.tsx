import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import BACKEND_URL from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, Receipt, Trash2, Users, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExpenseUser {
    userId: number;
    expenseId: number;
    isLender: boolean;
    isSettled: boolean;
    amountOwed: number;
    fullName: string;
    email: string;
}

interface Expense {
    id: number;
    name: string;
    description?: string;
    amount: number;
    isSettled: boolean;
    createdAt: string;
    users: ExpenseUser[];
}

export default function PersonalExpense() {
    const { roomId, expenseId } = useParams();
    const navigate = useNavigate();
    const [expense, setExpense] = useState<Expense | null>(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

    useEffect(() => {
        async function fetchExpense() {
            try {
                const response = await axios.get(`${BACKEND_URL}/expense/room/${roomId}/expense/${expenseId}`, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                setExpense(response.data);
            } catch (error) {
                console.error('Error fetching expense:', error);
                toast.error('Failed to load expense details');
            } finally {
                setLoading(false);
            }
        }

        fetchExpense();
    }, [expenseId, roomId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!expense) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">Expense Not Found</h2>
                <Button variant="outline" onClick={() => navigate(`/room/${roomId}`)} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    const lender = expense.users.find((user) => user.isLender);
    const borrowers = expense.users.filter((user) => !user.isLender);
    const isLender = lender?.userId === Number(userId);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{expense.name}</h1>
                            {expense.description && <p className="text-muted-foreground">{expense.description}</p>}
                        </div>
                    </div>
                    {isLender && (
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Expense Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Receipt className="h-5 w-5" />
                                <span>Expense Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Amount</span>
                                <Badge variant="outline" className="text-lg">
                                    ${expense.amount}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Date</span>
                                <Badge variant="outline">{new Date(expense.createdAt).toLocaleDateString()}</Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={expense.isSettled ? 'success' : 'secondary'}>
                                    {expense.isSettled ? (
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                    ) : (
                                        <XCircle className="h-4 w-4 mr-1" />
                                    )}
                                    {expense.isSettled ? 'Settled' : 'Pending'}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-medium">Paid by</h3>
                                <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        {lender?.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium">{lender?.fullName}</p>
                                        <p className="text-sm text-muted-foreground">{lender?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Borrowers Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Split Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-4">
                                    {borrowers.map((borrower) => (
                                        <motion.div
                                            key={borrower.userId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-lg border"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        {borrower.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{borrower.fullName}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {borrower.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant={borrower.isSettled ? 'success' : 'destructive'}>
                                                    ${borrower.amountOwed}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
