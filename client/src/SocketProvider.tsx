import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import Socket = SocketIOClient.Socket;

// Create the context
const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

// Provide the socket to the app
export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketConnection = io('http://localhost:3000');
        setSocket(socketConnection);

        socketConnection.on('connect', () => {
            console.log('Connected with Socket ID:', socketConnection.id);
        });

        return () => {
            socketConnection.disconnect();  // Clean up when component unmounts
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}
