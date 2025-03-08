import { Button } from "./ui/button";
import { useEffect, useState } from 'react';
import axios from 'axios';
import BACKEND_URL from '@/config.ts';
import { get, isEmpty, isNil } from 'lodash';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';

export default function MainRoom() {
    const [room, setRoom] = useState("");
    const [rooms, setRooms] = useState([]);
    // const [users, setUsers] = useState([]);
    const [userAccounts, setUserAccounts] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const userId = get(location, 'state.userId', null);

    useEffect(() => {
        // async function fetchUsers() {
        //     const response = await axios.get(`${BACKEND_URL}/user`, {
        //         headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        //     });
        //     setUsers(response.data);
        // }
        // fetchUsers().catch(error => console.error('Error fetching users', error));

        async function fetchRooms() {
            const response = await axios.get(`${BACKEND_URL}/room/${userId}/rooms`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            setRooms(response.data);
        }
        fetchRooms().catch(error => console.error("Error fetching rooms", error));

        async function fetchUserAccounts() {
            const response = await axios.get(`${BACKEND_URL}/user/accounts`, {
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
                                    {get(account, 'ownerName', 'N/A')} - Balance: {get(account, 'balance', 0)}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
                <CardFooter>
                    <Button className="mt-4">Add Account</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
