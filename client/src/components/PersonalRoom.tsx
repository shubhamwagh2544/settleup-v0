import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import BACKEND_URL from '@/config';
import { get, isEmpty, isNil } from 'lodash';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, DollarSign, Receipt, Trash2, UserCircle, UserPlus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Room {
    id: string;
    name: string;
    expenses: Array<{
        id: string;
        name: string;
        description?: string;
        amount: number;
        users: Array<{
            userId: number;
            expenseId: string;
            isLender: boolean;
            amountOwed: number;
            fullName: string;
            id: number;
        }>;
    }>;
}

export default function PersonalRoom() {
    const { roomId } = useParams();
    const [room, setRoom] = useState<Room | null>(null);
    const [roomUsers, setRoomUsers] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddUsersDialogOpen, setIsAddUsersDialogOpen] = useState(false);
    const [expenseName, setExpenseName] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
    const getUserId = () => localStorage.getItem('userId') || sessionStorage.getItem('userId');

    function createExpenseHandler() {
        setIsDialogOpen(true);
    }

    useEffect(() => {
        async function fetchRoom() {
            try {
                const response = await axios.get(`${BACKEND_URL}/room/${roomId}`, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
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
                        Authorization: `Bearer ${getToken()}`,
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
                        Authorization: `Bearer ${getToken()}`,
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
                        Authorization: `Bearer ${getToken()}`,
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
            } else if (error.response.data && error.response.data.statusCode === 400) {
                toast.error(error.response.data.message);
            } else {
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
                    splitWith: roomUsers
                        .filter((user) => get(user, 'id') !== get(room, 'users[0].userId'))
                        .map((user) => get(user, 'id')),
                },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
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
                    Authorization: `Bearer ${getToken()}`,
                },
            });
            console.log(response);
            if (response.status === 200 && response.data.includes('Delete Successful')) {
                navigate('/main-room', { state: { userId: getUserId() } });
            }
        } catch (error: AxiosError | any) {
            console.log(error);
            if (error.status === 409 || error.status === 404) {
                toast.error(`${error.response.data.message}`);
            } else {
                toast.error('Error deleting room!');
            }
        }
    }

    if (isEmpty(room) || isNil(room)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
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
                            <h1 className="text-3xl font-bold tracking-tight">{get(room, 'name', 'Room')}</h1>
                            <p className="text-muted-foreground">Manage expenses and members</p>
                        </div>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteRoom} className="bg-red-500 hover:bg-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Room
                    </Button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Members Card */}
                    <Card className="col-span-1 bg-gradient-to-br from-background to-muted/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <CardTitle>Room Members</CardTitle>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setIsAddUsersDialogOpen(true)}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Members
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] pr-4">
                                {isEmpty(roomUsers) ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
                                        <Users className="h-12 w-12 text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground">No members found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {roomUsers.map((user) => (
                                            <div
                                                key={get(user, 'id', 'N/A')}
                                                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                                                    {get(user, 'firstName', 'N/A').charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {get(user, 'firstName', 'N/A')} {get(user, 'lastName', 'N/A')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Expenses Section */}
                    <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-background to-muted/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Receipt className="h-5 w-5 text-primary" />
                                    <CardTitle>Expenses</CardTitle>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={createExpenseHandler}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Add Expense
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] pr-4">
                                {isEmpty(room?.expenses) ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
                                        <Receipt className="h-12 w-12 text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground">
                                            No expenses found. Create your first expense!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {room?.expenses?.map((expense: any) => {
                                            const lender = expense.users.find((user: any) => user.isLender);
                                            // const borrowers = expense.users.filter((user: any) => !user.isLender);

                                            return (
                                                <motion.div
                                                    key={expense.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="group cursor-pointer"
                                                    onClick={() => navigate(`/room/${roomId}/expenses/${expense.id}`)}
                                                >
                                                    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3 transition-all duration-200 hover:shadow-md hover:border-primary/20">
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-1">
                                                                <h3 className="font-medium group-hover:text-primary transition-colors">
                                                                    {expense.name}
                                                                </h3>
                                                                {expense.description && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {expense.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant="outline">
                                                                    <DollarSign className="h-3 w-3 mr-1" />$
                                                                    {expense.amount}
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    <Users className="h-3 w-3 mr-1" />
                                                                    {expense.users.length}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs">
                                                                {lender?.fullName?.charAt(0) || 'U'}
                                                            </div>
                                                            <span>Paid by {lender?.fullName || 'Unknown'}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Expense Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-gradient-to-br from-background to-muted/50">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl">Create New Expense</DialogTitle>
                        <DialogDescription>Add expense details and split with room members</DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expenseName">Expense Name</Label>
                                    <div className="relative">
                                        <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="expenseName"
                                            placeholder="Enter expense name"
                                            value={expenseName}
                                            onChange={(e) => setExpenseName(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expenseDescription">Description (Optional)</Label>
                                    <div className="relative">
                                        <Input
                                            id="expenseDescription"
                                            placeholder="Add more details about the expense"
                                            value={expenseDescription}
                                            onChange={(e) => setExpenseDescription(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expenseAmount">Amount</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="expenseAmount"
                                            type="number"
                                            placeholder="0.00"
                                            value={expenseAmount}
                                            onChange={(e) => setExpenseAmount(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label>Split With</Label>
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                        {roomUsers
                                            .filter((user) => get(user, 'id') !== get(room, 'users[0].userId'))
                                            .map((user) => (
                                                <div key={get(user, 'id')} className="flex items-center space-x-2">
                                                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                                                    <span>
                                                        {get(user, 'firstName')} {get(user, 'lastName')}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={handleDialogClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateExpense}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Create Expense
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Users Dialog */}
            <Dialog open={isAddUsersDialogOpen} onOpenChange={setIsAddUsersDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-gradient-to-br from-background to-muted/50">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl">Add Members</DialogTitle>
                        <DialogDescription>Select users to add to this room</DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        <ScrollArea className="h-[300px]">
                            {allUsers.filter(
                                (user) => !roomUsers.some((roomUser) => get(roomUser, 'id') === get(user, 'id'))
                            ).length > 0 ? (
                                <div className="space-y-2">
                                    {allUsers
                                        .filter(
                                            (user) =>
                                                !roomUsers.some((roomUser) => get(roomUser, 'id') === get(user, 'id'))
                                        )
                                        .map((user) => (
                                            <label
                                                key={get(user, 'id')}
                                                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`user-${get(user, 'id')}`}
                                                    value={get(user, 'id')}
                                                    className="rounded border-muted"
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
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                                                    {get(user, 'firstName', 'N/A').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {get(user, 'firstName', 'N/A')} {get(user, 'lastName', 'N/A')}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Users className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                    <p className="text-muted-foreground">No users available to add</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {allUsers.filter((user) => !roomUsers.some((roomUser) => get(roomUser, 'id') === get(user, 'id')))
                        .length > 0 && (
                            <DialogFooter className="p-6 pt-4 bg-muted/40">
                                <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                                    <Button variant="outline" onClick={() => setIsAddUsersDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAddUsers}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                        disabled={selectedUsers.length === 0}
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Selected Members
                                    </Button>
                                </div>
                            </DialogFooter>
                        )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
