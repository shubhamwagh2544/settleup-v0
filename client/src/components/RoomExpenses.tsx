import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BACKEND_URL from '@/config.ts';
import { get } from 'lodash';

export default function RoomExpenses() {
    const { roomId } = useParams();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/expense/room/${roomId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                console.log(response)
                setExpenses(response.data);
            } catch (err) {
                console.log(error)
                setError('Error fetching expenses');
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [roomId]);

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
                    {expenses.map((expense: any) => (
                        <li key={get(expense, 'id', 'N/A')} className="mb-2">
                            <div className="font-semibold">{get(expense, 'name', 'N/A')}</div>
                            <div>{get(expense, 'description', 'N/A')}</div>
                            <div className="text-gray-500">Amount: ${get(expense, 'amount', 'N/A')}</div>
                            <div className="text-gray-500">Lender: {expense.users.find((user: any) => user.isLender).userId}</div>
                            <div className="text-gray-500">Borrowers:</div>
                            <ul className="list-disc list-inside ml-4">
                                {expense.users.filter((user: any) => !user.isLender).map((borrower: any) => (
                                    <li key={borrower.userId}>
                                        User {borrower.userId} owes ${borrower.amountOwed}
                                        <a href={`/pay/${borrower.userId}/${expense.id}`} className="text-blue-500 ml-2">Pay</a>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}