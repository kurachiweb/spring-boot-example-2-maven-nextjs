"use client";

import React, { useState } from "react";
import { useCreatePost } from "@/hooks/usePosts";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

interface PostFormProps {
  parentPostId?: number;
  placeholder?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
}

const MAX_LENGTH = 200;

export const PostForm: React.FC<PostFormProps> = ({
  parentPostId,
  placeholder = "今何してる?",
  onSuccess,
  autoFocus = false,
}) => {
  const [content, setContent] = useState("");
  const { mutate: createPost, isPending } = useCreatePost();

  const characterCount = content.length;
  const isOverLimit = characterCount > MAX_LENGTH;
  const isValid = content.trim().length > 0 && !isOverLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    createPost(
      {
        content: content.trim(),
        parentPostId,
      },
      {
        onSuccess: () => {
          setContent("");
          onSuccess?.();
        },
        onError: (error) => {
          alert(error.message || "投稿に失敗しました");
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "min-h-[100px] w-full resize-none rounded-lg border p-3",
          "focus:border-transparent focus:ring-2 focus:outline-none",
          isOverLimit
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500",
        )}
      />

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              isOverLimit ? "text-red-600" : "text-gray-600",
            )}
          >
            {characterCount} / {MAX_LENGTH}
          </span>
          {isOverLimit && (
            <span className="text-sm text-red-600">
              ({characterCount - MAX_LENGTH}文字オーバー)
            </span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!isValid || isPending}
          isLoading={isPending}
        >
          {parentPostId ? "返信" : "投稿"}
        </Button>
      </div>
    </form>
  );
};
