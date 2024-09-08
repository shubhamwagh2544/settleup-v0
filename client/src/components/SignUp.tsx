import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BACKEND_URL from '../global.ts';

export default function SignUp() {
    const [state, setState] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
    });
    const navigate = useNavigate();

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target;
        setState({
            ...state,
            [name]: value,
        });
    }

    async function handleSubmit() {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/user/signup`, state, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 201) {
                toast.success(`Welcome, ${response.data.user.firstname} ${response.data.user.lastname} 👋`);
            }

            const { token } = response.data;
            localStorage.setItem('token', token);

            navigate('/view-profile');
        } catch (error: any) {
            if (error.response.status === 409) {
                toast.success('Account already exists! Please sign in ❌');
            } else {
                toast.error('Something went wrong ❌');
            }
        }
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
                <h1 className="text-3xl font-bold text-center text-purple-700">Hola 👋</h1>
                <div className="flex flex-col gap-4 mt-5">
                    <input
                        type="text"
                        name="firstname"
                        placeholder="Firstname"
                        className="p-3 border border-gray-300 rounded"
                        required
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="lastname"
                        placeholder="Lastname"
                        className="p-3 border border-gray-300 rounded"
                        required
                        onChange={handleInputChange}
                    />
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
                        Sign Up
                    </button>
                </div>
                <div className="text-center mt-5">
                    <span className="text-sm">
                        Already Have an Account ?
                        <Link to="/signin" className="text-purple-700 hover:underline">
                            {' '}
                            Sign In{' '}
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
}
