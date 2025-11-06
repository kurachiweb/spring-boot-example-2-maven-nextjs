"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

const passwordResetConfirmSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "新しいパスワードを入力してください")
      .min(8, "パスワードは8文字以上である必要があります"),
    newPasswordConfirm: z.string().min(1, "確認用パスワードを入力してください"),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "パスワードが一致しません",
    path: ["newPasswordConfirm"],
  });

type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>;

export default function PasswordResetConfirmPage() {
  const params = useParams();
  const token = params.token as string;
  const { confirmPasswordResetAsync, isPasswordResetConfirmLoading } =
    useAuth();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetConfirmFormData>({
    resolver: zodResolver(passwordResetConfirmSchema),
  });

  const onSubmit = async (data: PasswordResetConfirmFormData) => {
    try {
      setErrorMessage("");
      await confirmPasswordResetAsync({
        token,
        ...data,
      });
      // Redirect to login page handled by useAuth hook
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "パスワードのリセットに失敗しました。トークンが無効または期限切れの可能性があります。",
      );
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-800">無効なリセットトークンです</p>
            <div className="mt-4">
              <Link
                href="/password-reset"
                className="text-blue-600 hover:text-blue-700"
              >
                パスワードリセットページに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            新しいパスワード設定
          </h1>
          <p className="mt-2 text-gray-600">
            新しいパスワードを入力してください
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{errorMessage}</p>
              <div className="mt-2">
                <Link
                  href="/password-reset"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  もう一度リセットメールを送信する
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="新しいパスワード"
              type="password"
              autoComplete="new-password"
              fullWidth
              error={errors.newPassword?.message}
              helperText="8文字以上で入力してください"
              {...register("newPassword")}
            />

            <Input
              label="新しいパスワード（確認）"
              type="password"
              autoComplete="new-password"
              fullWidth
              error={errors.newPasswordConfirm?.message}
              helperText="確認のため再度入力してください"
              {...register("newPasswordConfirm")}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isPasswordResetConfirmLoading}
            >
              パスワードを変更
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                ログインページに戻る
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
