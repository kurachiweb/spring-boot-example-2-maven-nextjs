"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "ユーザー名を入力してください")
      .max(50, "ユーザー名は50文字以内で入力してください")
      .regex(
        /^[a-zA-Z][a-zA-Z0-9_]*$/,
        "ユーザー名は英字で始まり、英数字とアンダースコアのみ使用できます",
      ),
    email: z
      .string()
      .min(1, "メールアドレスを入力してください")
      .email("有効なメールアドレスを入力してください"),
    password: z
      .string()
      .min(1, "パスワードを入力してください")
      .min(8, "パスワードは8文字以上である必要があります"),
    passwordConfirm: z.string().min(1, "確認用パスワードを入力してください"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, registerAsync, isRegisterLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMessage("");
      await registerAsync(data);
      // Redirect to login page handled by useAuth hook
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "会員登録に失敗しました",
      );
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">新規登録</h1>
          <p className="mt-2 text-gray-600">AtamiShareのアカウントを作成</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="ユーザー名"
              type="text"
              autoComplete="username"
              fullWidth
              error={errors.username?.message}
              helperText="英字で始まり、英数字とアンダースコアのみ使用可能（最大50文字）"
              {...register("username")}
            />

            <Input
              label="メールアドレス"
              type="email"
              autoComplete="email"
              fullWidth
              error={errors.email?.message}
              helperText="ログイン時に使用します"
              {...register("email")}
            />

            <Input
              label="パスワード"
              type="password"
              autoComplete="new-password"
              fullWidth
              error={errors.password?.message}
              helperText="8文字以上で入力してください"
              {...register("password")}
            />

            <Input
              label="パスワード（確認）"
              type="password"
              autoComplete="new-password"
              fullWidth
              error={errors.passwordConfirm?.message}
              helperText="確認のため再度入力してください"
              {...register("passwordConfirm")}
            />

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                登録完了後、ウェルカムメールが送信されます。
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isRegisterLoading}
            >
              登録する
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちの方は{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
