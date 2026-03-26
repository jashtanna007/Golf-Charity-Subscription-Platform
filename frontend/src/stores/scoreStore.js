import { create } from "zustand";
import api from "@/lib/api";

const useScoreStore = create((set) => ({
  scores: [],
  isLoading: false,
  error: null,

  fetchScores: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/scores");
      set({ scores: data.scores, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to fetch scores", isLoading: false });
    }
  },

  addScore: async (score, playedDate) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/scores", { score, playedDate });
      set({ scores: data.scores, isLoading: false });
      return data.score;
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to add score", isLoading: false });
      throw err;
    }
  },

  deleteScore: async (scoreId) => {
    try {
      await api.delete(`/scores/${scoreId}`);
      set((state) => ({
        scores: state.scores.filter((s) => s.id !== scoreId),
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to delete score" });
    }
  },
}));

export default useScoreStore;
