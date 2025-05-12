import React, { useEffect, useRef } from 'react'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import {formatMessageTime} from '../lib/utils.js'
import MessageSkeleton from '../components/skeleton/MessageSkeleton.jsx'

const ChatContainer = () => {
  const {messages, selectedUser, getMessages,isMessagesLoading, subscribeToMessages, unsubscribeFromMessages} = useChatStore();

  const {authUser, socket} = useAuthStore()
  const messageEndRef = useRef(null);

  console.log("socket", socket)

  useEffect(() => {
    getMessages(selectedUser);
  if (!socket) return;

  const onConnect = () => {
    console.log("Socket connected:", socket.id);
    subscribeToMessages();
  };

  socket.on("connect", onConnect);
  if (socket.connected) {
    onConnect();
  }

  return () => {
    socket.off("connect", onConnect);
    unsubscribeFromMessages();
  };
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages, socket])


  useEffect(() => {
  if (messageEndRef.current && messages) {
    messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages])

    if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <ChatInput />
      </div>
    );
    }
  
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser.data.userId ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser.data.userId
                      ? authUser.data.avatar || "/avatar.png"
                      : selectedUser.avatar || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col pt-0 px-0">
              {Array.isArray(message.images) && message.images.length > 0 && (
                <>
                  {message.images.length <= 3 ? (
                    <div className="flex gap-2 mb-2">
                      {message.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Attachment ${idx + 1}`}
                          className="w-full max-w-[140px] rounded-md object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {message.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Attachment ${idx + 1}`}
                          className="w-full max-h-48 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
              {message.text && <p className='ml-2 max-w-xs sm:max-w-md break-words whitespace-pre-wrap px-2 py-2'>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <ChatInput />
    </div>
  );
}

export default ChatContainer