import { Check } from "lucide-react";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3030" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isLogingOut: false,
  isUpdatingProfile: false,
  isVerifyingOTP: false,
  isResendCooldown: false,
  isRequestingPasswordReset: false,
  isResettingPassword: false,
  isCheckingAuth: true,
  socket: null,
  onlineUsers: [],
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      if (res.data) {
        get().connectSocket();
      }
      console.log("authUser::", res.data);
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      await useAuthStore.getState().checkAuth();
      get().connectSocket();
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      console.log("ERROR: ", errorMessage);
      set({ authUser: null });
      throw new Error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  loginWithGoogle: async (credential) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/google-login", {
        credential,
      });

      await get().checkAuth();
      get().connectSocket();

      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Google login failed";
      console.log("ERROR: ", errorMessage);
      set({ authUser: null });
      throw new Error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLogingOut: true });
    try {
      await axiosInstance.post("/auth/logout");
      await useAuthStore.getState().disconnectSocket();
      set({ authUser: null });

      toast.error("You have been logout ");
    } catch (error) {
      console.log("Logout failed: " + error);
    } finally {
      set({ isLogingOut: false });
    }
  },
  signup: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success("Sign up successful! Please verify your email with OTP");
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed";
      console.log("ERROR: ", errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isSigningUp: false });
    }
  },
  verifyOTP: async ({ email, otpCode, flow }) => {
    set({ isVerifyingOTP: true });
    console.log("data", { email, otpCode, flow });
    let path =
      flow == "signup"
        ? "/auth/confirm-register"
        : "/auth/confirm-forgot-password";

    console.log("FLOW:", flow);

    try {
      await axiosInstance.post(path, { email, otpCode });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Verify OTP failed";
      console.log("ERROR: ", errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isVerifyingOTP: false });
    }
  },
  refreshOTP: async (data) => {
    set({ isResendCooldown: true });
    console.log("data", data);
    try {
      await axiosInstance.post("/auth/refresh-otp", data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Verify OTP failed";
      console.log("ERROR: ", errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isResendCooldown: false });
    }
  },
  requestPasswordReset: async (data) => {
    set({ isRequestingPasswordReset: true });
    try {
      await axiosInstance.post("/auth/forgot-password", { email: data });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Request failed";
      console.log("ERROR: ", errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isResendCooldown: false });
    }
  },
  resetPassword: async (data) => {
    set({ isResettingPassword: true });
    try {
      await axiosInstance.post("/auth/reset-password", data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Request failed";
      console.log("ERROR: ", errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isResettingPassword: false });
    }
  },
  connectSocket: async () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;
    console.log("authUser.data._id", authUser?.data._id);

    const socket = io(BASE_URL, {
      query: {
        userId: authUser.data.userId,
      },
    });
    socket.on("connect_error", (err) => {
      console.error("Lỗi kết nối Socket.IO:", err.message);
    });
    socket.connect();

    set({ socket: socket });

    console.log("socket", socket);
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
    console.log("Online users:", useAuthStore.getState().onlineUsers);
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
