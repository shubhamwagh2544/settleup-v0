import { User } from '../user/UserTypes';
import { Room } from '../room/RoomTypes';

export interface UserRoom {
    id: number;
    userId: number;
    roomId: number;
    isAdmin: boolean;

    // Relations
    user: User;
    room: Room;
}
