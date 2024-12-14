import DbConfig from '../config/dbConfig';
import CustomError from '../error/customError';
import { isEmpty, isNil, map } from 'lodash';

const prisma = DbConfig.getInstance();

class ExpenseService {
    private static instance: ExpenseService;

    private constructor() {}

    public static getInstance() {
        if (isNil(ExpenseService.instance)) {
            ExpenseService.instance = new ExpenseService();
        }
        return ExpenseService.instance;
    }

    async createExpense(userId: number, roomId: number, name: string, description: string, amount: number, splitWith: number[]) {
        if (isNil(userId) || isNil(roomId)) {
            throw new CustomError('Invalid UserId / RoomId', 400);
        }

        if (isNil(name) || isNil(amount) || isEmpty(splitWith)) {
            throw new CustomError('Invalid input for creating expense', 400);
        }

        // check if user is part of the room
        const userRoom = await prisma.userRoom.findFirst({
            where: {
                userId,
                roomId,
            },
        });
        if (isNil(userRoom)) {
            throw new CustomError('Expense creator User not part of the room', 404);
        }

        // check if splitWith users are part of the room
        const users = await prisma.userRoom.findMany({
            where: {
                userId: {
                    in: splitWith,
                },
                roomId,
            },
        });
        if (users.length !== splitWith.length) {
            throw new CustomError('Expense splitter Users not part of the room', 404);
        }

        let data;
        try {
            // prisma transaction
            await prisma.$transaction(async (prisma) => {
                // create the expense
                const expense = await prisma.expense.create({
                    data: {
                        name,
                        description,
                        amount,
                        roomId,
                    },
                });
                // add the expense to the room
                const room = await prisma.room.update({
                    where: {
                        id: roomId,
                    },
                    data: {
                        expenses: {
                            connect: {
                                id: expense.id,
                            },
                        },
                    },
                });

                // add the expense to the creator
                const userExpense = await prisma.userExpense.create({
                    data: {
                        userId,
                        expenseId: expense.id,
                        isLender: true,
                    },
                });

                // add the expense to the users
                const expenseUsers = await prisma.userExpense.createMany({
                    data: map(splitWith, (userId) => {
                        return {
                            userId,
                            expenseId: expense.id,
                            isLender: false,
                            amountOwed: amount / (splitWith.length + 1),
                        };
                    }),
                });

                data = {expense, room, userExpense, expenseUsers};
            });

            return data;
        } catch (error: any) {
            console.log('Error while creating expense: ', error);
            throw error;
        }
    }

    async getExpensesForRoom(roomId: number) {
        if (isNil(roomId)) {
            throw new CustomError('Invalid RoomId', 400);
        }

        const room = await prisma.room.findUnique({
            where: {
                id: roomId,
            },
            include: {
                expenses: {
                    include: {
                        users: true,
                    },
                },
            },
        });

        if (isNil(room)) {
            throw new CustomError('Room with expense and users not found', 404);
        }

        return room.expenses || [];
    }
}

export default ExpenseService;
