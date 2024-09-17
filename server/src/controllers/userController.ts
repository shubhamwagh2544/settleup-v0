import { Request, Response } from 'express';
import UserService from '../services/userService';
import errorHandler from '../middlewares/errorHandler';
import DbConfig from '../config/dbConfig';
import { isNil, parseInt } from 'lodash';

const userService = UserService.getInstance();

class UserController {
    private static instance: UserController;

    private constructor() {}

    public static getInstance() {
        if (isNil(UserController.instance)) {
            UserController.instance = new UserController();
        }
        return UserController.instance;
    }

    async signUp(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const user = await userService.signUp(email, password);
            return res.status(201).json(user);
        } catch (error) {
            await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }

    async signIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const user = await userService.signIn(email, password);
            return res.status(200).json(user);
        } catch (error) {
            await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }

    async getUserByIdOrEmail(req: Request, res: Response) {
        try {
            const { id, email } = req.params;
            const user = await userService.getUserByIdOrEmail(parseInt(id), email);
            return res.status(200).json(user);
        } catch (error) {
            await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }
}

export default UserController;
