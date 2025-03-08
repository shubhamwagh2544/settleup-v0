import DbConfig from '../config/dbConfig';
import CustomError from '../error/customError';
import { isNil, map } from 'lodash';
import UserService from './userService';

const prisma = DbConfig.getInstance();
const userService = UserService.getInstance();

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

    async getRoomsByUserId(userId: number) {
        const user = await userService.getUserByIdOrEmail(userId, null);
        if (isNil(user)) {
            throw new CustomError('User not found', 404);
        }
        return prisma.userRoom.findMany({
            where: {
                userId,
            },
            include: {
                room: true,
            },
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
            },
        });
        if (isNil(room)) {
            throw new CustomError('Room not found', 404);
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

        // room.users contain user-room relations
        const userIds = map(room.users, 'userId');
        return prisma.user.findMany({
            where: {
                id: {
                    in: userIds,
                },
            },
        });
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
                isDefault: false
            },
            select: {
                users: true,
                expenses: true
            }
        });
        if (isNil(room)) {
            throw new CustomError('Room not found', 404);
        }
        const roomExpenses = room?.expenses;
        const isSettled = roomExpenses.every(expense => {
            return expense.isSettled === true
        })
        if (!isSettled) {
            throw new CustomError('Room Expenses are not settled', 409);
        }

        // delete all expenses and then associated room
        await prisma.$transaction([
            prisma.expense.deleteMany({ where: { roomId } }),
            prisma.userRoom.deleteMany({ where: { roomId }}),
            prisma.room.delete({ where: { id: roomId } })
        ])

        return 'Delete Successful';
    }
}

export default RoomService;
