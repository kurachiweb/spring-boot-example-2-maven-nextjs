"use client";

import { PostList } from "@/components/post/PostList";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">タイムライン</h1>
        <p className="text-gray-600">みんなの投稿をチェックしよう</p>
      </div>

      <PostList showPostForm={isAuthenticated} />
    </div>
  );
}
