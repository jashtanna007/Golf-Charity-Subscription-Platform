import { create } from "zustand";
import api from "@/lib/api";

const useSubscriptionStore = create((set) => ({
  subscription: null,
  payments: [],
  isLoading: false,
  error: null,

  fetchSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/subscriptions");
      set({ subscription: data.subscription, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to fetch subscription", isLoading: false });
    }
  },

  createCheckout: async (planType) => {
    try {
      const { data } = await api.post("/subscriptions/create-checkout", { planType });
      window.location.href = data.url;
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to create checkout" });
      throw err;
    }
  },

  cancelSubscription: async () => {
    try {
      await api.post("/subscriptions/cancel");
      set((state) => ({
        subscription: state.subscription
          ? { ...state.subscription, status: "cancelled" }
          : null,
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to cancel subscription" });
      throw err;
    }
  },

  fetchPayments: async () => {
    try {
      const { data } = await api.get("/subscriptions/payments");
      set({ payments: data.payments });
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to fetch payments" });
    }
  },
}));

export default useSubscriptionStore;
