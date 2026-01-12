import React, { useState, useRef, useEffect, useContext } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages = [],
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers = {} } = useContext(AuthContext);

  const scrollEnd = useRef(null);
  const [input, setInput] = useState("");

  /* ================= SEND TEXT ================= */
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    await sendMessage({ text: input.trim() });
    setInput("");
  };

  /* ================= SEND IMAGE ================= */
  const handleSendImage = async (e) => {
    const file = e.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  /* ================= FETCH MESSAGES ================= */
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= EMPTY STATE ================= */
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} alt="" className="max-w-16" />
        <p className="text-lg font-medium text-white">
          Chat anytime, anywhere
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative backdrop-blur-lg overflow-hidden">
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />

        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers?.[selectedUser._id] && (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          )}
        </p>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden w-7 cursor-pointer"
        />
      </div>

      {/* ================= MESSAGES ================= */}
<div className="flex-1 overflow-y-auto p-3 pb-6">
  {messages.map((message) => {
    const isMe = message.senderId === authUser?._id;

    return (
      <div
        key={message._id}
        className={`flex items-end gap-2 mb-4 ${
          isMe ? "justify-end" : "justify-start"
        }`}
      >
        {/* Avatar (left for receiver) */}
        {!isMe && (
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-7 h-7 rounded-full"
          />
        )}

        {/* Message bubble */}
        {message.image ? (
          <img
            src={message.image}
            alt=""
            className="max-w-[230px] rounded-lg border border-gray-700"
          />
        ) : (
          <p
            className={`px-3 py-2 max-w-[240px] text-sm rounded-lg break-words
              ${
                isMe
                  ? "bg-violet-600 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
              }`}
          >
            {message.text}
          </p>
        )}

        {/* Avatar (right for sender) */}
        {isMe && (
          <img
            src={authUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-7 h-7 rounded-full"
          />
        )}
      </div>
    );
  })}
  <div ref={scrollEnd} />
</div>


      {/* ================= INPUT ================= */}
      <div className="flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 bg-transparent outline-none text-white placeholder-gray-400"
          />

          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/*"
            hidden
          />

          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>

        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ChatContainer;
