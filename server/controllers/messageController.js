import Message from "../models/Message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

/* ================= USERS ================= */
export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    const unseenMessages = {};

    await Promise.all(
      filteredUsers.map(async (user) => {
        const count = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false,
        });
        if (count > 0) unseenMessages[user._id] = count;
      })
    );

    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= MESSAGES ================= */
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const { text = "", image = "" } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = "";

    // ✅ upload only if image exists
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat-images",
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
