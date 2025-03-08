import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import BACKEND_URL from '@/config.ts';
import { get, isEmpty, isNil } from 'lodash';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    const [roomUsers, setRoomUsers] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddUsersDialogOpen, setIsAddUsersDialogOpen] = useState(false);
    const [expenseName, setExpenseName] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const navigate = useNavigate();

    function createExpenseHandler() {
        setIsDialogOpen(true);
    }

    useEffect(() => {
        async function fetchRoom() {
            try {
                const response = await axios.get(`${BACKEND_URL}/room/${roomId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setRoom(response.data);
            } catch (error: any) {
                console.error('Error fetching room', error);
                toast.error('Error fetching room');
            }
        }

        async function fetchRoomUsers() {
            try {
                const response = await axios.get(`${BACKEND_URL}/room/${roomId}/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setRoomUsers(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
                toast.error('Error fetching users');
            }
        }

        async function fetchAllUsers() {
            try {
                const response = await axios.get(`${BACKEND_URL}/user`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setAllUsers(response.data);
            } catch (error: any) {
                console.error('Error fetching users', error);
                toast.error('Error fetching users');
            }
        }

        fetchRoom();
        fetchRoomUsers();

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
                `${BACKEND_URL}/room/${roomId}/users`,
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
        } catch (error: any) {
            console.error('Error adding users to room', error);
            if (error.response.data && error.response.data.statusCode === 409) {
                toast.error(error.response.data.message);
            }
            else if (error.response.data && error.response.data.statusCode === 400) {
                toast.error(error.response.data.message);
            }
            else {
                toast.error('Error adding user to room');
            }
        }
    }

    async function handleCreateExpense() {
        console.log('Create expense', { expenseName, expenseDescription, expenseAmount });
        if (isEmpty(expenseName.trim()) || isEmpty(expenseAmount.trim())) {
            toast.error('Expense name and amount are required');
            return;
        }
        if (isNaN(parseFloat(expenseAmount))) {
            toast.error('Expense amount must be a number');
            return;
        }

        try {
            const response = await axios.post(
                `${BACKEND_URL}/expense`,
                {
                    userId: get(room, 'users[0].userId'),
                    roomId: roomId ? parseInt(roomId) : null,
                    name: expenseName,
                    description: expenseDescription,
                    amount: parseFloat(expenseAmount),
                    splitWith: roomUsers.filter((user) => get(user, 'id') !== get(room, 'users[0].userId')).map((user) => get(user, 'id')),
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            console.log('Expense created', response.data);
            toast.success('Expense created successfully');
            handleDialogClose();
        } catch (error: any) {
            console.error('Error creating expense', error);
            toast.error('Error creating expense');
            handleDialogClose();
        }
    }

    async function handleDeleteRoom() {
        try {
            const response = await axios.delete(`${BACKEND_URL}/room/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            })
            console.log(response);
            if (response.status === 200 && response.data.includes('Delete Successful')) {
                navigate('/main-room', {state: {userId: localStorage.getItem('userId')}})
            }
        } catch (error: AxiosError | any) {
            console.log(error);
            if (error.status === 409 || error.status === 404) {
                toast.error(`${error.response.data.message}`)
            } else {
                toast.error('Error deleting room!');
            }
        }
    }

    if (isEmpty(room) || isNil(room)) {
        return <div>Room Loading...</div>;
    }

    return (
        <div className="flex p-2 m-2">
            <Card className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-6">
                <CardHeader>
                    <CardTitle>{get(room, 'name', 'Room')}</CardTitle>
                </CardHeader>
                <CardContent className="flex">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Users in this room</h2>
                        {isEmpty(roomUsers) ? (
                            <p>No users found.</p>
                        ) : (
                            <ul className="list-disc list-inside">
                                {roomUsers
                                    .map((user) => (
                                    <li key={get(user, 'id', 'N/A')}>
                                        {get(user, 'firstName', 'N/A')} {get(user, 'lastName', 'N/A')}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </CardContent>
                <div className="p-4 flex gap-2">
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
                                    {roomUsers
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
                    <Button variant={'default'} onClick={() => {
                        navigate(`/room/${roomId}/expenses`);
                    }}>
                        Show Expenses
                    </Button>
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
                                    .filter((user) => !roomUsers.some((roomUser) => get(roomUser, 'id') === get(user, 'id')))
                                        .length > 0 ? (
                                        allUsers
                                            .filter((user) => !roomUsers.some((roomUser) => get(roomUser, 'id') === get(user, 'id')))
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
                                            ))
                                    ) : (
                                        <p>No users available.</p>
                                    )}
                            </div>
                            {allUsers.filter((user) => !roomUsers.some((roomUser) => get(roomUser, 'id') === get(user, 'id'))).length > 0 && (
                                <DialogFooter>
                                    <Button variant="default" onClick={handleAddUsers}>
                                        Add
                                    </Button>
                                    <Button variant="secondary" onClick={() => setIsAddUsersDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            )}
                        </DialogContent>
                    </Dialog>
                    <Button className={"ml-2"} variant={"destructive"} onClick={handleDeleteRoom}>Delete Room</Button>
                </div>
                <CardFooter className="flex justify-end">
                    <Button variant="secondary" onClick={() => window.history.back()}>Go Back</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
