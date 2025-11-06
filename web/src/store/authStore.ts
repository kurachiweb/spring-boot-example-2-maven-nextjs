import { create } from "zustand";
import { User } from "@/types/user";
import apiClient from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: (user) => {
    // ユーザー情報はHTTP-Only Cookieに保存されている
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    // Cookieはログアウトエンドポイントで削除される
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    set((state) => {
      if (!state.user) return state;

      const updatedUser = { ...state.user, ...userData };
      // ユーザー情報はHTTP-Only Cookieに保存されている

      return { user: updatedUser };
    });
  },

  initializeAuth: async () => {
    try {
      // Refresh Token（HTTP-Only Cookie）を使って新しいアクセストークンを取得
      const refreshResponse = await apiClient.post("/auth/refresh");
      const { accessToken, user } = refreshResponse.data;

      // メモリにアクセストークンを保存
      const { setAccessToken } = await import("@/lib/api");
      setAccessToken(accessToken);

      set({
        user: user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Refresh Tokenが無効な場合（未ログインまたは期限切れ）
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
