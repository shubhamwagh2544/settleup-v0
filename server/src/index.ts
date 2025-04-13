import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
// import { Server } from 'socket.io';

import { corsOptions, NODE_PORT } from './config/config';
import UserRoutes from './routes/userRoutes';
import RoomRoutes from './routes/roomRoutes';
import DbConfig from './config/dbConfig';
import AuthRoutes from './routes/authRoutes';
import ExpenseRoutes from './routes/expenseRoutes';
import AccountRoutes from './routes/accountRoutes';
import requestIdMiddleware from './middlewares/requestId';
import { createScopedLogger } from './utils/loggerWrapper';

export const app = express();
const server = http.createServer(app);
// const io = new Server(server, { cors: corsOptions });

const LoggerLabel = 'App';
const logger = createScopedLogger(LoggerLabel);

const accountRoutes = AccountRoutes.getInstance();
const authRoutes = AuthRoutes.getInstance();
const userRoutes = UserRoutes.getInstance();
const roomRoutes = RoomRoutes.getInstance();
const expenseRoutes = ExpenseRoutes.getInstance();

// io.on('connection', (socket) => {
//     console.log('Socket connected:', socket.id);
//
//     socket.on('disconnect', () => {
//         console.log('Socket disconnected:', socket.id);
//     });
// });

DbConfig.connectDatabase().then(() => {
    logger.info('Connected to the database successfully');
});

DbConfig.createDefaultRoom().then((room) => {
    logger.info(`Default room created with id: ${room.id}`);
});

// create a admin user
DbConfig.createSuperAdminUser().then((user) => {
    logger.info(`Super Admin user created with id: ${user.id}`);
});

// middlewares
app.use(express.json());
app.use(cors(corsOptions));

app.use(requestIdMiddleware);

app.use('/api/account', accountRoutes.getRouter());
app.use('/api/auth', authRoutes.getRouter());
app.use('/api/user', userRoutes.getRouter());
app.use('/api/room', roomRoutes.getRouter());
app.use('/api/expense', expenseRoutes.getRouter());

// health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Server is Healthy!',
    });
});

// start server
server.listen(NODE_PORT, () => {
    logger.info(`Server is running on port ${NODE_PORT}`)
});
