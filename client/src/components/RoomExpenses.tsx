import { Button } from '@/components/ui/button.tsx';
import { get } from 'lodash';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import BACKEND_URL from '@/config.ts';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function RoomExpenses() {
    const { roomId } = useParams();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loggedInUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/expense/room/${roomId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                setExpenses(response.data);
            } catch (err) {
                console.error(err);
                setError('Error fetching expenses');
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [roomId]);

    async function deleteExpense(expenseId: number) {
        try {
            const response = await axios.delete(`${BACKEND_URL}/expense/${expenseId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
            if (response?.data.includes('Delete Successful') && response?.status === 200) {
                console.log(`${response.data} for expense Id: `, expenseId);
                toast.success('Expense Deleted');
                setExpenses(expenses.filter((exp: any) => exp.id !== expenseId));
            }
        } catch (error: AxiosError | any) {
            console.log(error);
            if (error.status === 409 || error.status === 404) {
                toast.error(`${error.response.data.message}`)
            } else {
                console.error('Error deleting expense with expense ID', expenseId);
                toast.error('Error deleting expense');
            }
        }
    }

    async function handlePayExpense() {
        console.log('payment initiated');
    }

    if (loading) {
        return <div className="p-4">Loading expenses...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Room Expenses</h1>
            {expenses.length === 0 ? (
                <p>No expenses found.</p>
            ) : (
                <ul className="list-disc list-inside">
                    {expenses.map((expense: any) => {
                        const lender = expense.users.find((user: any) => user.isLender);
                        const borrowers = expense.users.filter((user: any) => !user.isLender);
                        const isLender = lender?.id === Number(loggedInUserId);

                        return (
                            <li key={expense.id} className="mb-4 p-4 border rounded-lg shadow-sm bg-gray-100">
                                <div className="font-semibold">{get(expense, 'name', 'N/A')}</div>
                                <div>{get(expense, 'description', 'N/A')}</div>
                                <div className="text-gray-500">Amount: ${get(expense, 'amount', 'N/A')}</div>
                                <div className="text-gray-500">Lender: {lender?.fullName}</div>
                                <div className="text-gray-500">Borrowers:</div>
                                <ul className="list-disc list-inside ml-4">
                                    {borrowers.map((borrower: any) => {
                                        const isBorrower = borrower.userId === Number(loggedInUserId);
                                        return (
                                            <li key={borrower.userId} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border">
                                                <span className="text-gray-700 font-medium">
                                                    {borrower.fullName} owes <span className="text-red-500 font-bold">${borrower.amountOwed}</span>
                                                </span>
                                                {isBorrower && (
                                                    <Button
                                                        variant="outline"
                                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-200"
                                                        onClick={handlePayExpense}
                                                    >
                                                        Pay Expense
                                                    </Button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>

                                {isLender && (
                                    <Button
                                        variant="destructive"
                                        className="mt-2"
                                        onClick={() => deleteExpense(expense.id)}
                                    >
                                        Delete Expense
                                    </Button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
