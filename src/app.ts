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
    🛡️  Server listening on port: 1234🛡️
    ################################################
    `);
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});



// 채팅 방 네임스페이스
const RoomNames:string[] = [];

const chatRoom = io.of("/chatRoom");
const backServer = io.of("/socketApi");

backServer.on("connection", (socket) => {
    console.log("Server Login");

    socket.on("sendToRerenderRoomList", () => {

        console.log("프론트에게 리렌더링 소켓 요청");
        chatRoom.emit("reRenderRoomList");

    })
})

chatRoom.on("connection", (socket) => {
    console.log("Client Login", socket.id);
    //초기 로딩 방 목록 가져오기
    socket.on("reqRoomList", () => {
        socket.emit("getRoomList", RoomNames);
    })

    //채팅방 생성 메서드
    socket.on("createRoomTest", (roomName) => {

        socket.join(roomName);

        if(!RoomNames.includes(roomName)){
            RoomNames.push(roomName);
            chatRoom.to(socket.id).emit("getRoomList", RoomNames);
        } else {
            console.log("이미 존재하는 방 이름입니다.");
            chatRoom.to(socket.id).emit("existRoomName");
        }
        
        console.log(chatRoom.adapter.rooms);
        
    });

    //채팅방 Join 메서드
    socket.on("joinRoom", (data) => {
        socket.join(data.roomName);
        console.log(data.roomName + "방에" + data.name + "님이 입장하셨습니다.");
    });
    
    //메세지 송수신 메서드
    socket.on("message", (message: Message) => {
        chatRoom.in(message.room).emit("message", message);
    });

    //채팅방 나가기 메서드
    socket.on("leave", (message: Message) => {
        socket.leave(message.room);
        chatRoom.in(message.room).emit("leave", message);
    });

})

// 전역
io.on('connection', async (socket) => {

    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
 
    console.log("New Client Connect", ip, socket.id);

    socket.on("client login", ({name}) => {
        socket.data.type = "Client";
        socket.data.name = name;
        console.log("User Login: " + name);
    });

    // 연결 종료 시
    socket.on('disconnect', () => {
        console.log('클라이언트 접속 해제', socket.id);
    });

})