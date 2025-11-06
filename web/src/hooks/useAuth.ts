import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import apiClient, { handleApiError, setAccessToken } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
} from "@/types/user";

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login, logout, initializeAuth } =
    useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials,
      );
      return response.data;
    },
    onSuccess: (data) => {
      // アクセストークンをメモリに保存
      if (data.accessToken) {
        setAccessToken(data.accessToken);
      }
      // Refresh TokenはHTTP-Only Cookieに保存される
      login(data.user);
      router.push("/");
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post("/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: () => {
      router.push("/login?registered=true");
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // HTTP-Only Cookieがサーバーサイドでクリアされる
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      // メモリからアクセストークンをクリア
      setAccessToken(null);
      logout();
      router.push("/login");
    },
    onError: () => {
      // Even if API call fails, logout locally
      setAccessToken(null);
      logout();
      router.push("/login");
    },
  });

  // Password reset request mutation
  const passwordResetRequestMutation = useMutation({
    mutationFn: async (data: PasswordResetRequest) => {
      const response = await apiClient.post(
        "/auth/password-reset/request",
        data,
      );
      return response.data;
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });

  // Password reset confirm mutation
  const passwordResetConfirmMutation = useMutation({
    mutationFn: async (data: PasswordResetConfirm) => {
      const response = await apiClient.post("/auth/password-reset/confirm", {
        token: data.token,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      router.push("/login?reset=true");
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
    isLogoutLoading: logoutMutation.isPending,
    requestPasswordReset: passwordResetRequestMutation.mutate,
    requestPasswordResetAsync: passwordResetRequestMutation.mutateAsync,
    isPasswordResetRequestLoading: passwordResetRequestMutation.isPending,
    passwordResetRequestError: passwordResetRequestMutation.error,
    confirmPasswordReset: passwordResetConfirmMutation.mutate,
    confirmPasswordResetAsync: passwordResetConfirmMutation.mutateAsync,
    isPasswordResetConfirmLoading: passwordResetConfirmMutation.isPending,
    passwordResetConfirmError: passwordResetConfirmMutation.error,
  };
};
