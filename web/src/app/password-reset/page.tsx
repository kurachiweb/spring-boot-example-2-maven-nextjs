"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export default function PasswordResetPage() {
  const { requestPasswordResetAsync, isPasswordResetRequestLoading } =
    useAuth();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await requestPasswordResetAsync(data);
      setSuccessMessage(
        "パスワードリセット用のメールを送信しました。メールをご確認ください。",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "パスワードリセットのリクエストに失敗しました",
      );
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            パスワードリセット
          </h1>
          <p className="mt-2 text-gray-600">
            登録されているメールアドレスを入力してください
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
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

          {!successMessage && (
            <>
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  パスワードリセット用のリンクをメールで送信します。
                  メールに記載されたリンクから新しいパスワードを設定してください。
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="メールアドレス"
                  type="email"
                  autoComplete="email"
                  fullWidth
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isPasswordResetRequestLoading}
                >
                  リセットメールを送信
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-gray-600">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                ログインページに戻る
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{" "}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                新規登録
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
