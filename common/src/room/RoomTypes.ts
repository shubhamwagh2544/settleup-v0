import { UserRoom } from '../user-room/UserRoomTypes';
import { Expense } from '../expense/ExpenseTypes';

export interface Room {
    id: number;
    name: string;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
    roomType: string;
    roomPic?: string | null;
    isActive: boolean;
    isDefault: boolean;

    // Relationships
    users?: UserRoom[];
    expenses?: Expense[];
}
