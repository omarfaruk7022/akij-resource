"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(
            "/api/auth/login",
            { email, password, role },
            { withCredentials: true }
          );
          const { user, token } = res.data;
          set({ user, token, isLoading: false, error: null });
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          return { success: true, user };
        } catch (err) {
          const error = err.response?.data?.error || "Login failed";
          set({ isLoading: false, error });
          return { success: false, error };
        }
      },

      register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(
            "/api/auth/register",
            { name, email, password, role },
            { withCredentials: true }
          );
          const { user, token } = res.data;
          set({ user, token, isLoading: false, error: null });
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          return { success: true, user };
        } catch (err) {
          const error = err.response?.data?.error || "Registration failed";
          set({ isLoading: false, error });
          return { success: false, error };
        }
      },

      logout: async () => {
        try {
          await axios.post("/api/auth/logout", {}, { withCredentials: true });
        } catch {}
        delete axios.defaults.headers.common["Authorization"];
        set({ user: null, token: null, error: null });
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return null;
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const res = await axios.get("/api/auth/me", {
            withCredentials: true,
          });
          set({ user: res.data.user });
          return res.data.user;
        } catch {
          set({ user: null, token: null });
          return null;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state?.token) {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

export default useAuthStore;
