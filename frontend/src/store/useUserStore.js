import { Check } from "lucide-react";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useUserStore = create((set) => ({
  isUpadatingProfile: false,

  updateProfile: async (data) => {
    set({ isUpadatingProfile: true });
    try {
      await axiosInstance.post("/user/update-profile", data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Request failed";
      console.log("ERROR: ", errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isResettingPassword: false });
    }
  },
}));
