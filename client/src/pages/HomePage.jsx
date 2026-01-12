import React, { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden
        h-full grid ${
          selectedUser
            ? "grid-cols-1 md:grid-cols-[1fr_2fr_1fr]"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        <Sidebar />
        <ChatContainer />
        {selectedUser && <RightSidebar />}
      </div>
    </div>
  );
};

export default HomePage;
