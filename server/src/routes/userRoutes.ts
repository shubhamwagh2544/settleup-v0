import express from 'express';
import { signUp } from '../controllers/userController';
const userRouter = express.Router();

userRouter.post('/signup', signUp);

export default userRouter;
