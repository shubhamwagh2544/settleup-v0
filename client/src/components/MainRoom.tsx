import { useState, useEffect } from 'react';
import {Account, AccountType} from '@/types/Account.ts';
import axios from 'axios';
import { Button } from "./ui/button";
import BACKEND_URL from '@/config.ts';
import { get, isEmpty, isNil } from 'lodash';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"

export default function MainRoom() {
    const [room, setRoom] = useState("");
    const [rooms, setRooms] = useState([]);
    const [userAccounts, setUserAccounts] = useState<Account[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState<AccountType>("saving");

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
        setIsDialogOpen(true);
    }

    async function handleSaveAccount() {
        console.log({
            accountType,
            accountName
        });
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
                setIsDialogOpen(false);
                setAccountName('');
                setAccountType('saving');
            }
        } catch (error) {
            toast.error('Error creating account');
            console.error('Error:', error);
        }
    }

    return (
        <div className="flex flex-row gap-8 p-4">
            <Card className="w-1/3">
                <CardHeader>
                    <CardTitle>Your Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                    {isEmpty(rooms) ? <p>No rooms found. Create a new room to get started!</p> : (
                        <ul className="list-disc list-inside">
                            {rooms.map((data) => (
                                <li key={get(data, 'room.id', 'N/A')} className="mb-2">
                                    <Link to={`/room/${get(data, 'room.id', 'N/A')}`}>{get(data, 'room.name', 'N/A')}</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
            <Card className="w-1/3">
                <CardHeader>
                    <CardTitle>Create Room</CardTitle>
                    <CardDescription>Create your room to add expenses</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Name of your room" value={room} onChange={(e) => setRoom(e.target.value)} />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={createRoomHandler}>Create</Button>
                </CardFooter>
            </Card>
            <Card className="w-1/3">
                <CardHeader>
                    <CardTitle>User Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    {isEmpty(userAccounts) ? <p>No user accounts found.</p> : (
                        <ul className="list-disc list-inside">
                            {userAccounts.map((account) => (
                                <li key={get(account, 'id', 'N/A')} className="mb-2">
                                    <Link to={`/account/${get(account, 'id', 'N/A')}`}>
                                        {get(account, 'accountName', 'N/A')}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
                <CardFooter>
                    <Button className="mt-4" onClick={handleAddAccount}>Add Account</Button>
                </CardFooter>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Account</DialogTitle>
                        <DialogDescription>Fill in the details of the account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="accountName">Account Name</Label>
                            <Input
                                id="accountName"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="accountType">Account Type</Label>
                            <select
                                id="accountType"
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value as AccountType)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Account Type</option>
                                <option value="saving">Saving</option>
                                <option value="current">Current</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="default" onClick={handleSaveAccount}>
                            Save
                        </Button>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
