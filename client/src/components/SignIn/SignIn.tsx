import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import BACKEND_URL from '../../config.ts';
import { toast } from 'sonner';
import { useSocket } from '@/SocketProvider.tsx';
import { get } from 'lodash';
import styles from './signIn.module.scss';
import introImage from '../../assets/intro.png';
import logo from '../../assets/split1.png';
import back from '../../assets/back.png';

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

    async function handleSubmit(e: any) {
        e.preventDefault();
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

                toast.success(`Welcome! ${get(user, 'firstName', '')} ${get(user, 'lastName', '')} 👋`);

                localStorage.setItem('token', token);
                navigate(`/main-room`, { state: { userId: user.id } });
            } else {
                toast.error('Something went wrong ❌');
                navigate('/signin');
            }
        } catch (error: any) {
            if (error.response.status === 404) {
                toast.success('Account not found! Please sign up ❌');
            } else if (error.response.status === 401) {
                toast.success('Invalid credentials! Please try again ❌');
            } else if (error.response.status === 400) {
                toast.error(`${error.response?.data?.message}`);
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
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.signin}>
                    <div className={styles.firstFlex}>
                        <div className={styles.flexGap}>
                            <img src={logo} alt="logo" />
                            <p> SplitShare</p>
                        </div>

                        <div className={styles.flexGap}>
                            <img src={back} alt="back" />
                            <p> Go back</p>
                        </div>
                    </div>
                    <div className={styles.flexSecond}>
                        <div className={styles.heading}>
                            <h2>Create account</h2>
                            <p>Start your 30 day free trial. Cancel anytime.</p>
                        </div>
                        <div className={styles.btnList}>
                            <div className={styles['social-buttons']}>
                                <button className={`${styles['social-btn']} ${styles['google']}`}>
                                    <img src="/path/to/google-icon.png" alt="Google" />
                                    Sign up with Google
                                </button>
                                <button className={`${styles['social-btn']} ${styles['apple']}`}>
                                    <img src="/path/to/apple-icon.png" alt="Apple" />
                                    Sign up with Apple ID
                                </button>
                                <button className={`${styles['social-btn']} ${styles['twitter']}`}>
                                    <img src="/path/to/twitter-icon.png" alt="Twitter" />
                                    Sign up with Twitter
                                </button>
                            </div>
                        </div>
                        <hr />
                        <div>
                            <form className={styles['signup-form']} onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email">Email*</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Enter your email"
                                        required
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password">Password*</label>
                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Create a password"
                                        required
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <button type="submit" className={styles['submit-btn']}>
                                    Create account
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className={styles.flexThird}>
                        <p>
                            Already have an account? <span>Log in</span>
                        </p>
                    </div>
                </div>
                <div className={styles.image}>
                    <img src={introImage} alt="intro" />
                </div>
            </div>
        </div>
    );
}
