"use client";

import React, { useState } from "react";
import { useInfinitePosts } from "@/hooks/usePosts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useAuth } from "@/hooks/useAuth";
import { PostCard } from "./PostCard";
import { PostForm } from "./PostForm";
import {
  LoadingSpinner,
  LoadingText,
} from "@/components/common/LoadingSpinner";
import { Post } from "@/types/post";

interface PostListProps {
  username?: string;
  showPostForm?: boolean;
}

export const PostList: React.FC<PostListProps> = ({ showPostForm = false }) => {
  // 認証の初期化が完了するまで待つ
  const { isLoading: isAuthLoading } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfinitePosts(20, !isAuthLoading); // 認証初期化が完了したらクエリを有効化

  const [replyingTo, setReplyingTo] = useState<Post | null>(null);

  const { ref } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
  });

  const handleReplyClick = (post: Post) => {
    setReplyingTo(post);
    // Scroll to reply form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReplySuccess = () => {
    setReplyingTo(null);
  };

  // 認証初期化中またはデータ読み込み中
  if (isAuthLoading || isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="投稿を読み込んでいます..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-red-600">
          {error?.message || "投稿の読み込みに失敗しました"}
        </p>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts || []) || [];

  return (
    <div className="space-y-4">
      {/* Post Form */}
      {showPostForm && (
        <div className="space-y-4">
          {replyingTo && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-blue-900">
                  @{replyingTo.user.username}への返信
                </p>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="line-clamp-2 text-sm text-gray-700">
                {replyingTo.content}
              </p>
            </div>
          )}
          <PostForm
            parentPostId={replyingTo?.id}
            placeholder={replyingTo ? "返信を入力..." : "今何してる?"}
            onSuccess={handleReplySuccess}
            autoFocus={!!replyingTo}
          />
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">まだ投稿がありません</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onReplyClick={handleReplyClick}
              />
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          {hasNextPage && (
            <div ref={ref} className="py-4">
              {isFetchingNextPage ? (
                <LoadingText text="さらに読み込んでいます..." />
              ) : (
                <div className="h-4" />
              )}
            </div>
          )}

          {/* End of List */}
          {!hasNextPage && posts.length > 0 && (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500">
                すべての投稿を表示しました
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
