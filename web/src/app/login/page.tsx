"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

const loginSchema = z.object({
  email: z
    .email("有効なメールアドレスを入力してください")
    .min(1, "メールアドレスを入力してください"),
  password: z
    .string()
    .min(1, "パスワードを入力してください")
    .min(8, "パスワードは8文字以上である必要があります"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// useSearchParams()を使うコンポーネントを分離
function SuccessMessage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const reset = searchParams.get("reset");
  const successMessage =
    registered === "true"
      ? "会員登録が完了しました。ログインしてください。"
      : reset === "true"
        ? "パスワードがリセットされました。新しいパスワードでログインしてください。"
        : "";

  if (!successMessage) return null;

  return (
    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="text-sm text-green-800">{successMessage}</p>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, loginAsync, isLoginLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage("");
      await loginAsync(data);
      // Redirect handled by useAuth hook
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "ログインに失敗しました",
      );
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      {/* Success Message */}
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="メールアドレス"
          type="email"
          autoComplete="email"
          fullWidth
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="パスワード"
          type="password"
          autoComplete="current-password"
          fullWidth
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-end">
          <Link
            href="/password-reset"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            パスワードを忘れた場合
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoginLoading}
        >
          ログイン
        </Button>
      </form>

      <div className="mt-6 text-center">
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
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ログイン</h1>
          <p className="mt-2 text-gray-600">AtamiShareへようこそ</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
