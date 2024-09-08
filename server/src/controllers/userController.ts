import {Request, Response} from 'express';
import UserService from '../services/userService';
import errorHandler from '../middlewares/errorHandler';
import DbConfig from '../config/dbConfig';

const userService = UserService.getInstance();

class UserController {
    private static instance: UserController;

    static getInstance() {
        if (!this.instance) {
            this.instance = new UserController();
        }
        return this.instance;
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

    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(parseInt(id));
            return res.status(200).json(user);
        } catch (error) {
            await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }
}

export default UserController;
