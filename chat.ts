import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Chat from "./models/chatDetails";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

dotenv.config();

mongoose.set("strictQuery", true);

mongoose
  .connect(String(process.env.dbURI))
  .then(() => {
    console.log("Connected to db");
  })
  .catch((error) => {
    console.log(error);
  });

io.on("connection", (socket) => {
  console.log("Connection made");
  socket.on("join", async (data) => {
    let room: any = await Chat.findOne({
      $and: [
        { user1: { $in: [data.sender, data.receiver] } },
        { user2: { $in: [data.sender, data.receiver] } },
      ],
    });
    if (!room) {
      const chat = new Chat({
        user1: data.sender,
        user2: data.receiver,
        messages: [],
      });
      room = await chat.save();
    }
    socket.join(room._id.str);
    console.log(`${data.sender} joined ${room._id}`);
    socket.broadcast.to(room._id.str).emit("userJoined", {
      sender: data.sender,
      receiver: data.receiver,
      message: "has joined this room.",
    });
  });

  socket.on("leave", async (data) => {
    const room: any = await Chat.findOne({
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
  });

  socket.on("message", async (data) => {
    const room: any = await Chat.findOne({
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
    await Chat.updateOne(
      { _id: room._id },
      {
        $push: {
          messages: { sender: data.sender, message: data.message },
        },
      },
    );
  });
});

app.get("/chat", (req: any, res: { send: (arg0: string) => void }) => {
  res.send("From chat.js");
});
app.get(
  "/healthCheck",
  (req: any, res: { send: (arg0: { status: string }) => void }) => {
    res.send({ status: "OK" });
  },
);
server.listen(process.env.chatPORT, () => {
  console.log(
    `listening on :${process.env.chatPORT} for socket connection event`,
  );
});
