import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BACKEND_URL from '@/config.ts';
import { get, isEmpty, isNil } from 'lodash';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function PersonalRoom() {
    const { roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [users, setUsers] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddUsersDialogOpen, setIsAddUsersDialogOpen] = useState(false);
    const [expenseName, setExpenseName] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    function createExpenseHandler() {
        setIsDialogOpen(true);
    }

    useEffect(() => {
        async function fetchRoom() {
            try {
                const response = await axios.get(`${BACKEND_URL}/rooms/${roomId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setRoom(response.data);
            } catch (error) {
                console.error('Error fetching room', error);
                toast.error('Error fetching room');
            }
        }

        async function fetchUsers() {
            try {
                const response = await axios.get(`${BACKEND_URL}/rooms/${roomId}/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
                toast.error('Error fetching users');
            }
        }

        async function fetchAllUsers() {
            try {
                const response = await axios.get(`${BACKEND_URL}/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setAllUsers(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
                toast.error('Error fetching users');
            }
        }

        fetchRoom();
        fetchUsers();

        if (isAddUsersDialogOpen) {
            fetchAllUsers();
        }
    }, [roomId, isAddUsersDialogOpen]);

    function handleDialogClose() {
        setIsDialogOpen(false);
        setExpenseName('');
        setExpenseDescription('');
        setExpenseAmount('');
    }

    async function handleAddUsers() {
        try {
            const response = await axios.post(
                `${BACKEND_URL}/rooms/${roomId}/users`,
                {
                    userIds: selectedUsers,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            const addedUsers = response.data;
            console.log('Added users', addedUsers);
            toast.success('Users added to the room');
            setIsAddUsersDialogOpen(false);
            setSelectedUsers([]);
        } catch (error) {
            console.error('Error adding users to room', error);
            toast.error('Error adding users to room');
        }
    }

    function handleCreateExpense() {
        console.log('Create expense', { expenseName, expenseDescription, expenseAmount });
        handleDialogClose();
    }

    if (isEmpty(room) || isNil(room)) {
        return <div>Room Loading...</div>;
    }

    return (
        <div className="p-4">
            <Card className="w-full h-full">
                <CardHeader>
                    <CardTitle>{get(room, 'name', 'Room')}</CardTitle>
                </CardHeader>
                <CardContent className="flex">
                    <div className="w-1/2 pr-4">
                        <h2 className="text-lg font-semibold mb-4">Expenses in this room</h2>
                        {/* logic to display expenses*/}
                        <p>No expenses found.</p>
                    </div>
                    <div className="w-1/2 pl-4">
                        <h2 className="text-lg font-semibold mb-4">Users in this room</h2>
                        {isEmpty(users) ? (
                            <p>No users found.</p>
                        ) : (
                            <ul className="list-disc list-inside">
                                {users.map((user) => (
                                    <li key={get(user, 'id', 'N/A')}>
                                        {get(user, 'firstName', 'N/A')} {get(user, 'lastName', 'N/A')}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </CardContent>
                <div className="p-4">
                    <Button variant={'default'} onClick={createExpenseHandler}>
                        Create Expense
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Expense</DialogTitle>
                                <DialogDescription>Fill in the details of the expense</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="expenseName">Expense Name</Label>
                                    <Input
                                        id="expenseName"
                                        value={expenseName}
                                        onChange={(e) => setExpenseName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="expenseDescription">Expense Description</Label>
                                    <Input
                                        id="expenseDescription"
                                        value={expenseDescription}
                                        onChange={(e) => setExpenseDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="expenseAmount">Expense Amount</Label>
                                    <Input
                                        id="expenseAmount"
                                        type="number"
                                        value={expenseAmount}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                    />
                                </div>
                                <p>Paid by You and Split equally with:</p>
                                <ul>
                                    {users
                                        .filter((user) => get(user, 'id') !== get(room, 'users[0].userId'))
                                        .map((user) => (
                                            <li key={get(user, 'id')}>
                                                {get(user, 'firstName')} {get(user, 'lastName')}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                            <DialogFooter>
                                <Button variant="default" onClick={handleCreateExpense}>
                                    Create
                                </Button>
                                <Button variant="secondary" onClick={handleDialogClose}>
                                    Cancel
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="p-4">
                    <Button variant={'default'} onClick={() => setIsAddUsersDialogOpen(true)}>
                        Add Users to Room
                    </Button>
                    <Dialog open={isAddUsersDialogOpen} onOpenChange={setIsAddUsersDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Users to Room</DialogTitle>
                                <DialogDescription>Select users to add to the room</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                {allUsers
                                    .filter((user) => get(user, 'id') !== get(room, 'users[0].userId'))
                                    .map((user) => (
                                        <div key={get(user, 'id')}>
                                            <Label htmlFor={`user-${get(user, 'id')}`}>
                                                <input
                                                    type="checkbox"
                                                    id={`user-${get(user, 'id')}`}
                                                    value={get(user, 'id')}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedUsers([...selectedUsers, get(user, 'id')]);
                                                        } else {
                                                            setSelectedUsers(
                                                                selectedUsers.filter((id) => id !== get(user, 'id'))
                                                            );
                                                        }
                                                    }}
                                                />
                                                {get(user, 'firstName')} {get(user, 'lastName')}
                                            </Label>
                                        </div>
                                    ))}
                            </div>
                            <DialogFooter>
                                <Button variant="default" onClick={handleAddUsers}>
                                    Add
                                </Button>
                                <Button variant="secondary" onClick={() => setIsAddUsersDialogOpen(false)}>
                                    Cancel
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </Card>
        </div>
    );
}
