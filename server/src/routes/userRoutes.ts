import express, { Router } from 'express';
import UserController from '../controllers/userController';
import { isNil } from 'lodash';

const userController = UserController.getInstance();

class UserRoutes {
    private static instance: UserRoutes;
    private readonly userRouter: Router;

    private constructor() {
        this.userRouter = express.Router();
        this.initialiseRoutes();
    }

    public static getInstance() {
        if (isNil(UserRoutes.instance)) {
            UserRoutes.instance = new UserRoutes();
        }
        return UserRoutes.instance;
    }

    private initialiseRoutes() {
        this.userRouter.post('/signup', userController.signUp);
        this.userRouter.post('/signin', userController.signIn);
        this.userRouter.get('/:id', userController.getUserByIdOrEmail);
    }

    public getRouter() {
        return this.userRouter;
    }
}

export default UserRoutes;
