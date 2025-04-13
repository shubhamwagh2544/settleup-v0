import DbConfig from '../config/dbConfig';
import CustomError from '../error/customError';
import { isNil, map } from 'lodash';
import UserService from './userService';
import { createScopedLogger, LogMeta } from '../utils/loggerWrapper';

const LoggerLabel = 'RoomService';
const prisma = DbConfig.getInstance();
const userService = UserService.getInstance();
const logger = createScopedLogger(LoggerLabel);

class RoomService {
    private static instance: RoomService;

    private constructor() {}

    public static getInstance() {
        if (isNil(RoomService.instance)) {
            RoomService.instance = new RoomService();
        }
        return RoomService.instance;
    }

    async createRoom(userId: number, name: string) {
        // check if room already exists for the user
        const existingRoom = await prisma.room.findUnique({
            where: {
                name,
                users: {
                    some: {
                        userId,
                    },
                },
            },
        });
        if (existingRoom) {
            throw new CustomError('Room already exists for user', 409);
        }

        const room = await prisma.room.create({
            data: {
                name,
                users: {
                    create: {
                        userId,
                        isAdmin: true,
                    },
                },
            },
            include: {
                users: true,
            },
        });

        // join the room
        await this.joinRoom(userId, room.id, true);

        return room;
    }

    async joinRoom(userId: number, roomId: number, isAdmin: boolean) {
        if (!isAdmin) {
            // check if user already exists in the room
            const existingUser = await prisma.userRoom.findUnique({
                where: {
                    userId_roomId: {
                        userId,
                        roomId,
                    },
                },
            });
            if (existingUser) {
                throw new CustomError('User already exists in the room', 409);
            }
            // add user to the room
            await prisma.userRoom.create({
                data: {
                    userId,
                    roomId,
                    isAdmin,
                },
            });
        }
        // if admin, he already in the room after creating it
    }

    async getRooms() {
        return prisma.room.findMany({
            where: {
                isActive: true,
            },
            include: {
                users: true,
            },
        });
    }

    async getRoomsByUserId(userId: number, meta: LogMeta) {
        logger.info(`Fetching rooms for userId: ${meta.userId} and email: ${meta.email}`, meta);
        const user = await userService.getUserByIdOrEmail(userId, null, meta);
        if (isNil(user)) {
            throw new CustomError('User not found', 404);
        }
        const userRooms = await prisma.userRoom.findMany({
            where: {
                userId,
            },
            include: {
                room: {
                    include: {
                        users: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        expenses: {
                            include: {
                                users: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                firstName: true,
                                                lastName: true,
                                                email: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Transform the response to include full names and clean up the structure
        return userRooms.map((userRoom) => {
            const room = userRoom.room;
            const transformedRoom = {
                ...room,
                users: room.users.map((ur) => ({
                    ...ur.user,
                    isAdmin: ur.isAdmin,
                    fullName: `${ur.user.firstName} ${ur.user.lastName}`,
                })),
                expenses: room.expenses.map((expense) => ({
                    ...expense,
                    users: expense.users.map((eu) => ({
                        ...eu.user,
                        isLender: eu.isLender,
                        amountOwed: eu.amountOwed,
                        isSettled: eu.isSettled,
                        fullName: `${eu.user.firstName} ${eu.user.lastName}`,
                    })),
                })),
            };

            return {
                ...userRoom,
                room: transformedRoom,
            };
        });
    }

    async getRoomById(roomId: number) {
        // check if room exists
        const room = await prisma.room.findUnique({
            where: {
                id: roomId,
                isActive: true,
            },
            include: {
                users: true,
                expenses: {
                    include: {
                        users: true,
                    },
                },
            },
        });
        if (isNil(room)) {
            throw new CustomError('Room not found', 404);
        }

        // Add user details to expenses
        for (const expense of room.expenses) {
            const users = expense.users;
            const userIds = users.map((user) => user.userId);

            const userDetails = await prisma.user.findMany({
                where: {
                    id: {
                        in: userIds,
                    },
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            });

            // Combine user details with expense user info
            expense.users = users.map((userExpense) => {
                const userDetail = userDetails.find((u) => u.id === userExpense.userId);
                return {
                    ...userExpense,
                    fullName: userDetail ? `${userDetail.firstName} ${userDetail.lastName}` : 'Unknown',
                    id: userExpense.userId,
                };
            });
        }

        return room;
    }

    async getUsersByRoomId(roomId: number) {
        // check if room exists
        const room = await prisma.room.findUnique({
            where: {
                id: roomId,
                isActive: true,
            },
            include: {
                users: true,
            },
        });
        if (isNil(room)) {
            throw new CustomError('Room not found', 404);
        }

        // Get users with their details
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: map(room.users, 'userId'),
                },
            },
        });

        // Combine user details with isAdmin information from room.users
        return users.map((user) => ({
            ...user,
            isAdmin: room.users.find((ru) => ru.userId === user.id)?.isAdmin || false,
        }));
    }

    async addUsersToRoom(roomId: number, userIds: number[]) {
        // make userIds unique
        userIds = Array.from(new Set(userIds));

        if (!userIds.length) {
            throw new CustomError('User IDs are required', 400);
        }

        // check if room exists
        const room = await prisma.room.findUnique({
            where: {
                id: roomId,
                isActive: true,
            },
        });
        if (isNil(room)) {
            throw new CustomError('Room not found', 404);
        }

        // check if users exist
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: userIds,
                },
            },
        });
        if (users.length !== userIds.length) {
            throw new CustomError('One or more users not found', 404);
        }

        // check if user already in the room
        const existingUsers = await prisma.userRoom.findMany({
            where: {
                roomId,
                userId: {
                    in: userIds,
                },
            },
        });
        if (existingUsers.length) {
            throw new CustomError('One or more users already exist in the room', 409);
        }

        // add users to the room
        await prisma.userRoom.createMany({
            data: userIds.map((userId) => ({
                userId,
                roomId,
                isAdmin: false,
            })),
        });
    }

    async deleteRoom(roomId: number) {
        // if room exists
        const room = await prisma.room.findUnique({
            where: {
                id: roomId,
                isActive: true,
                isDefault: false,
            },
            select: {
                users: true,
                expenses: true,
            },
        });
        if (isNil(room)) {
            throw new CustomError('Room not found', 404);
        }
        const roomExpenses = room?.expenses;
        const isSettled = roomExpenses.every((expense) => {
            return expense.isSettled === true;
        });
        if (!isSettled) {
            throw new CustomError('Room Expenses are not settled', 409);
        }

        // Delete in correct order to respect foreign key constraints
        await prisma.$transaction([
            // First delete UserExpense records
            prisma.userExpense.deleteMany({
                where: {
                    expenseId: {
                        in: roomExpenses.map((expense) => expense.id),
                    },
                },
            }),
            // Then delete Expenses
            prisma.expense.deleteMany({
                where: { roomId },
            }),
            // Then delete UserRoom records
            prisma.userRoom.deleteMany({
                where: { roomId },
            }),
            // Finally delete the Room
            prisma.room.delete({
                where: { id: roomId },
            }),
        ]);

        return 'Delete Successful';
    }
}

export default RoomService;
