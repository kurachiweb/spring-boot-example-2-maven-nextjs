"use client";

import React from "react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import {
  useFollowUser,
  useUnfollowUser,
  useIsFollowing,
} from "@/hooks/useUser";

interface FollowButtonProps {
  userId: number;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  className,
}) => {
  const { isAuthenticated } = useAuth();
  const { data: isFollowingData, isLoading: isCheckingFollow } = useIsFollowing(
    userId,
    isAuthenticated,
  );
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const isFollowing = isFollowingData ?? false;

  const handleClick = () => {
    if (!isAuthenticated) {
      alert("フォローするにはログインが必要です");
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  const isLoading =
    followMutation.isPending || unfollowMutation.isPending || isCheckingFollow;

  return (
    <Button
      variant={isFollowing ? "outline" : "primary"}
      size="md"
      onClick={handleClick}
      isLoading={isLoading}
      className={className}
    >
      {isFollowing ? "フォロー中" : "フォロー"}
    </Button>
  );
};
