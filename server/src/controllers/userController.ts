import { Request, Response } from 'express';

import UserService from '../services/userService';
import errorHandler from '../middlewares/errorHandler';
import { isNil, parseInt } from 'lodash';
import { userIdSchema } from '../validations/userValidations';
import { buildLogMeta, createScopedLogger } from '../utils/loggerWrapper';
import CustomError from '../error/customError';

const LoggerLabel = 'UserController';
const userService = UserService.getInstance();
const logger = createScopedLogger(LoggerLabel);

class UserController {
    private static instance: UserController;

    private constructor() {
        logger.info('UserController initialised', { function: 'constructor' });
    }

    public static getInstance() {
        if (isNil(UserController.instance)) {
            UserController.instance = new UserController();
        }
        return UserController.instance;
    }

    async getUserByIdOrEmail(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'getUserByIdOrEmail');
        logger.info(`Fetching user by userId/Email: ${meta.userId} / ${meta.email}`, meta);
        try {
            const { id, email } = req.params;
            const user = await userService.getUserByIdOrEmail(parseInt(id), email, meta);
            return res.status(200).json(user);
        } catch (error) {
            logger.error('Error occurred while fetching user by id or email', { ...meta, error });
            return errorHandler(error, req, res);
        }
    }

    async getUsers(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'getUsers');
        try {
            logger.info(`Fetching all users for email: ${meta.email}`, meta);
            const users = await userService.getUsers(meta);
            return res.status(200).json(users);
        } catch (error) {
            logger.error('Error occurred while fetching all users', { ...meta, error });
            return errorHandler(error, req, res);
        }
    }

    async getUserInfo(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'getUserInfo');
        try {
            logger.info(`Fetching user information for userId: ${meta.userId} and email: ${meta.email}`, meta);
            const userInfoValidator = userIdSchema.safeParse(req.params);
            if (!userInfoValidator.success) {
                return errorHandler(new CustomError('Invalid input', 422, userInfoValidator.error.format()), req, res);
            }
            const { id } = userInfoValidator.data;
            const userInfo = await userService.getUserInfo(id);
            return res.status(200).json(userInfo);
        } catch (error) {
            logger.error('Error occurred while fetching user information', { ...meta, error });
            return errorHandler(error, req, res);
        }
    }
}

export default UserController;
