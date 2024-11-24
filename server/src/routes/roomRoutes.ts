import express, { Router } from 'express';
import RoomController from '../controllers/roomController';
import { isNil } from 'lodash';

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
        this.roomRouter.post('/', roomController.createRoom);
        this.roomRouter.get('/', roomController.getRooms);
        this.roomRouter.get('/room-user/:userId', roomController.getRoomsByUserId);
        this.roomRouter.get('/:id', roomController.getRoomById);
    }

    public getRouter() {
        return this.roomRouter;
    }
}

export default RoomRoutes;
