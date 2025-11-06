"use client";

import React from "react";
import Link from "next/link";
import { User } from "@/types/user";
import { formatFullDate, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/common/Button";

interface ProfileCardProps {
  user: User;
  isOwnProfile?: boolean;
  followerCount?: number;
  followingCount?: number;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  isOwnProfile = false,
  followerCount = 0,
  followingCount = 0,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Cover Image Placeholder */}
      <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600" />

      <div className="px-6 pb-6">
        {/* Profile Image */}
        <div className="-mt-16 mb-4 flex items-end justify-between">
          <div className="relative">
            {user.profileImageUrl ? (
              <img
                src={getImageUrl(user.profileImageUrl) || undefined}
                alt={user.username}
                className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-4xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Edit Profile Button */}
          {isOwnProfile && (
            <Link href="/settings/profile" className="mt-4">
              <Button variant="outline" size="md">
                プロフィール編集
              </Button>
            </Link>
          )}
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.username}
            </h1>
            <p className="text-gray-500">@{user.username}</p>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="whitespace-pre-wrap text-gray-700">{user.bio}</p>
          )}

          {/* Join Date */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatFullDate(user.createdAt)}に登録</span>
          </div>

          {/* Follow Stats */}
          <div className="flex items-center gap-6">
            <Link
              href={`/@${user.username}/following`}
              className="hover:underline"
            >
              <span className="font-bold text-gray-900">{followingCount}</span>
              <span className="ml-1 text-gray-500">フォロー中</span>
            </Link>
            <Link
              href={`/@${user.username}/followers`}
              className="hover:underline"
            >
              <span className="font-bold text-gray-900">{followerCount}</span>
              <span className="ml-1 text-gray-500">フォロワー</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
