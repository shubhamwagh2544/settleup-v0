import express, { Router } from 'express';
import RoomController from '../controllers/roomController';
import { isNil } from 'lodash';
import { authMiddleware } from '../middlewares/authMiddleware';

const roomController = RoomController.getInstance();

class RoomRoutes {
    private static instance: RoomRoutes;
    private readonly roomRouter: Router;

    private constructor() {
        this.roomRouter = express.Router();
        this.initialiseRoutes();
    }

    public static getInstance() {
        if (isNil(RoomRoutes.instance)) {
            RoomRoutes.instance = new RoomRoutes();
        }
        return RoomRoutes.instance;
    }

    private initialiseRoutes() {
        this.roomRouter.post('/', authMiddleware, roomController.createRoom);
        this.roomRouter.get('/', authMiddleware, roomController.getRooms);
        this.roomRouter.get('/:userId/rooms', authMiddleware, roomController.getRoomsByUserId);
        this.roomRouter.get('/:roomId/users', authMiddleware, roomController.getUsersByRoomId);
        this.roomRouter.post('/:roomId/users', authMiddleware, roomController.addUsersToRoom);
        this.roomRouter.get('/:roomId', authMiddleware, roomController.getRoomById);
    }

    public getRouter() {
        return this.roomRouter;
    }
}

export default RoomRoutes;
