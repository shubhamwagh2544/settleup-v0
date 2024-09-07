import { Request, Response } from 'express';
import { UserSignInRequest, UserSignUpRequest } from '../config/types';
import { disconnectDatabase } from '../config/dbconfig';
import UserService from '../services/userService';
import errorHandler from '../middlewares/errorHandler';

const userService = UserService.getInstance();

async function signUp(req: Request, res: Response) {
    try {
        const { email, password }: UserSignUpRequest = req.body;

        const user = userService.signUp(email, password);

        return res.status(201).json(user);
    } catch (error) {
        console.error('Error while signing up user:', error);
        await disconnectDatabase();
        return errorHandler(error, req, res);
    }
}

async function signIn(req: Request, res: Response) {
    try {
        const { email, password }: UserSignInRequest = req.body;

        const user = userService.signIn(email, password);

        return res.status(200).json(user);
    } catch (error) {
        await disconnectDatabase();
        return errorHandler(error, req, res);
    }
}

export { signUp, signIn };
