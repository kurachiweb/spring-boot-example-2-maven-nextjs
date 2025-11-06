import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import apiClient, { handleApiError } from "@/lib/api";
import {
  Post,
  PostDto,
  PostsResponse,
  CreatePostRequest,
  LikeResponse,
} from "@/types/post";

// PostDtoをPostに変換するヘルパー関数
const convertPostDtoToPost = (dto: PostDto): Post => {
  return {
    id: dto.id,
    userId: dto.userId,
    content: dto.content,
    parentPostId: dto.parentPostId,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    user: {
      id: dto.userId,
      username: dto.username,
      email: "", // バックエンドからは返ってこない
      profileImageUrl: dto.userProfileImageUrl,
      bio: "", // バックエンドからは返ってこない
      createdAt: "", // バックエンドからは返ってこない
      updatedAt: "", // バックエンドからは返ってこない
    },
    replyCount: dto.repliesCount,
    likeCount: dto.likesCount,
    isLikedByCurrentUser: dto.isLikedByCurrentUser ?? false,
  };
};

// Fetch all posts with pagination
export const usePosts = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: ["posts", page, size],
    queryFn: async () => {
      const response = await apiClient.get<PostsResponse>("/posts", {
        params: { page, size },
      });
      return response.data;
    },
  });
};

// Fetch posts with infinite scroll
export const useInfinitePosts = (
  size: number = 20,
  enabled: boolean = true,
) => {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get<PostsResponse>("/posts", {
        params: { page: pageParam, size },
      });
      const data = response.data;
      // PostDtoをPostに変換
      const posts = data.content.map(convertPostDtoToPost);
      return {
        posts,
        currentPage: data.number,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages - 1) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled, // 認証初期化が完了するまでクエリを無効化
  });
};

// Fetch user posts with infinite scroll
export const useUserPosts = (
  username: string,
  size: number = 20,
  enabled: boolean = true,
) => {
  return useInfiniteQuery({
    queryKey: ["posts", "user", username],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get<PostsResponse>(
        `/users/${username}/posts`,
        {
          params: { page: pageParam, size },
        },
      );
      const data = response.data;
      // PostDtoをPostに変換
      const posts = data.content.map(convertPostDtoToPost);
      return {
        posts,
        currentPage: data.number,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages - 1) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: enabled && !!username, // 認証初期化が完了し、usernameがある場合のみクエリを有効化
  });
};

// Fetch single post
export const usePost = (postId: number) => {
  return useQuery({
    queryKey: ["posts", postId],
    queryFn: async () => {
      const response = await apiClient.get<PostDto>(`/posts/${postId}`);
      return convertPostDtoToPost(response.data);
    },
    enabled: !!postId,
  });
};

// Fetch post replies
export const usePostReplies = (postId: number, size: number = 20) => {
  return useInfiniteQuery({
    queryKey: ["posts", postId, "replies"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get<PostsResponse>(
        `/posts/${postId}/replies`,
        {
          params: { page: pageParam, size },
        },
      );
      const data = response.data;
      // PostDtoをPostに変換
      const posts = data.content.map(convertPostDtoToPost);
      return {
        posts,
        currentPage: data.number,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages - 1) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!postId,
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostRequest) => {
      const response = await apiClient.post<PostDto>("/posts", data);
      return convertPostDtoToPost(response.data);
    },
    onSuccess: (data) => {
      // Invalidate posts queries to refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      // If it's a reply, invalidate the parent post
      if (data.parentPostId) {
        queryClient.invalidateQueries({
          queryKey: ["posts", data.parentPostId, "replies"],
        });
        queryClient.invalidateQueries({
          queryKey: ["posts", data.parentPostId],
        });
      }
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });
};

// Delete post mutation
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiClient.delete(`/posts/${postId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate posts queries to refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });
};

// Like post mutation
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiClient.post<LikeResponse>(
        `/posts/${postId}/like`,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate posts queries to update like counts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });
};

// Unlike post mutation
export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiClient.delete<LikeResponse>(
        `/posts/${postId}/like`,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate posts queries to update like counts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    },
  });
};
