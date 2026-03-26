import { create } from "zustand";
import api from "@/lib/api";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
    return data.user;
  },

  signup: async (email, password, fullName, charityId) => {
    const { data } = await api.post("/auth/signup", {
      email,
      password,
      fullName,
      charityId,
    });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
    return data.user;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  updateProfile: async (updates) => {
    const { data } = await api.put("/auth/me", updates);
    set({ user: data.user });
    return data.user;
  },

  changePassword: async (currentPassword, newPassword) => {
    await api.put("/auth/change-password", { currentPassword, newPassword });
  },
}));

export default useAuthStore;
