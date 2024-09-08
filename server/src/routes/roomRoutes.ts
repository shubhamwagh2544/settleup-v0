import express, { Router } from 'express';
import RoomController from "../controllers/roomController";

const roomController = RoomController.getInstance();

class RoomRoutes {
    private static instance: RoomRoutes;
    private readonly roomRouter: Router;

    constructor() {
        this.roomRouter = express.Router();
        this.initialiseRoutes();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomRoutes();
        }
        return this.instance;
    }

    private initialiseRoutes() {
        this.roomRouter.post('/', roomController.createRoom);
    }

    getRouter() {
        return this.roomRouter;
    }
}

export default RoomRoutes;
