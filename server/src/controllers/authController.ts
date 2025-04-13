import { Request, Response } from 'express';
import { isNil } from 'lodash';

import errorHandler from '../middlewares/errorHandler';
import AuthService from '../services/authService';
import UserService from '../services/userService';
import { createScopedLogger } from '../utils/loggerWrapper';
import {buildLogMeta} from '../utils/loggerWrapper';

const LoggerLabel = 'AuthController';
const authService = AuthService.getInstance();
const userService = UserService.getInstance();
const logger = createScopedLogger(LoggerLabel);

class AuthController {
    private static instance: AuthController;

    private constructor() {
        logger.info('AuthController initialized', {function: 'constructor'});
    }

    public static getInstance() {
        if (isNil(AuthController.instance)) {
            AuthController.instance = new AuthController();
        }
        return AuthController.instance;
    }

    async signUp(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'signUp');
        try {
            const { firstname, lastname, email, password } = req.body;
            logger.info(`Sign Up request from ${email}`, {...meta, email});
            const [user, token] = await authService.signUp(firstname, lastname, email, password, meta);
            return res.status(201).json({ user, token });
        } catch (error) {
            logger.error('Error occurred while signing up', {...meta, error});
            return errorHandler(error, req, res);
        }
    }

    async signIn(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'signIn');
        try {
            const { email, password } = req.body;
            logger.info(`Sign In request from ${email}`, {...meta, email});
            const [user, token] = await authService.signIn(email, password, meta);
            return res.status(200).json({ user, token });
        } catch (error) {
            logger.error(`Error occurred while signing in: `, {...meta, error});
            return errorHandler(error, req, res);
        }
    }

    async fetchLoggedInUser(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'fetchLoggedInUser');
        logger.info(`Fetching logged in user with userId/email: ${meta.userId} / ${meta.email}`, meta);
        try {
            const {userId, email} = req;
            const user = await userService.getUserByIdOrEmail(userId, email, meta);
            return res.status(200).json(user);
        } catch (error) {
            logger.error('Error occurred while fetching logged in user', {...meta, error})
            return errorHandler(error, req, res);
        }
    }
}

export default AuthController;
