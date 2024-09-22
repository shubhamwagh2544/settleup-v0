import express, { Router } from 'express';
import { isNil } from 'lodash';

import AuthController from '../controllers/authController';
const authController = AuthController.getInstance();

class AuthRoutes {
    private static instance: AuthRoutes;
    private readonly authRouter: Router;

    private constructor() {
        this.authRouter = express.Router();
        this.initialiseRoutes();
    }

    public static getInstance() {
        if (isNil(AuthRoutes.instance)) {
            AuthRoutes.instance = new AuthRoutes();
        }
        return AuthRoutes.instance;
    }

    private initialiseRoutes() {
        this.authRouter.post('/signup', authController.signUp);
        this.authRouter.post('/signin', authController.signIn);
    }

    public getRouter() {
        return this.authRouter;
    }
}

export default AuthRoutes;
