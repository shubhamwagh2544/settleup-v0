import { Request, Response } from 'express';
import { isNil } from 'lodash';

import errorHandler from '../middlewares/errorHandler';
import AuthService from '../services/authService';
import UserService from '../services/userService';

const authService = AuthService.getInstance();
const userService = UserService.getInstance();

declare global {
    namespace Express {
        interface Request {
            userId?: number;
            email?: string;
        }
    }
}

class AuthController {
    private static instance: AuthController;

    private constructor() {}

    public static getInstance() {
        if (isNil(AuthController.instance)) {
            AuthController.instance = new AuthController();
        }
        return AuthController.instance;
    }

    async signUp(req: Request, res: Response) {
        try {
            const { firstname, lastname, email, password } = req.body;
            const [ user, token ] = await authService.signUp(firstname, lastname, email, password);
            return res.status(201).json({user, token});
        } catch (error) {
            // await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }

    async signIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const [ user, token ] = await authService.signIn(email, password);
            return res.status(200).json({ user, token });
        } catch (error) {
            // await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }

    async fetchLoggedInUser(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const user = await userService.getUserByIdOrEmail(userId, null);
            return res.status(200).json(user);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }
}

export default AuthController;