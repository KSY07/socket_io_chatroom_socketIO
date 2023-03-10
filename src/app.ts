import express, {Request, Response, NextFunction} from 'express';
import { Server, Socket } from "socket.io";
import { Message } from './@types/message';

interface OnlineList {
    name: string,
    id: string
}

const app = express();

const server = app.listen('1234', () => {
    console.log(`
    ################################################
    π‘οΈ  Server listening on port: 1234π‘οΈ
    ################################################
    `);
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});



// μ±ν λ°© λ€μμ€νμ΄μ€
const RoomNames:string[] = [];

const chatRoom = io.of("/chatRoom");
const backServer = io.of("/socketApi");

backServer.on("connection", (socket) => {
    console.log("Server Login");

    socket.on("sendToRerenderRoomList", () => {

        console.log("νλ‘ νΈμκ² λ¦¬λ λλ§ μμΌ μμ²­");
        chatRoom.emit("reRenderRoomList");

    })
})

chatRoom.on("connection", (socket) => {
    console.log("Client Login", socket.id);
    //μ΄κΈ° λ‘λ© λ°© λͺ©λ‘ κ°μ Έμ€κΈ°
    socket.on("reqRoomList", () => {
        socket.emit("getRoomList", RoomNames);
    })

    //μ±νλ°© μμ± λ©μλ
    socket.on("createRoomTest", (roomName) => {

        socket.join(roomName);

        if(!RoomNames.includes(roomName)){
            RoomNames.push(roomName);
            chatRoom.to(socket.id).emit("getRoomList", RoomNames);
        } else {
            console.log("μ΄λ―Έ μ‘΄μ¬νλ λ°© μ΄λ¦μλλ€.");
            chatRoom.to(socket.id).emit("existRoomName");
        }
        
        console.log(chatRoom.adapter.rooms);
        
    });

    //μ±νλ°© Join λ©μλ
    socket.on("joinRoom", (data) => {
        socket.join(data.roomName);
        console.log(data.roomName + "λ°©μ" + data.name + "λμ΄ μμ₯νμ¨μ΅λλ€.");
    });
    
    //λ©μΈμ§ μ‘μμ  λ©μλ
    socket.on("message", (message: Message) => {
        chatRoom.in(message.room).emit("message", message);
    });

    //μ±νλ°© λκ°κΈ° λ©μλ
    socket.on("leave", (message: Message) => {
        socket.leave(message.room);
        chatRoom.in(message.room).emit("leave", message);
    });

})

// μ μ­
io.on('connection', async (socket) => {

    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
 
    console.log("New Client Connect", ip, socket.id);

    socket.on("client login", ({name}) => {
        socket.data.type = "Client";
        socket.data.name = name;
        console.log("User Login: " + name);
    });

    // μ°κ²° μ’λ£ μ
    socket.on('disconnect', () => {
        console.log('ν΄λΌμ΄μΈνΈ μ μ ν΄μ ', socket.id);
    });

})