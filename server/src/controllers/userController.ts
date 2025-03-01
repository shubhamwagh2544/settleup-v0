import { Request, Response } from 'express';
import UserService from '../services/userService';
import errorHandler from '../middlewares/errorHandler';
import { isNil, parseInt } from 'lodash';
import { userIdSchema } from '../validations/userValidations';

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
            return errorHandler(error, req, res);
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const users = await userService.getUsers();
            return res.status(200).json(users);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getUserInfo(req: Request, res: Response) {
        try {
            const userInfoValidator = userIdSchema.safeParse(req.params);
            if (!userInfoValidator.success) {
                return res.status(422).json(userInfoValidator.error.format());
            }
            const { id } = userInfoValidator.data;
            const userInfo = await userService.getUserInfo(id);
            return res.status(200).json(userInfo);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }
}

export default UserController;
