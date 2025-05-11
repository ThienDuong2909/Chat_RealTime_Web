import { Check } from "lucide-react";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

export const useUserStore = create((set) => ({
  isUpadatingFullname: false,
  isUpadatingAvatar: false,

  updateFullname: async (data) => {
    set({ isUpadatingFullname: true });
    try {
      await axiosInstance.post("/user/update-fullname", data);
      await useAuthStore.getState().checkAuth();
    } catch (error) {
      const errorMessage = error || "Request failed";
      console.log("ERROR: ", errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isUpadatingFullname: false });
    }
  },
  updateAvatar: async (data) => {
    set({ isUpadatingAvatar: true });
    try {
      await axiosInstance.post("/user/update-avatar", data);
      await useAuthStore.getState().checkAuth();
    } catch (error) {
      const errorMessage = error || "Request failed";
      console.log("ERROR: ", errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isUpadatingAvatar: false });
    }
  },
}));
