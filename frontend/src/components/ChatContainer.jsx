import React, { useEffect, useRef, useState } from 'react'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import {formatMessageTime} from '../lib/utils.js'
import MessageSkeleton from '../components/skeleton/MessageSkeleton.jsx'
import ImagePreview from '../components/ImagePreview' 
import {LoaderCircle} from 'lucide-react'
import dayjs from 'dayjs'; // đảm bảo bạn đã cài `dayjs`


const groupMessagesByDate = (messages) => {
      return messages.reduce((groups, message) => {
        const date = dayjs(message.createdAt).format("DD/MM/YYYY");
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
        return groups;
      }, {});
    };

    const renderTextWithLinks = (text) => {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};


const ChatContainer = () => {
  const {messages, selectedUser, getMessages,isMessagesLoading, subscribeToMessages, unsubscribeFromMessages} = useChatStore();

  const {authUser, socket} = useAuthStore()
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
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
    messageEndRef.current.scrollIntoView({ behavior: "smooth"});
    }
  }, [messages])

  
    
    const groupedMessages = groupMessagesByDate(messages);
    const sortedDates = Object.keys(groupedMessages).sort((a, b) =>
      dayjs(a, 'DD/MM/YYYY').isAfter(dayjs(b, 'DD/MM/YYYY')) ? -1 : 1
    );

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
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="text-center my-4 text-gray-500 font-semibold">
             {date} 
          </div>

          {groupedMessages[date].map((message, index) => {
            const isLast =
              index === groupedMessages[date].length - 1 &&
              date === sortedDates[sortedDates.length - 1];

            return (
              <div
                key={message._id}
                className={`chat ${message.senderId === authUser.data.userId ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar">
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

                <div
                  className={`bg-primary text-primary-content flex flex-col pt-0 px-0 overflow-hidden rounded-xl max-w-xs sm:max-w-md ${
                    message.text ? "pb-2" : "pb-0"
                  }`}
                >
                  {(Array.isArray(message.tempImages) && message.tempImages.length > 0 ||
                    Array.isArray(message.images) && message.images.length > 0) && (
                    <div className="flex flex-col">
                      {(() => {
                        const imageRows = [];
                        const imagesToRender =
                          message.tempImages?.length > 0 ? message.tempImages : message.images;
                        const isOdd = imagesToRender.length % 2 !== 0;
                        const limit = isOdd ? imagesToRender.length - 1 : imagesToRender.length;

                        for (let i = 0; i < limit; i += 2) {
                          imageRows.push(
                            <div key={`row-${i}`} className="flex">
                              <img
                                src={imagesToRender[i]}
                                alt={`Attachment ${i + 1}`}
                                className="w-1/2 h-32 object-cover"
                                onClick={() => setPreviewImageUrl(imagesToRender[i])}
                              />
                              <img
                                src={imagesToRender[i + 1]}
                                alt={`Attachment ${i + 2}`}
                                className="w-1/2 h-32 object-cover"
                                onClick={() => setPreviewImageUrl(imagesToRender[i + 1])}
                              />
                            </div>
                          );
                        }

                        if (isOdd) {
                          imageRows.push(
                            <div key={`last-image`} className="w-full">
                              <img
                                src={imagesToRender[imagesToRender.length - 1]}
                                alt={`Attachment ${imagesToRender.length}`}
                                className="w-full h-40 object-cover"
                                onClick={() =>
                                  setPreviewImageUrl(imagesToRender[imagesToRender.length - 1])
                                }
                              />
                            </div>
                          );
                        }

                        return imageRows;
                      })()}
                    </div>
                  )}

                  {message.text && (
                    <p className="ml-2 max-w-xs sm:max-w-md break-words whitespace-pre-wrap px-2 py-2">
                      {renderTextWithLinks(message.text)}
                    </p>
                  )}
                </div>

                {isLast && (
                  <div className="mt-2 h-5 flex items-center gap-1 text-xs text-zinc-400">
                    {message.status === "sending" ? (
                      <>
                        <LoaderCircle className="animate-spin size-4" />
                        <span>Sending</span>
                      </>
                    ) : (
                      <span className="invisible">Sending</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messageEndRef}></div>
    </div>

    {previewImageUrl && (
      <ImagePreview imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
    )}

    <ChatInput />
  </div>
);

}

export default ChatContainer