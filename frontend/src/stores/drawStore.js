import { create } from "zustand";
import api from "@/lib/api";

const useDrawStore = create((set) => ({
  draws: [],
  currentDraw: null,
  userEntry: null,
  isLoading: false,
  error: null,

  fetchDraws: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/draws");
      set({ draws: data.draws, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to fetch draws", isLoading: false });
    }
  },

  fetchCurrentDraw: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/draws/current");
      set({ currentDraw: data.draw, userEntry: data.userEntry, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to fetch current draw", isLoading: false });
    }
  },

  enterDraw: async (drawId, entryNumbers) => {
    try {
      const { data } = await api.post("/draws/enter", { drawId, entryNumbers });
      set({ userEntry: data.entry });
      return data.entry;
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to enter draw" });
      throw err;
    }
  },

  fetchDrawResults: async (drawId) => {
    try {
      const { data } = await api.get(`/draws/${drawId}/results`);
      return data;
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to fetch results" });
      throw err;
    }
  },

  simulateDraw: async (drawType = "random") => {
    try {
      const { data } = await api.post("/admin/draws/simulate", { drawType });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.error || "Simulation failed" });
      throw err;
    }
  },

  executeDraw: async (drawType = "random") => {
    try {
      const { data } = await api.post("/admin/draws/execute", { drawType });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.error || "Draw execution failed" });
      throw err;
    }
  },

  publishDraw: async (drawId) => {
    try {
      const { data } = await api.post(`/admin/draws/${drawId}/publish`);
      return data;
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to publish draw" });
      throw err;
    }
  },
}));

export default useDrawStore;
