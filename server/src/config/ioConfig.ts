import http from 'http';
import { Server } from 'socket.io';
import { app } from '../index';

const server = http.createServer(app);

class IoConfig {
    private static io: Server;

    static getInstance() {
        if (!this.io) {
            this.io = new Server(server);
        }
        return this.io;
    }
}

export default IoConfig;