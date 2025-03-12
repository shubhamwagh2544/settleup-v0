import { useEffect, useState } from 'react';
import { Account, AccountType } from '@/types/Account.ts';
import axios from 'axios';
import { Button } from './ui/button';
import BACKEND_URL from '@/config.ts';
import { get, isEmpty, isNil } from 'lodash';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { ArrowRight, Building, CreditCard, Home, Landmark, Plus, Search, Users2, Wallet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MainRoom() {
    const [room, setRoom] = useState("");
    const [rooms, setRooms] = useState([]);
    const [userAccounts, setUserAccounts] = useState<Account[]>([]);
    const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState<AccountType>("saving");
    const [searchQuery, setSearchQuery] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const userId = get(location, 'state.userId') || localStorage.getItem('userId') || null;

    useEffect(() => {
        async function fetchRooms() {
            const response = await axios.get(`${BACKEND_URL}/room/${userId}/rooms`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            setRooms(response.data);
        }
        fetchRooms().catch(error => console.error("Error fetching rooms", error));

        async function fetchUserAccounts() {
            const response = await axios.get(`${BACKEND_URL}/account/user/${userId}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            setUserAccounts(response.data);
        }
        fetchUserAccounts().catch(error => console.error("Error fetching user accounts", error));
    }, []);

    async function createRoomHandler() {
        if (isEmpty(room.trim()) || isNil(room)) {
            toast.error('Room name is required');
            setRoom("");
            return;
        }
        try {
            const response = await axios.post(`${BACKEND_URL}/room`, { name: room, userId }, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
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
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 201 && response.data) {
                toast.success('Account created successfully');
                setUserAccounts([...userAccounts, response.data]);
                setIsAccountDialogOpen(false);
                setAccountName('');
                setAccountType('saving');
            }
        } catch (error) {
            toast.error('Error creating account');
            console.error('Error:', error);
        }
    }

    const filteredRooms = rooms.filter((data) =>
        get(data, 'room.name', '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col space-y-8">
                {/* Header Section */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to Splitwise</h1>
                    <p className="text-muted-foreground">Manage your rooms and accounts</p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rooms List */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Home className="h-5 w-5 text-primary" />
                                <CardTitle>Your Rooms</CardTitle>
                            </div>
                            <CardDescription>Manage and join expense rooms</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] pr-4">
                                {isEmpty(filteredRooms) ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
                                        <Users2 className="h-12 w-12 text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground">No rooms found. Create a new room to get started!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredRooms.map((data) => (
                                            <Link
                                                key={get(data, 'room.id', 'N/A')}
                                                to={`/room/${get(data, 'room.id', 'N/A')}`}
                                            >
                                                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                                                    <span className="font-medium">{get(data, 'room.name', 'N/A')}</span>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                            <div className="mt-4">
                                <Button
                                    onClick={() => setIsRoomDialogOpen(true)}
                                    variant="outline"
                                    size="icon"
                                    className="w-full flex items-center justify-center space-x-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Create Room</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Accounts */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Wallet className="h-5 w-5 text-primary" />
                                <CardTitle>Your Accounts</CardTitle>
                            </div>
                            <CardDescription>Manage your payment accounts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] pr-4">
                                {isEmpty(userAccounts) ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
                                        <Wallet className="h-12 w-12 text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground">No accounts found. Add your first account!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {userAccounts.map((account) => (
                                            <Link
                                                key={get(account, 'id', 'N/A')}
                                                to={`/account/${get(account, 'id', 'N/A')}`}
                                            >
                                                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{get(account, 'accountName', 'N/A')}</span>
                                                        <span className="text-sm text-muted-foreground capitalize">{get(account, 'type', 'N/A')}</span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                            <div className="mt-4">
                                <Button
                                    onClick={handleAddAccount}
                                    variant="outline"
                                    size="icon"
                                    className="w-full flex items-center justify-center space-x-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Account</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
        </div>
    );
}
