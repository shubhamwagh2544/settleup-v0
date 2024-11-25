import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import BACKEND_URL from '../config.ts';
import { toast } from 'sonner';
import { useSocket } from '@/SocketProvider.tsx';
import { get } from 'lodash';

export default function SignIn() {
    const [state, setState] = useState({
        email: '',
        password: '',
    });
    const navigate = useNavigate();
    const socket = useSocket();

    if (!socket) {
        return (
            <div>
                <h1>Connecting...</h1>
            </div>
        );
    }

    async function handleSubmit() {
        try {
            const response: AxiosResponse = await axios.post(`${BACKEND_URL}/auth/signin`, state, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                // socket logic to join default room
                const user = response.data.user;
                const token = response.data.token;

                console.log('user', user);
                socket?.emit('joinDefaultRoom', { user });

                toast.success(`Welcome! ${get(user, 'firstName', "")} ${get(user, 'lastName', "")} 👋`);

                localStorage.setItem('token', token);
                navigate(`/main-room`, { state: { userId: user.id } });
            }
            else {
                toast.error('Something went wrong ❌');
                navigate('/signin');
            }
        } catch (error: any) {
            if (error.response.status === 404) {
                toast.success('Account not found! Please sign up ❌');
            }
            if (error.response.status === 401) {
                toast.success('Invalid credentials! Please try again ❌');
            } else {
                toast.error('Something went wrong ❌');
            }
        }
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setState({
            ...state,
            [name]: value,
        });
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
                <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">Hola 👋</h1>
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        className="p-3 border border-gray-300 rounded"
                        required
                        onChange={handleInputChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="p-3 border border-gray-300 rounded"
                        required
                        onChange={handleInputChange}
                    />
                    <button
                        type="submit"
                        className="bg-purple-700 text-white p-3 rounded hover:bg-purple-800"
                        onClick={handleSubmit}
                    >
                        Sign In
                    </button>
                </div>
                <div className="text-center mt-5">
                    <span className="text-sm">
                        Don't Have an Account ?
                        <Link to="/" className="text-purple-700 hover:underline">
                            {' '}
                            Sign Up{' '}
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
}
