import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import BACKEND_URL from '@/config';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    DollarSign,
    Users,
    CalendarDays,
    Receipt,
    Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExpenseUser {
    id: string;
    fullName: string;
    isLender: boolean;
    amount: number;
}

interface Expense {
    id: string;
    name: string;
    description?: string;
    amount: number;
    date: string;
    users: ExpenseUser[];
}

export default function PersonalExpense() {
    const { expenseId } = useParams();
    const navigate = useNavigate();
    const [expense, setExpense] = useState<Expense | null>(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

    useEffect(() => {
        async function fetchExpense() {
            try {
                const response = await axios.get<Expense>(`${BACKEND_URL}/expense/${expenseId}`, {
                    headers: { "Authorization": `Bearer ${getToken()}` }
                });
                setExpense(response.data);
            } catch (error) {
                console.error('Error fetching expense details:', error);
                toast.error('Failed to load expense details');
            } finally {
                setLoading(false);
            }
        }
        fetchExpense();
    }, [expenseId]);

    async function handleDeleteExpense() {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;

        try {
            await axios.delete(`${BACKEND_URL}/expense/${expenseId}`, {
                headers: { "Authorization": `Bearer ${getToken()}` }
            });
            toast.success('Expense deleted successfully');
            navigate(-1);
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Failed to delete expense');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
            </div>
        );
    }

    if (!expense) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
                <Receipt className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-500">Expense Not Found</h2>
                <p className="text-muted-foreground mt-2">The requested expense could not be found.</p>
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="mt-4"
                >
                    Go Back
                </Button>
            </div>
        );
    }

    const lender = expense.users.find(user => user.isLender);
    const borrowers = expense.users.filter(user => !user.isLender);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="hover:bg-purple-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {expense.name}
                            </h1>
                            {expense.description && (
                                <p className="text-muted-foreground">
                                    {expense.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleDeleteExpense}
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Expense Overview Card */}
                    <Card className="bg-gradient-to-br from-background to-muted/50">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Receipt className="h-5 w-5 text-primary" />
                                <CardTitle>Expense Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Amount</span>
                                    <Badge variant="outline" className="text-lg">
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        {expense.amount.toFixed(2)}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Date</span>
                                    <Badge variant="outline">
                                        <CalendarDays className="h-4 w-4 mr-1" />
                                        {new Date(expense.date).toLocaleDateString()}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Participants</span>
                                    <Badge variant="outline">
                                        <Users className="h-4 w-4 mr-1" />
                                        {expense.users.length}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-medium">Paid by</h3>
                                {lender && (
                                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                                            {lender.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{lender.fullName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Paid ${lender.amount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Borrowers Card */}
                    <Card className="bg-gradient-to-br from-background to-muted/50">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-primary" />
                                <CardTitle>Split Details</CardTitle>
                            </div>
                            <CardDescription>
                                How the expense is split between participants
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-4">
                                    {borrowers.map((borrower) => (
                                        <motion.div
                                            key={borrower.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-lg border bg-card"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center">
                                                        {borrower.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{borrower.fullName}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Owes ${borrower.amount.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
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