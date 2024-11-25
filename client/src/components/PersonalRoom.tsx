import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BACKEND_URL from '@/config.ts';
import { get, isEmpty } from 'lodash';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function PersonalRoom() {
    const { roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [users, setUsers] = useState([]);

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

        fetchRoom();
        fetchUsers();
    }, [roomId]);

    if (isEmpty(room)) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>{get(room, 'name', 'Room')}</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </div>
    );
}
