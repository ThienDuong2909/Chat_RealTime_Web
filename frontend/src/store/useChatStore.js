import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  onlineUsers: [],

  getListUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/get-list-user-chat");
      set({ users: res.data.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (user) => {
    console.log("user", user);
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/get-messages/${user._id}`);
      console.log("Messages: ", res.data.data);

      set({ messages: res.data.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const tempId = Date.now().toString(); // Tạo ID tạm

    const tempMessage = {
      _id: tempId,
      senderId: useAuthStore.getState().authUser.data.userId,
      text: messageData.text,
      images: messageData.images, // base64 tạm
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    set({ messages: [...messages, tempMessage] });
    set({ isSendingMessage: true });

    try {
      const res = await axiosInstance.post(
        `/message/send-message/${selectedUser._id}`,
        messageData
      );

      const newMessageFromServer = res.data.data;
      newMessageFromServer.tempImages = messageData.images;

      const newMessages = get().messages.map((msg) =>
        msg._id === tempId ? newMessageFromServer : msg
      );

      set({ messages: newMessages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  subscribeToMessages: () => {
    const { selectedUser } = get();
    console.log("selectedUser", selectedUser);

    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    console.log("socket:", socket);
    console.log("socket.id:", socket?.id);
    console.log("socket.connected:", socket?.connected);

    socket.on("newMessage", (newMessage) => {
      // console.log("newMessage", newMessage);
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
      console.log("senderId", newMessage.senderId);
      console.log("selectedUser._id", selectedUser._id);

      console.log("Message", get().messages);
      console.log("newMessage", [...get().messages, newMessage]);

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
