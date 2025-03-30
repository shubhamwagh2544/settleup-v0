import DbConfig from '../config/dbConfig';
import CustomError from '../error/customError';
import { isEmpty, isNil, map } from 'lodash';
import { Prisma } from '@prisma/client';
import { roundMoney } from '../lib/money';

const prisma = DbConfig.getInstance();

class ExpenseService {
    private static instance: ExpenseService;

    private constructor() { }

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

        const numPeople = splitWith.length + 1; // +1 for the lender
        const amountPerPerson = roundMoney(amount / numPeople);

        // Adjust for rounding errors
        const totalSplit = roundMoney(amountPerPerson * numPeople);
        const adjustment = roundMoney(amount - totalSplit);

        let data;
        try {
            // prisma transaction
            await prisma.$transaction(async (prisma) => {
                // create the expense
                const expense = await prisma.expense.create({
                    data: {
                        name,
                        description,
                        amount: new Prisma.Decimal(amount),
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

                // Create lender's expense record (they get any rounding adjustment)
                await prisma.userExpense.create({
                    data: {
                        userId,
                        expenseId: expense.id,
                        isLender: true,
                        amountOwed: new Prisma.Decimal(amountPerPerson + adjustment),
                        isSettled: true
                    },
                });

                // Create borrowers' expense records
                await prisma.userExpense.createMany({
                    data: splitWith.map((borrowerId) => ({
                        userId: borrowerId,
                        expenseId: expense.id,
                        isLender: false,
                        amountOwed: new Prisma.Decimal(amountPerPerson),
                        isSettled: false
                    })),
                });

                data = { expense, room };
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

        // add fullName to users
        for (const expense of room?.expenses) {
            const users = expense.users;
            const userIds = expense.users.map(user => user.userId);
            // @ts-ignore
            expense.users = (await prisma.user.findMany({
                where: {
                    id: {
                        in: userIds
                    },
                },
            })).map(user => ({
                ...user,
                fullName: `${user.firstName} ${user.lastName}`
            }))
            // @ts-ignore
            expense.users = expense.users.map(expenseUser => {
                let obj = {}
                users.forEach(user => {
                    if (user.userId === expenseUser.id) {
                        obj = { ...user, ...expenseUser };
                    }
                })
                return obj;
            });
        }

        return room.expenses || [];
    }

    async deleteExpense(expenseId: number) {
        // check if expense exists
        const expense = await prisma.expense.findUnique({
            where: {
                id: expenseId
            }
        });
        if (isNil(expense)) {
            throw new CustomError('Expense not Found', 404);
        }
        // check if expense is settled
        const userExpenseEntries = await prisma.userExpense.findMany({
            where: {
                expenseId
            }
        });
        const isSettled = userExpenseEntries.every((entry) => {
            return entry.isSettled === true;
        });
        if (!isSettled) {
            throw new CustomError('Expense not Settled', 409);
        }

        await prisma.expense.delete({
            where: {
                id: expense.id
            }
        })
        return 'Delete Successful';
    }

    async getExpenseById(roomId: number, expenseId: number) {
        if (isNil(roomId) || isNil(expenseId)) {
            throw new CustomError('Invalid RoomId or ExpenseId', 400);
        }

        const expense = await prisma.expense.findUnique({
            where: {
                id: expenseId,
                roomId: roomId
            },
            include: {
                users: true
            }
        });

        if (isNil(expense)) {
            throw new CustomError('Expense not found', 404);
        }

        // Get user details for the expense
        const userIds = expense.users.map(user => user.userId);
        const userDetails = await prisma.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
            }
        });

        // Combine user details with expense user info
        const enrichedUsers = expense.users.map(userExpense => {
            const userDetail = userDetails.find(u => u.id === userExpense.userId);
            return {
                ...userExpense,
                fullName: userDetail ? `${userDetail.firstName} ${userDetail.lastName}` : 'Unknown',
                email: userDetail?.email,
                roomId
            };
        });

        return {
            ...expense,
            users: enrichedUsers
        };
    }

    async updateExpense(roomId: number, expenseId: number, userId: number, amount: number) {
        // check if expense exists for roomId, expenseId and userId
        const expense = await this.getExpenseById(roomId, expenseId);
        if (!expense) {
            throw new CustomError('Expense not found', 404);
        }

        // Find the user in the expense
        const expenseUser = expense.users.find(
            (user) => user.userId === userId && user.roomId === roomId && user.expenseId === expenseId
        );
        if (!expenseUser) {
            throw new CustomError('Expense does not exist for user', 404);
        }

        // Validate amount
        const amountOwed = Number(expenseUser.amountOwed);
        if (Number(amount) !== amountOwed) {
            throw new CustomError('Amount does not match amount owed by user', 409);
        }

        // Update the userExpense
        await prisma.$transaction(async (tx) => {
            await tx.userExpense.update({
                where: {
                    userId_expenseId: {
                        userId,
                        expenseId
                    }
                },
                data: {
                    amountOwed: 0,
                    isSettled: true
                }
            });
        })


        return { message: 'Expense settled successfully' };
    }

    async settleExpense(expenseId: number) {
        // Check if expense exists
        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
            include: { users: true }
        });

        if (!expense) {
            throw new CustomError('Expense not found', 404);
        }

        // Check if all users have settled
        const borrowers = expense.users.filter(user => !user.isLender);
        const allSettled = borrowers.every(user => user.isSettled);

        if (!allSettled) {
            throw new CustomError('All users must settle their dues before marking expense as settled', 400);
        }

        // Update expense status
        await prisma.expense.update({
            where: { id: expenseId },
            data: { isSettled: true }
        });

        return { message: 'Expense settled successfully' };
    }
}

export default ExpenseService;
