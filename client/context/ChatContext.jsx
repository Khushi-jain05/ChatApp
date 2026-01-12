import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  /* ===================== STATE ===================== */
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  /* ===================== USERS ===================== */
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

      if (data?.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error?.message || "Failed to fetch users");
    }
  };

  /* ===================== MESSAGES ===================== */
  const getMessages = async (userId) => {
    if (!userId) return;

    try {
      const { data } = await axios.get(`/api/messages/${userId}`);

      if (data?.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to fetch messages");
    }
  };

  const sendMessage = async (messageData) => {
    if (!selectedUser?._id) return;

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data?.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data?.message || "Message not sent");
      }
    } catch (error) {
      toast.error(error?.message || "Error sending message");
    }
  };

  /* ===================== SOCKET ===================== */
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (!newMessage) return;

      // Chat currently open
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;

        setMessages((prev) => [...prev, newMessage]);

        axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
      } else {
        // Increase unseen count
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, axios]);

  /* ===================== CONTEXT ===================== */
  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    
    setUnseenMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
