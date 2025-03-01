import express, { Router } from 'express';
import UserController from '../controllers/userController';
import { isNil } from 'lodash';
import { authMiddleware } from '../middlewares/authMiddleware';

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
        this.userRouter.get('/:id', authMiddleware, userController.getUserByIdOrEmail);
        this.userRouter.get('/', authMiddleware, userController.getUsers);
        this.userRouter.get('/:id/info', userController.getUserInfo);
    }

    public getRouter() {
        return this.userRouter;
    }
}

export default UserRoutes;
