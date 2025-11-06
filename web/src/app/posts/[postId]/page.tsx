"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { usePost, usePostReplies } from "@/hooks/usePosts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useAuth } from "@/hooks/useAuth";
import { PostCard } from "@/components/post/PostCard";
import { PostForm } from "@/components/post/PostForm";
import {
  LoadingSpinner,
  LoadingText,
} from "@/components/common/LoadingSpinner";

export default function PostDetailPage() {
  const params = useParams();
  const postId = parseInt(params.postId as string, 10);
  const { isAuthenticated } = useAuth();

  // Fetch main post
  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
    error: postError,
  } = usePost(postId);

  // Fetch replies with infinite scroll
  const {
    data: repliesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isRepliesLoading,
  } = usePostReplies(postId, 20);

  const { ref } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
  });

  if (isPostLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="投稿を読み込んでいます..." />
      </div>
    );
  }

  if (isPostError || !post) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <p className="mb-4 text-red-600">
          {postError instanceof Error
            ? postError.message
            : "投稿が見つかりませんでした"}
        </p>
        <Link
          href="/"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          タイムラインに戻る
        </Link>
      </div>
    );
  }

  const replies = repliesData?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          戻る
        </Link>
      </div>

      {/* Main Post */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-4 text-xl font-bold text-gray-900">投稿詳細</h1>
        <PostCard post={post} showReplyButton={false} />
      </div>

      {/* Reply Form */}
      {isAuthenticated && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">返信する</h2>
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-900">
              <span className="font-medium">@{post.user.username}</span>への返信
            </p>
          </div>
          <PostForm parentPostId={post.id} placeholder="返信を入力..." />
        </div>
      )}

      {/* Replies Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          返信{" "}
          {!isRepliesLoading && replies.length > 0 && `(${replies.length})`}
        </h2>

        {isRepliesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner text="返信を読み込んでいます..." />
          </div>
        ) : replies.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <p className="text-gray-600">まだ返信がありません</p>
            {!isAuthenticated && (
              <p className="mt-2 text-sm text-gray-500">
                <Link href="/login" className="text-blue-600 hover:underline">
                  ログイン
                </Link>
                して最初の返信をしましょう
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {replies.map((reply) => (
                <PostCard key={reply.id} post={reply} showReplyButton={false} />
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
            {!hasNextPage && replies.length > 0 && (
              <div className="mt-4 py-4 text-center">
                <p className="text-sm text-gray-500">
                  すべての返信を表示しました
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
