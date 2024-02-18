"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const chatDetails_1 = __importDefault(require("./models/chatDetails"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
dotenv_1.default.config();
mongoose_1.default.set("strictQuery", true);
mongoose_1.default
    .connect(String(process.env.dbURI))
    .then(() => {
    console.log("Connected to db");
})
    .catch((error) => {
    console.log(error);
});
io.on("connection", (socket) => {
    console.log("Connection made");
    socket.on("join", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let room = yield chatDetails_1.default.findOne({
            $and: [
                { user1: { $in: [data.sender, data.receiver] } },
                { user2: { $in: [data.sender, data.receiver] } },
            ],
        });
        if (!room) {
            const chat = new chatDetails_1.default({
                user1: data.sender,
                user2: data.receiver,
                messages: [],
            });
            room = yield chat.save();
        }
        socket.join(room._id.str);
        console.log(`${data.sender} joined ${room._id}`);
        socket.broadcast.to(room._id.str).emit("userJoined", {
            sender: data.sender,
            receiver: data.receiver,
            message: "has joined this room.",
        });
    }));
    socket.on("leave", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const room = yield chatDetails_1.default.findOne({
            $and: [
                { user1: { $in: [data.sender, data.receiver] } },
                { user2: { $in: [data.sender, data.receiver] } },
            ],
        });
        socket.leave(room._id.str);
        console.log(`${data.sender} left ${room._id}`);
        socket.broadcast.to(room._id.str).emit("userLeft", {
            sender: data.sender,
            receiver: data.receiver,
            message: "has left this room.",
        });
    }));
    socket.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const room = yield chatDetails_1.default.findOne({
            $and: [
                { user1: { $in: [data.sender, data.receiver] } },
                { user2: { $in: [data.sender, data.receiver] } },
            ],
        });
        console.log(`${data.sender} said ${data.message} in ${room._id}`);
        io.in(room._id.str).emit("messageReceived", {
            sender: data.sender,
            receiver: data.receiver,
            message: data.message,
        });
        yield chatDetails_1.default.updateOne({ _id: room._id }, {
            $push: {
                messages: { sender: data.sender, message: data.message },
            },
        });
    }));
});
app.get("/chat", (req, res) => {
    res.send("From chat.js");
});
app.get("/healthCheck", (req, res) => {
    res.send({ status: "OK" });
});
server.listen(process.env.chatPORT, () => {
    console.log(`listening on :${process.env.chatPORT} for socket connection event`);
});
