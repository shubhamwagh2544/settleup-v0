import { Request, Response } from 'express';
import UserService from '../services/userService';
import errorHandler from '../middlewares/errorHandler';
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

    async getUserByIdOrEmail(req: Request, res: Response) {
        try {
            const { id, email } = req.params;
            const user = await userService.getUserByIdOrEmail(parseInt(id), email);
            return res.status(200).json(user);
        } catch (error) {
            // await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }
}

export default UserController;
