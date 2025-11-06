"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Post } from "@/types/post";
import { formatRelativeTime, getImageUrl } from "@/lib/utils";
import { useLikePost, useUnlikePost, useDeletePost } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";

interface PostCardProps {
  post: Post;
  showReplyButton?: boolean;
  onReplyClick?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  showReplyButton = true,
  onReplyClick,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();
  const { mutate: deletePost } = useDeletePost();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwnPost = user?.id === post.user.id;

  const handleLikeToggle = () => {
    if (!isAuthenticated) {
      alert("いいねするにはログインが必要です");
      return;
    }

    if (post.isLikedByCurrentUser) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deletePost(post.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleReply = () => {
    if (!isAuthenticated) {
      alert("返信するにはログインが必要です");
      return;
    }
    onReplyClick?.(post);
  };

  // Linkify URLs in content
  const linkifyContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      {/* User Info */}
      <div className="mb-3 flex items-start gap-3">
        <Link href={`/@${post.user.username}`} className="flex-shrink-0">
          {post.user.profileImageUrl ? (
            <img
              src={getImageUrl(post.user.profileImageUrl) || undefined}
              alt={post.user.username}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-medium text-white">
              {post.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Link
              href={`/@${post.user.username}`}
              className="truncate font-semibold text-gray-900 hover:underline"
            >
              {post.user.username}
            </Link>
            <span className="text-sm text-gray-500">·</span>
            <Link
              href={`/posts/${post.id}`}
              className="text-sm text-gray-500 hover:underline"
            >
              {formatRelativeTime(post.createdAt)}
            </Link>
          </div>

          {/* Post Content */}
          <p className="break-words whitespace-pre-wrap text-gray-900">
            {linkifyContent(post.content)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-6 border-t border-gray-100 pt-3">
        {/* Reply */}
        {showReplyButton && (
          <button
            onClick={handleReply}
            className="group flex items-center gap-2 text-gray-500 transition-colors hover:text-blue-600"
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
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            <span className="text-sm">{post.replyCount}</span>
          </button>
        )}

        {/* Like */}
        <button
          disabled={isOwnPost}
          onClick={handleLikeToggle}
          className={`group flex items-center gap-2 transition-colors ${
            isOwnPost
              ? "cursor-not-allowed text-gray-400"
              : post.isLikedByCurrentUser
                ? "text-red-500"
                : "text-gray-500 hover:text-red-500"
          }`}
        >
          <svg
            className="h-5 w-5"
            fill={post.isLikedByCurrentUser ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-sm">{post.likeCount}</span>
        </button>

        {/* Delete (Own Posts Only) */}
        {isOwnPost && (
          <div className="ml-auto">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  削除する
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  キャンセル
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-gray-500 transition-colors hover:text-red-600"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
