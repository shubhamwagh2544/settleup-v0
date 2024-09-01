import { Request, Response } from 'express';
import { UserSignInRequest, UserSignUpRequest } from '../config/types';
import { disconnectDatabase, prisma } from '../config/dbconfig';

async function signUp(req: Request, res: Response) {
    try {
        const { firstName, lastName, email, password }: UserSignUpRequest = req.body;
        // Todo: Validate inputs
        // Todo: Hash password
        // conditional object property inclusion
        const user = await prisma.user.create({
            data: {
                email,
                password,
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            },
        });

        return res.status(201).json(user);
    } catch (error) {
        console.error('Error while signing up user:', error);
        await disconnectDatabase();
        res.status(500).json({
            message: 'Error while signing up user:',
        });
    }
}

async function logIn(req: Request, res: Response) {
    try {
        const { email, password }: UserSignInRequest = req.body;
        // check if user already exists
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (user) {
            return res.status(409).json({
                message: 'User already exists',
            });
        }
        // Todo: check if password matches
        return res.status(200).json({
            message: 'User logged in',
        });
    } catch (error) {
        console.error('Error while signing up user:', error);
        await disconnectDatabase();
        res.status(500).json({
            message: 'Error while signing up user:',
        });
    }
}

export { signUp, logIn };
