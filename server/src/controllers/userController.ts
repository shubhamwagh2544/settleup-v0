import { Request, Response } from 'express';
import { UserSignUpRequest } from '../config/types';
import { prisma } from '../config/dbconfig';

export async function signUp(req: Request, res: Response) {
    try {
        const userSignUpRequest: UserSignUpRequest = req.body;

        const user = await prisma.user.create({
            data: {
                firstName: userSignUpRequest.firstName,
                lastName: userSignUpRequest.lastName,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            },
        });

        return res.status(201).json({
            message: 'User signed up successfully',
            user,
        });
    } catch (error) {
        console.error('Error while signing up user:', error);
        res.status(500).json({
            message: 'Error while signing up user:',
        });
    }
}
