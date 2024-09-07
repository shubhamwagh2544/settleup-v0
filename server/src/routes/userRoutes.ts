import express from 'express';
import { signIn, signUp } from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/signup', signUp);

userRouter.post('/signin', signIn);

export default userRouter;
