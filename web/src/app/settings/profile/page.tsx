"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile, useUploadProfileImage } from "@/hooks/useUser";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { getImageUrl } from "@/lib/utils";

const profileSchema = z.object({
  username: z
    .string()
    .min(1, "ユーザー名を入力してください")
    .max(50, "ユーザー名は50文字以内で入力してください")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "ユーザー名は英字で始まり、英数字とアンダースコアのみ使用できます",
    ),
  bio: z
    .string()
    .max(1000, "自己紹介は1000文字以内で入力してください")
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const uploadImageMutation = useUploadProfileImage();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  // プレビューURLを計算（カスタム画像が選択されていない場合はユーザーの現在のプロフィール画像を使用）
  const previewUrl = useMemo(() => {
    if (customPreviewUrl) {
      return customPreviewUrl;
    }
    if (user?.profileImageUrl) {
      return getImageUrl(user.profileImageUrl) || "";
    }
    return "";
  }, [customPreviewUrl, user]);

  // Redirect if not authenticated (only after loading is complete)
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Initialize form with current user data when user becomes available
  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        bio: user.bio || "",
      });
    }
  }, [user, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("画像ファイルは2MB以下である必要があります");
        return;
      }

      // Validate file type
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setErrorMessage("JPEG、PNG、WebP形式の画像のみアップロードできます");
        return;
      }

      setSelectedImage(file);
      setCustomPreviewUrl(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      // Upload image if selected
      if (selectedImage) {
        await uploadImageMutation.mutateAsync(selectedImage);
      }

      // Update profile
      await updateProfileMutation.mutateAsync({
        username: data.username,
        bio: data.bio || undefined,
      });

      setSuccessMessage("プロフィールを更新しました");

      // Redirect to profile page after short delay
      setTimeout(() => {
        router.push(`/@${data.username}`);
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "プロフィールの更新に失敗しました",
      );
    }
  };

  const handleCancel = () => {
    if (user) {
      router.push(`/@${user.username}`);
    } else {
      router.push("/");
    }
  };

  // Show loading spinner while authenticating or user data is loading
  if (isAuthLoading || !user) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="読み込んでいます..." />
      </div>
    );
  }

  const isLoading =
    updateProfileMutation.isPending || uploadImageMutation.isPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          プロフィール編集
        </h1>
        <p className="text-gray-600">
          あなたの公開プロフィール情報を編集できます
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              プロフィール画像
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="h-32 w-32 rounded-full border-2 border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-gray-200 bg-blue-600 text-4xl font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image-input"
                  disabled={isLoading}
                />
                <label htmlFor="profile-image-input">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() =>
                      document.getElementById("profile-image-input")?.click()
                    }
                    disabled={isLoading}
                  >
                    画像を選択
                  </Button>
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  JPEG、PNG、WebP形式（最大2MB）
                </p>
              </div>
            </div>
          </div>

          {/* Username */}
          <Input
            label="ユーザー名"
            type="text"
            fullWidth
            error={errors.username?.message}
            helperText="英字で始まり、英数字とアンダースコアのみ使用可能（最大50文字）"
            {...register("username")}
            disabled={isLoading}
          />

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              自己紹介
            </label>
            <textarea
              id="bio"
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
              placeholder="あなたについて教えてください..."
              {...register("bio")}
              disabled={isLoading}
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              最大1000文字まで入力できます
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              保存する
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
