import React from 'react';
import {useChatStore} from '../store/useChatStore';

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { Stories } from '../components/Stories';
import { Feed } from '../components/Feed';
import MessagesPanel from '../components/MessagesPanel';

const Homepage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            

          </div>
        </div>
      </div>
    </div>
//     <div className="w-full min-h-screen bg-gray-50 flex justify-center">
//   <div className="grid grid-cols-9 w-full max-w-[96%]">
//     {/* Sidebar - Cột 1/6 */}
//     <div className="col-span-2">
//       <SidebarMain />
//     </div>

//     <div className="col-span-4 px-6">
//       <Stories />
//       <Feed />
//     </div>

//     <div className="col-span-3 border-l border-gray-200 bg-white p-4">
//       <MessagesPanel/>
//     </div>
//   </div>
// </div>


  );
}

export default Homepage