import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient, { handleApiError } from "@/lib/api";
import { User, UpdateProfileRequest } from "@/types/user";

// Fetch user by username
export const useUser = (username: string) => {
  return useQuery({
    queryKey: ["users", username],
    queryFn: async () => {
      const response = await apiClient.get<User>(`/users/${username}`);
      return response.data;
    },
    enabled: !!username,
  });
};

// Fetch follower count
export const useFollowerCount = (userId: number) => {
  return useQuery({
    queryKey: ["users", userId, "follower-count"],
    queryFn: async () => {
      const response = await apiClient.get<{ count: number }>(
        `/users/${userId}/followers/count`,
      );
      return response.data.count;
    },
    enabled: !!userId,
  });
};

// Fetch following count
export const useFollowingCount = (userId: number) => {
  return useQuery({
    queryKey: ["users", userId, "following-count"],
    queryFn: async () => {
      const response = await apiClient.get<{ count: number }>(
        `/users/${userId}/following/count`,
      );
      return response.data.count;
    },
    enabled: !!userId,
  });
};

// Check if user is followed
// 注意: このAPIは認証が必要です。認証されていない場合はenabledをfalseにする必要があります
export const useIsFollowing = (
  userId: number,
  isAuthenticated: boolean = true,
) => {
  return useQuery({
    queryKey: ["users", userId, "is-following"],
    queryFn: async () => {
      const response = await apiClient.get<{ isFollowing: boolean }>(
        `/users/${userId}/is-following`,
      );
      return response.data.isFollowing;
    },
    enabled: !!userId && isAuthenticated,
  });
};

// Update user profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await apiClient.put<User>("/users/me", data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ["users", data.username] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });
};

// Upload profile image mutation
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await apiClient.post<{ profileImageUrl: string }>(
        "/users/me/profile-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });
};

// Follow user mutation
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.post(`/users/${userId}/follow`);
      return response.data;
    },
    onSuccess: (_, userId) => {
      // Invalidate follow-related queries
      queryClient.invalidateQueries({
        queryKey: ["users", userId, "follower-count"],
      });
      queryClient.invalidateQueries({
        queryKey: ["users", userId, "is-following"],
      });
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });
};

// Unfollow user mutation
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.delete(`/users/${userId}/follow`);
      return response.data;
    },
    onSuccess: (_, userId) => {
      // Invalidate follow-related queries
      queryClient.invalidateQueries({
        queryKey: ["users", userId, "follower-count"],
      });
      queryClient.invalidateQueries({
        queryKey: ["users", userId, "is-following"],
      });
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });
};
