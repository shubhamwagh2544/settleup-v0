import express, { Request, Response } from 'express';
import { NODE_PORT } from './config/config';
import cors from 'cors';
import userRouter from './routes/userRoutes';
import { connect } from './config/dbconfig';

const app = express();

// connect to database
connect().then(() => {
    console.log('Connected to the database');
});

// middlewares
app.use(express.json());
app.use(
    cors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
);
app.use('/api/v0/users', userRouter);

// health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Server is Healthy!',
    });
});

// start server
app.listen(NODE_PORT, () => {
    console.log('Server is running on port ' + NODE_PORT);
});
