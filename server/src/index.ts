import express, { Request, Response } from 'express';
import { NODE_PORT } from './config/config';
import cors from 'cors';
import http from 'http';
import UserRoutes from './routes/userRoutes';
import RoomRoutes from './routes/roomRoutes';
import DbConfig from './config/dbConfig';
import { Server } from 'socket.io';

export const app = express();
const server = http.createServer(app);
const userRoutes = UserRoutes.getInstance();
const roomRoutes = RoomRoutes.getInstance();
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

// connect to database
DbConfig.connectDatabase().then(() => {
    console.log('Connected to the database');
});

// create a default room
DbConfig.createDefaultRoom().then((room) => {
    console.log('Default room created:', room.id);
});

// middlewares
app.use(express.json());
app.use(
    cors({
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
);

app.use('/api/v0/users', userRoutes.getRouter());
app.use('/api/v0/rooms', roomRoutes.getRouter());

// health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Server is Healthy!',
    });
});

// start server
server.listen(NODE_PORT, () => {
    console.log('Server is running on port ' + NODE_PORT);
});
