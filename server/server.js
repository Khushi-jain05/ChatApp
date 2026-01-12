import "dotenv/config";

import express from "express";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: { origin: "*" },
});

// userId -> socketId
export const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (!userId) {
        console.log("Socket connected without userId");
        return;
    }

    console.log("User Connected:", userId);

    // ✅ store user
    userSocketMap[userId] = socket.id;

    // ✅ emit OBJECT (not array)
    io.emit("getOnlineUsers", userSocketMap);

    socket.on("disconnect", () => {
        console.log("User Disconnected:", userId);

        delete userSocketMap[userId];

        // ✅ emit OBJECT again
        io.emit("getOnlineUsers", userSocketMap);
    });
});

app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
);
