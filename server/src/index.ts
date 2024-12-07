import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Server } from 'socket.io';

import { corsOptions, NODE_PORT } from './config/config';
import UserRoutes from './routes/userRoutes';
import RoomRoutes from './routes/roomRoutes';
import DbConfig from './config/dbConfig';
import AuthRoutes from './routes/authRoutes';
import ExpenseRoutes from './routes/expenseRoutes';

export const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

const authRoutes = AuthRoutes.getInstance();
const userRoutes = UserRoutes.getInstance();
const roomRoutes = RoomRoutes.getInstance();
const expenseRoutes = ExpenseRoutes.getInstance();

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

// create a admin user
DbConfig.createAdminUser().then((user) => {
    console.log('Admin user created:', user.id);
});

// middlewares
app.use(express.json());
app.use(cors(corsOptions));

app.use('/api/auth', authRoutes.getRouter());
app.use('/api/users', userRoutes.getRouter());
app.use('/api/rooms', roomRoutes.getRouter());
app.use('/api/expenses', expenseRoutes.getRouter());

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
