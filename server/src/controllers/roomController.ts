import { Request, Response } from 'express';
import DbConfig from '../config/dbConfig';
import errorHandler from '../middlewares/errorHandler';
import RoomService from '../services/roomService';

const roomService = RoomService.getInstance();

class RoomController {
    private static instance: RoomController;

    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomController();
        }
        return this.instance;
    }

    async createRoom(req: Request, res: Response) {
        try {
            const {userId, name} = req.body;
            const room = await roomService.createRoom(userId, name);
            return res.status(201).json(room);
        } catch (error) {
            await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }
}

export default RoomController;
