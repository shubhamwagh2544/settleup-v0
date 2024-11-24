import { Button } from "./ui/button";
import { useEffect, useState } from 'react';
import axios from 'axios';
import BACKEND_URL from '@/config.ts';
import { get, isEmpty, isNil } from 'lodash';
import { useNavigate } from 'react-router-dom';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';
import { useLoggedInUser } from '@/hooks/useLoggedInUser.ts';

export default function MainRoom() {

    const [room, setRoom] = useState("");
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const { user, loading, error } = useLoggedInUser();

    useEffect(() => {

        // Fetch all users
        async function fetchUsers() {
            const response = await axios.get(`${BACKEND_URL}/users`);
            setUsers(response.data);
        }
        fetchUsers()
            .then(() => console.log('users fetched successfully'))
            .catch((error) => console.error('error fetching users', error));

        // Fetch all rooms
        async function fetchRooms() {
            const response = await axios.get(`${BACKEND_URL}/rooms/room-user/`);
            setRooms(response.data);
        }
        fetchRooms()
            .then(() => console.log("Rooms fetched successfully"))
            .catch((error) => console.error("Error fetching rooms", error));
    }, []);

    async function createRoomHandler() {
        if (isEmpty(room) || isNil(room)) {
            toast.error('Room name is required');
        }
        try {
            const response = await axios.post(`${BACKEND_URL}/rooms`);
            const room= response.data;
            if (response.status === 201) {
                navigate(`/room/${room.id}`);
            }
        } catch (error: any) {
            console.error('error creating room', error);
        }
    }

    if (loading) {
        return (
            <div>
                <h1>Something went wrong...</h1>
            </div>
        );
    }
    if (isEmpty(users)) {
        return (
            <div>
                <h1>No users found. Please create a room to get started</h1>
            </div>
        );
    }

    return (
        <div className="flex flex-row gap-8 p-4">
            <div className="w-1/2">
                <h2 className="text-lg font-semibold mb-4">Your Rooms</h2>
                {isEmpty(rooms) ? (
                    <p>No rooms found. Create a new room to get started!</p>
                ) : (
                    <ul className="list-disc list-inside">
                        {rooms.map((room) => (
                            <li key={get(room, 'id', 'N/A')} className="mb-2">
                                {get(room, 'name', 'N/A')}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="w-1/2">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Create Room</CardTitle>
                        <CardDescription>Create your room to add expenses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Name of your room"
                                        value={room}
                                        onChange={(e) => setRoom(e.target.value)}
                                    />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={createRoomHandler}>Create</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}