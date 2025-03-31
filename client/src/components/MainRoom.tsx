import { useEffect, useState } from 'react';
import { Account, AccountType } from '@/types/Account.ts';
import axios from 'axios';
import { Button } from './ui/button';
import BACKEND_URL from '@/config.ts';
import { get, isEmpty, isNil } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Building,
    CheckCircle,
    CreditCard,
    DollarSign,
    Home,
    HomeIcon,
    Landmark,
    Plus,
    Receipt,
    Search,
    Users2,
    Wallet,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function MainRoom() {
    const [room, setRoom] = useState("");
    const [rooms, setRooms] = useState([]);
    const [userAccounts, setUserAccounts] = useState<Account[]>([]);
    const [userExpenses, setUserExpenses] = useState([]);
    const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState<AccountType>("saving");
    const [roomSearchQuery, setRoomSearchQuery] = useState("");
    const [accountSearchQuery, setAccountSearchQuery] = useState("");
    const [expenseSearchQuery, setExpenseSearchQuery] = useState("");
    const [isCreateExpenseDialogOpen, setIsCreateExpenseDialogOpen] = useState(false);
    const [expenseName, setExpenseName] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [roomUsers, setRoomUsers] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const userId = get(location, 'state.userId') || localStorage.getItem('userId') || sessionStorage.getItem('userId') || null;

    const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

    useEffect(() => {
        async function fetchRooms() {
            const response = await axios.get(`${BACKEND_URL}/room/${userId}/rooms`, {
                headers: { "Authorization": `Bearer ${getToken()}` }
            });
            setRooms(response.data);
        }
        fetchRooms().catch(error => console.error("Error fetching rooms", error));

        async function fetchUserAccounts() {
            const response = await axios.get(`${BACKEND_URL}/account/user/${userId}`, {
                headers: { "Authorization": `Bearer ${getToken()}` }
            });
            setUserAccounts(response.data);
        }
        fetchUserAccounts().catch(error => console.error("Error fetching user accounts", error));

        async function fetchUserExpenses() {
            try {
                const response = await axios.get(`${BACKEND_URL}/expense/user/${userId}`, {
                    headers: { "Authorization": `Bearer ${getToken()}` }
                });
                setUserExpenses(response.data);
            } catch (error) {
                console.error("Error fetching user expenses", error);
                toast.error("Failed to load expenses");
            }
        }
        fetchUserExpenses();
    }, []);

    useEffect(() => {
        async function fetchRoomUsers() {
            if (!selectedRoom) return;

            try {
                const response = await axios.get(`${BACKEND_URL}/room/${selectedRoom}/users`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });

                // Filter out the current user since they'll be the lender
                const filteredUsers = response.data.filter((user: any) => user.id !== Number(userId));
                setRoomUsers(filteredUsers);
            } catch (error) {
                console.error('Error fetching room users:', error);
                toast.error('Failed to load room users');
            }
        }

        fetchRoomUsers();
    }, [selectedRoom]);

    async function createRoomHandler() {
        if (isEmpty(room.trim()) || isNil(room)) {
            toast.error('Room name is required');
            setRoom("");
            return;
        }
        try {
            const response = await axios.post(`${BACKEND_URL}/room`, { name: room, userId }, {
                headers: { "Authorization": `Bearer ${getToken()}` }
            });
            if (response.status === 201) {
                toast.success('Room created successfully!');
                setIsRoomDialogOpen(false);
                setRoom("");
                navigate(`/room/${response.data.id}`);
            }
        } catch (error: any) {
            if (error.status === 409) {
                toast.error('Room already exists');
                setRoom("");
            }
            console.error('Error creating room', error);
        }
    }

    async function handleAddAccount() {
        setIsAccountDialogOpen(true);
    }

    async function handleSaveAccount() {
        if (isEmpty(accountName.trim()) || isEmpty(accountType.trim())) {
            toast.error('Account name and type are required');
            return;
        }

        try {
            const response = await axios.post<Account>(`${BACKEND_URL}/account/user`, {
                name: accountName,
                type: accountType,
                userId: userId
            }, {
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            });

            if (response.status === 201 && response.data) {
                toast.success('Account created successfully');
                setUserAccounts([...userAccounts, response.data]);
                setIsAccountDialogOpen(false);
                setAccountName('');
                setAccountType('saving');
                navigate(`/account/${response.data.id}`);
            }
        } catch (error) {
            toast.error('Error creating account');
            console.error('Error:', error);
        }
    }

    const filteredRooms = rooms.filter((data) =>
        get(data, 'room.name', '').toLowerCase().includes(roomSearchQuery.toLowerCase())
    );

    const filteredAccounts = userAccounts.filter((account) =>
        account.accountName.toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
        account.accountType.toLowerCase().includes(accountSearchQuery.toLowerCase())
    );

    const filteredExpenses = userExpenses.filter((expense: any) =>
        expense.expense.name.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
        expense.expense.description?.toLowerCase().includes(expenseSearchQuery.toLowerCase())
    );

    async function handleCreateExpense() {
        if (!expenseName || !expenseAmount || !selectedRoom) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (selectedUsers.length === 0) {
            toast.error('Please select users to split the expense with');
            return;
        }

        try {
            const response = await axios.post(
                `${BACKEND_URL}/expense`,
                {
                    userId: Number(userId),
                    roomId: Number(selectedRoom),
                    name: expenseName,
                    description: expenseDescription || '',
                    amount: Number(expenseAmount),
                    splitWith: selectedUsers
                },
                {
                    headers: { Authorization: `Bearer ${getToken()}` }
                }
            );

            if (response.status === 201) {
                toast.success('Expense created successfully');
                setIsCreateExpenseDialogOpen(false);

                // Reset form
                setExpenseName('');
                setExpenseDescription('');
                setExpenseAmount('');
                setSelectedRoom(null);
                setSelectedUsers([]);

                // Navigate to the expense details in the selected room
                navigate(`/room/${selectedRoom}/expenses/${response.data.expense.id}`);
            }
        } catch (error: any) {
            console.error('Error creating expense:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to create expense');
            }
        }
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col space-y-8">
                {/* Header Section */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to SettleUp</h1>
                    <p className="text-muted-foreground">Manage your rooms, accounts, and expenses</p>
                </div>

                {/* Main Tabs Section */}
                <Tabs defaultValue="rooms" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="rooms" className="space-x-2">
                            <HomeIcon className="h-4 w-4" />
                            <span>Your Rooms</span>
                        </TabsTrigger>
                        <TabsTrigger value="accounts" className="space-x-2">
                            <Wallet className="h-4 w-4" />
                            <span>Your Accounts</span>
                        </TabsTrigger>
                        <TabsTrigger value="expenses" className="space-x-2">
                            <Receipt className="h-4 w-4" />
                            <span>Your Expenses</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Rooms Tab Content */}
                    <TabsContent value="rooms" className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search rooms..."
                                value={roomSearchQuery}
                                onChange={(e) => setRoomSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <HomeIcon className="h-5 w-5 text-primary" />
                                        <CardTitle>Your Rooms</CardTitle>
                                    </div>
                                    <Button
                                        onClick={() => setIsRoomDialogOpen(true)}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Room
                                    </Button>
                                </div>
                                <CardDescription>Manage and join expense rooms</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px]">
                                    {isEmpty(filteredRooms) ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <Users2 className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                            <p className="text-muted-foreground">No rooms found. Create a new room to get started!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredRooms.map((data) => (
                                                <motion.div
                                                    key={get(data, 'room.id', 'N/A')}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="group cursor-pointer"
                                                    onClick={() => navigate(`/room/${get(data, 'room.id', 'N/A')}`)}
                                                >
                                                    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3 transition-all duration-200 hover:shadow-md hover:border-primary/20">
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-1">
                                                                <h3 className="font-medium group-hover:text-primary transition-colors">
                                                                    {get(data, 'room.name', 'N/A')}
                                                                </h3>
                                                                <div className="flex items-center space-x-2">
                                                                    <Badge variant="outline">
                                                                        <Users2 className="h-3 w-3 mr-1" />
                                                                        {get(data, 'room.users', []).length} members
                                                                    </Badge>
                                                                    <Badge variant="outline">
                                                                        <Receipt className="h-3 w-3 mr-1" />
                                                                        {get(data, 'room.expenses', []).length} expenses
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant={get(data, 'isAdmin', false) ? "default" : "secondary"}>
                                                                    {get(data, 'isAdmin', false) ? "Admin" : "Member"}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs">
                                                                {get(data, 'room.name', 'N/A').charAt(0)}
                                                            </div>
                                                            <span>Created {new Date(get(data, 'room.createdAt', '')).toLocaleDateString()}</span>
                                                            <span>•</span>
                                                            <span>Last updated {new Date(get(data, 'room.updatedAt', '')).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Accounts Tab Content */}
                    <TabsContent value="accounts" className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search accounts..."
                                value={accountSearchQuery}
                                onChange={(e) => setAccountSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Wallet className="h-5 w-5 text-primary" />
                                        <CardTitle>Your Accounts</CardTitle>
                                    </div>
                                    <Button
                                        onClick={handleAddAccount}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Account
                                    </Button>
                                </div>
                                <CardDescription>Manage your payment accounts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px]">
                                    {isEmpty(filteredAccounts) ? (
                                        <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
                                            <Wallet className="h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-sm text-muted-foreground">
                                                {accountSearchQuery ? "No accounts found matching your search" : "No accounts found. Add your first account!"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredAccounts.map((account) => (
                                                <motion.div
                                                    key={get(account, 'id', 'N/A')}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="group cursor-pointer"
                                                    onClick={() => navigate(`/account/${get(account, 'id', 'N/A')}`)}
                                                >
                                                    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3 transition-all duration-200 hover:shadow-md hover:border-primary/20">
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-1">
                                                                <h3 className="font-medium group-hover:text-primary transition-colors">
                                                                    {get(account, 'accountName', 'N/A')}
                                                                </h3>
                                                                <div className="flex items-center space-x-2">
                                                                    <Badge variant="outline" className="capitalize">
                                                                        <Building className="h-3 w-3 mr-1" />
                                                                        {get(account, 'accountType', 'N/A')}
                                                                    </Badge>
                                                                    <Badge variant={account.status === 'active' ? 'success' : 'destructive'}>
                                                                        {account.status === 'active' ? 'Active' : 'Inactive'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant="outline" className="text-lg font-semibold">
                                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                                    ${Number(account.balance).toFixed(2)}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs">
                                                                <Wallet className="h-3 w-3" />
                                                            </div>
                                                            <span>Created {new Date(account.createdAt).toLocaleDateString()}</span>
                                                            <span>•</span>
                                                            <span>Last updated {new Date(account.updatedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Expenses Tab Content */}
                    <TabsContent value="expenses" className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search expenses by name or description..."
                                value={expenseSearchQuery}
                                onChange={(e) => setExpenseSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Receipt className="h-5 w-5 text-primary" />
                                        <CardTitle>Your Expenses</CardTitle>
                                    </div>
                                    <Button
                                        onClick={() => setIsCreateExpenseDialogOpen(true)}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Expense
                                    </Button>
                                </div>
                                <CardDescription>View all your expenses across rooms</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px]">
                                    {isEmpty(filteredExpenses) ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <Receipt className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                            <p className="text-muted-foreground">
                                                {expenseSearchQuery ? "No expenses found matching your search" : "No expenses found"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredExpenses.map((expense: any) => (
                                                <motion.div
                                                    key={expense.expenseId}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="group cursor-pointer"
                                                    onClick={() => navigate(`/room/${expense.expense.roomId}/expenses/${expense.expenseId}`)}
                                                >
                                                    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3 transition-all duration-200 hover:shadow-md hover:border-primary/20">
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-1">
                                                                <h3 className="font-medium group-hover:text-primary transition-colors">
                                                                    {expense.expense.name}
                                                                </h3>
                                                                {expense.expense.description && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {expense.expense.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant="outline">
                                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                                    ${Number(expense.amountOwed).toFixed(2)}
                                                                </Badge>
                                                                <Badge variant={expense.isSettled ? "success" : "destructive"}>
                                                                    {expense.isSettled ? "Settled" : "Pending"}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs">
                                                                {expense.user.firstName.charAt(0)}
                                                            </div>
                                                            <span>Paid by {expense.user.firstName} {expense.user.lastName}</span>
                                                            <span>•</span>
                                                            <span>{new Date(expense.expense.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create Room Dialog */}
            <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-gradient-to-br from-background to-muted/50">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl">Create New Room</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Create a room to start sharing expenses with friends.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="roomName" className="text-sm font-medium">
                                        Room Name
                                    </Label>
                                    <div className="relative">
                                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="roomName"
                                            placeholder="Enter room name"
                                            value={room}
                                            onChange={(e) => setRoom(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Choose a memorable name for your expense sharing room
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIsRoomDialogOpen(false)}
                                className="sm:w-auto w-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={createRoomHandler}
                                className="sm:w-auto w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Room
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Account Dialog */}
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-gradient-to-br from-background to-muted/50">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl">Add New Account</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Choose your account type and enter the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="saving" className="w-full">
                        <div className="px-6">
                            <TabsList className="w-full">
                                <TabsTrigger value="saving" className="w-full">
                                    <Building className="mr-2 h-4 w-4" />
                                    Savings
                                </TabsTrigger>
                                <TabsTrigger value="current" className="w-full">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Current
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="px-6 py-4">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="accountName" className="text-sm font-medium">
                                            Account Name
                                        </Label>
                                        <div className="relative">
                                            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="accountName"
                                                placeholder="Enter account name"
                                                value={accountName}
                                                onChange={(e) => setAccountName(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            Choose a memorable name for your account
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="accountType" className="text-sm font-medium">
                                            Account Type
                                        </Label>
                                        <Select
                                            value={accountType}
                                            onValueChange={(value) => setAccountType(value as AccountType)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select account type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="saving">
                                                    <div className="flex items-center">
                                                        <Building className="mr-2 h-4 w-4" />
                                                        Savings Account
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="current">
                                                    <div className="flex items-center">
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Current Account
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </Tabs>

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIsAccountDialogOpen(false)}
                                className="sm:w-auto w-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveAccount}
                                className="sm:w-auto w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Account
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Expense Dialog */}
            <Dialog open={isCreateExpenseDialogOpen} onOpenChange={setIsCreateExpenseDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-gradient-to-br from-background to-muted/50">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl">Create New Expense</DialogTitle>
                        <DialogDescription>Add expense details and select a room</DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="space-y-4">
                                {/* Expense Name */}
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

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="expenseDescription">Description (Optional)</Label>
                                    <Input
                                        id="expenseDescription"
                                        placeholder="Add more details about the expense"
                                        value={expenseDescription}
                                        onChange={(e) => setExpenseDescription(e.target.value)}
                                    />
                                </div>

                                {/* Amount */}
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

                                {/* Room Selection */}
                                <div className="space-y-2">
                                    <Label>Select Room</Label>
                                    <ScrollArea className="h-[150px] rounded-md border p-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            {rooms.map((data) => (
                                                <div
                                                    key={get(data, 'room.id')}
                                                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${selectedRoom === get(data, 'room.id')
                                                        ? 'bg-primary/10 border-primary'
                                                        : 'hover:bg-accent'
                                                        }`}
                                                    onClick={() => setSelectedRoom(get(data, 'room.id'))}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <HomeIcon className="h-3 w-3 text-primary" />
                                                        </div>
                                                        <span className="text-sm font-medium truncate">
                                                            {get(data, 'room.name')}
                                                        </span>
                                                    </div>
                                                    {selectedRoom === get(data, 'room.id') && (
                                                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>

                                {/* User Selection - Only show when a room is selected */}
                                {selectedRoom && (
                                    <div className="space-y-2">
                                        <Label>Split With</Label>
                                        {roomUsers.length === 0 ? (
                                            <div className="rounded-md border p-3 text-center text-muted-foreground">
                                                <Users2 className="h-6 w-6 mx-auto mb-1 opacity-50" />
                                                <p className="text-sm">No users available</p>
                                            </div>
                                        ) : (
                                            <ScrollArea className="h-[150px] rounded-md border p-4">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {roomUsers.map((user: any) => (
                                                        <div
                                                            key={user.id}
                                                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${selectedUsers.includes(user.id)
                                                                ? 'bg-primary/10 border-primary'
                                                                : 'hover:bg-accent'
                                                                }`}
                                                            onClick={() => {
                                                                setSelectedUsers(prev =>
                                                                    prev.includes(user.id)
                                                                        ? prev.filter(id => id !== user.id)
                                                                        : [...prev, user.id]
                                                                );
                                                            }}
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                                                    {user.firstName.charAt(0)}
                                                                </div>
                                                                <span className="text-sm font-medium truncate">
                                                                    {user.firstName} {user.lastName}
                                                                </span>
                                                            </div>
                                                            {selectedUsers.includes(user.id) && (
                                                                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsCreateExpenseDialogOpen(false);
                                    setExpenseName('');
                                    setExpenseDescription('');
                                    setExpenseAmount('');
                                    setSelectedRoom(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateExpense}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                disabled={!expenseName || !expenseAmount || !selectedRoom}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Expense
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
