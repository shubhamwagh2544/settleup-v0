// Todo: Convert into Zod Schema

export type Room = {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    roomType: string;
    roomPic?: string;
    isActive: boolean;
    users: UserRoom[];
};

export type User = {
    id: number;
    email: string;
    password: string;
    isActive: boolean;
    mfaEnabled?: boolean;
    defaultLang?: string;
    isAdmin: boolean;
    private?: boolean;
    rooms: UserRoom[];
};

export type UserRoom = {
    userId: number;
    roomId: number;
    isAdmin: boolean;
};

export enum IncomingMessageType {
    CREATE_ROOM = 'CREATE_ROOM',
    JOIN_ROOM = 'JOIN_ROOM',
    LEAVE_ROOM = 'LEAVE_ROOM',
    SEND_MESSAGE = 'SEND_MESSAGE',
    DELETE_MESSAGE = 'DELETE_MESSAGE',
}