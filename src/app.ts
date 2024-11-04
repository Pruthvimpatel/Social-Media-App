import * as dotenv from 'dotenv';
import express from 'express';
dotenv.config();

 import router from './routes/index.route';
import {REST_API_PREFIX} from './constants/routes.constants'
 import apiLimiter from './middleware/rate-limit';
 import http from 'http';

const app = express();
app.use(express.json());
app.use(REST_API_PREFIX.API_V1,apiLimiter)
app.use(REST_API_PREFIX.API_V1,router);
import {Server} from 'socket.io'
import ChatSocket from './sockets/chat.socket';
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const server = http.createServer(app);
const io = new Server(server)
ChatSocket(io);
app.use((err: any, req: any,res: any, next: any) => {
    if(err.statusCode) {
        res.status(err.statusCode).json({message: err.message, code: err.code});

    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export {app,server};