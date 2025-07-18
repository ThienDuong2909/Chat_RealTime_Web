import React from 'react'
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { X, Video  } from 'lucide-react';
import ZegoVideoCall from "./ZegoVideoCall";
import { useNavigate } from "react-router-dom"; 


const ChatHeader = () => {

  const {selectedUser, setSelectedUser, sendMessage} = useChatStore();
  const {onlineUsers} = useAuthStore();
  const { authUser } = useAuthStore(); 
   const navigate = useNavigate();
  const handleStartCall = async  () => {
    const roomID = [authUser._id, selectedUser._id].sort().join('_');
    const callLink = `${window.location.origin}/video-call?roomID=${roomID}`;
    await sendMessage({
    text: `Video calls begin! Click the link to join: ${callLink}`,
    images: null,
  });
    navigate(`/video-call?roomID=${roomID}`);
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.avatar || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="flex items-center gap-4">
           <button onClick={handleStartCall}>
            <Video className="w-5 h-5" />
          </button>
          <button onClick={() => setSelectedUser(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
    </div>
  );
}

export default ChatHeader