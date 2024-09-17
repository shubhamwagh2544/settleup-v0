import http from 'http';
import { Server } from 'socket.io';
import { app } from '../index';
import { isNil } from 'lodash';

const server = http.createServer(app);

class IoConfig {
    private static io: Server;

    private constructor() {}

    public static getInstance() {
        if (isNil(IoConfig.io)) {
            IoConfig.io = new Server(server, {
                cors: {
                    origin: ['http://localhost:5173'],
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                }
            });
        }
        return IoConfig.io;
    }
}

export default IoConfig;
