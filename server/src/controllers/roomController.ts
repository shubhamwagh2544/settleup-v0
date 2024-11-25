import { Request, Response } from 'express';
import { isNil } from 'lodash';

import errorHandler from '../middlewares/errorHandler';
import RoomService from '../services/roomService';

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
            // await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }

    async getRooms(req: Request, res: Response) {
        try {
            const rooms = await roomService.getRooms();
            return res.status(200).json(rooms);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getRoomsByUserId(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const rooms = await roomService.getRoomsByUserId(parseInt(userId));
            return res.status(200).json(rooms);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getRoomById(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const room = await roomService.getRoomById(parseInt(roomId));
            return res.status(200).json(room);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getUsersByRoomId(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const users = await roomService.getUsersByRoomId(parseInt(roomId));
            return res.status(200).json(users);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }
}

export default RoomController;
