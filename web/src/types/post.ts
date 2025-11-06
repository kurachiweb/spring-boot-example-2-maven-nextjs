import { User } from "./user";

// バックエンドから返ってくる投稿データの型
export interface PostDto {
  id: number;
  content: string;
  userId: number;
  username: string;
  userProfileImageUrl?: string;
  parentPostId?: number;
  likesCount: number;
  repliesCount: number;
  isLikedByCurrentUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

// フロントエンドで使う投稿データの型（user情報を含む）
export interface Post {
  id: number;
  userId: number;
  content: string;
  parentPostId?: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  replyCount: number;
  likeCount: number;
  isLikedByCurrentUser: boolean;
}

export interface PostResponse {
  post: Post;
}

export interface CreatePostRequest {
  content: string;
  parentPostId?: number;
}

// バックエンドのSpring Data Pageレスポンスの型
export interface PostsResponse {
  content: PostDto[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // currentPage
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface LikeResponse {
  message: string;
  likesCount: number;
}

export interface DeletePostResponse {
  message: string;
}
