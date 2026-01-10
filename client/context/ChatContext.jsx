import { createContext, useState } from "react";

export const ChatContext=createContext()
export const ChatProvider=({children})=>{
    const [messages,setMessages]=useState({})
    const [users,setUsers]=useState([])
    const [selectedUser,setSelectedUser]=useState(null)
    const [unseenMessages,setUnseenMessages]=useState({})
    const value={

    }
    return (<ChatContext.Provider value={value}>
{children}
    </ChatContext.Provider>)
}