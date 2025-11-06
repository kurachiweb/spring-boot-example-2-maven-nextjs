"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUser, useFollowerCount, useFollowingCount } from "@/hooks/useUser";
import { useUserPosts } from "@/hooks/usePosts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { ProfileCard } from "@/components/user/ProfileCard";
import { FollowButton } from "@/components/user/FollowButton";
import { PostCard } from "@/components/post/PostCard";
import { PostForm } from "@/components/post/PostForm";
import {
  LoadingSpinner,
  LoadingText,
} from "@/components/common/LoadingSpinner";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const {
    user: currentUser,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth();

  // Fetch user profile
  const {
    data: profileUser,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useUser(username);

  // Fetch user posts with infinite scroll
  // 認証初期化が完了してからクエリを実行
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPostsLoading,
  } = useUserPosts(username, 20, !isAuthLoading);

  // Fetch follower and following counts
  const { data: followerCount = 0 } = useFollowerCount(profileUser?.id || 0);
  const { data: followingCount = 0 } = useFollowingCount(profileUser?.id || 0);

  const { ref } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
  });

  const isOwnProfile = currentUser?.username === username;

  if (isUserLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="プロフィールを読み込んでいます..." />
      </div>
    );
  }

  if (isUserError || !profileUser) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">
          {userError instanceof Error
            ? userError.message
            : "ユーザーが見つかりませんでした"}
        </p>
      </div>
    );
  }

  const posts = postsData?.pages.flatMap((page) => page?.posts || []) || [];

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <ProfileCard
        user={profileUser}
        isOwnProfile={isOwnProfile}
        followerCount={followerCount}
        followingCount={followingCount}
      />

      {/* Follow Button (for other users) */}
      {!isOwnProfile && isAuthenticated && (
        <FollowButton userId={profileUser.id} />
      )}

      {/* Post Form (for own profile) */}
      {isOwnProfile && isAuthenticated && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            新しい投稿
          </h2>
          <PostForm placeholder="今何してる?" />
        </div>
      )}

      {/* User Posts */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          投稿 {!isPostsLoading && posts.length > 0 && `(${posts.length})`}
        </h2>

        {isPostsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner text="投稿を読み込んでいます..." />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <p className="text-gray-600">まだ投稿がありません</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
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
              <div className="mt-4 py-4 text-center">
                <p className="text-sm text-gray-500">
                  すべての投稿を表示しました
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
