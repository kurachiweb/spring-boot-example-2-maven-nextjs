import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:55032/api";

// アクセストークンをメモリに保持（ページリロードで消える）
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true, // HTTP-Only Cookie（refreshToken）を送信するために必要
});

// Request interceptor - メモリ内のアクセストークンをヘッダーに追加
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - トークンリフレッシュを試行
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 公開エンドポイント（認証不要）のリスト
      const publicEndpoints = ["/auth/", "/posts", "/users/"];

      // リクエストURLが公開エンドポイントの場合、リフレッシュを試みない
      const isPublicEndpoint = publicEndpoints.some((endpoint) =>
        originalRequest.url?.includes(endpoint),
      );

      // アクセストークンが存在しない、または公開エンドポイントの場合はリフレッシュしない
      if (!accessToken || isPublicEndpoint) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Refresh Token（HTTP-Only Cookie）を使って新しいアクセストークンを取得
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken: newAccessToken } = response.data;
        setAccessToken(newAccessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh Token が無効な場合
        setAccessToken(null);

        // 公開ページではリダイレクトしない
        const publicPaths = [
          "/login",
          "/register",
          "/password-reset",
          "/@", // プロフィールページ
          "/posts/", // 投稿詳細ページ
          "/", // トップページ
        ];

        const isPublicPage =
          typeof window !== "undefined" &&
          publicPaths.some(
            (path) =>
              window.location.pathname.startsWith(path) ||
              window.location.pathname === "/",
          );

        if (!isPublicPage && typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Access forbidden");
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error("Resource not found");
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error("Server error occurred");
    }

    return Promise.reject(error);
  },
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>;

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      const firstErrorKey = Object.keys(errors)[0];
      return errors[firstErrorKey][0];
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return "An unexpected error occurred";
};
