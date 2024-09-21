import { Request, Response } from 'express';
import DbConfig from '../config/dbConfig';
import errorHandler from '../middlewares/errorHandler';
import RoomService from '../services/roomService';
import { isNil } from 'lodash';

const roomService = RoomService.getInstance();

class RoomController {
    private static instance: RoomController;

    private constructor() {}

    public static getInstance() {
        if (isNil(RoomController.instance)) {
            RoomController.instance = new RoomController();
        }
        return RoomController.instance;
    }

    async createRoom(req: Request, res: Response) {
        try {
            const { userId, name } = req.body;
            const room = await roomService.createRoom(userId, name);
            return res.status(201).json(room);
        } catch (error) {
            await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }
}

export default RoomController;
