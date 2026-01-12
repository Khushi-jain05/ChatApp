import React, { useEffect, useState, useContext } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(messages.filter((m) => m.image).map((m) => m.image));
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <div className="bg-[#8185B2]/10 text-white w-full relative overflow-y-auto hidden md:block">
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          className="w-20 rounded-full"
        />

        <h1 className="text-xl font-medium flex items-center gap-2">
          {onlineUsers?.[selectedUser._id] && (
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          )}
          {selectedUser.fullName}
        </h1>

        <p className="text-center px-5">{selectedUser.bio}</p>
      </div>

      <hr className="border-[#ffffff50] my-4" />

      <div className="px-5 text-xs">
        <p>Media</p>
        <div className="mt-2 grid grid-cols-2 gap-4">
          {msgImages.map((url, i) => (
            <img
              key={i}
              src={url}
              onClick={() => window.open(url)}
              className="cursor-pointer rounded-md"
            />
          ))}
        </div>
      </div>

      <button
        onClick={logout}
        className="absolute bottom-5 left-1/2 -translate-x-1/2
        bg-gradient-to-r from-purple-400 to-violet-600 text-sm px-10 py-2 rounded-full"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
