import express, { Router } from 'express';
import UserController from '../controllers/userController';

const userController = UserController.getInstance();

class UserRoutes {
    private static instance: UserRoutes;
    private readonly userRouter: Router;

    constructor() {
        this.userRouter = express.Router();
        this.initialiseRoutes();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new UserRoutes();
        }
        return this.instance;
    }

    private initialiseRoutes() {
        this.userRouter.post('/signup', userController.signUp);
        this.userRouter.post('/signin', userController.signIn);
        this.userRouter.get('/:id', userController.getUserById);
    }

    getRouter() {
        return this.userRouter;
    }
}

export default UserRoutes;
