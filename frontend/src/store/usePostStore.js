import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
// import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set) => ({
  feeds: [],
  //   selectedUser: null,
  isPosting: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  onlineUsers: [],

  getListFeeds: async () => {
    set({ isFeedsLoading: true });
    try {
      const res = await axiosInstance.get("/message/get-list-user-chat");
      set({ users: res.data.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isFeedsLoading: false });
    }
  },

  createPost: async (data) => {
    console.log("data", data);
    set({ isPosting: true });
    try {
      await axiosInstance.post("/post/create-post", data);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isPosting: false });
    }
  },
}));
