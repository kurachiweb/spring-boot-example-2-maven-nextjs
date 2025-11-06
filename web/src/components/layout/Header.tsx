"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";
import { cn, getImageUrl } from "@/lib/utils";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("ログアウトしますか?")) {
      logout();
    }
  };

  const navItems: { href: string; label: string }[] = [];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">AtamiShare</div>
          </Link>

          {/* Navigation */}
          {navItems.length > 0 && (
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-600",
                    pathname === item.href ? "text-blue-600" : "text-gray-700",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-6">
            {isAuthenticated && user ? (
              <>
                <Link
                  href={`/@${user.username}`}
                  className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                >
                  {user.profileImageUrl ? (
                    <img
                      src={getImageUrl(user.profileImageUrl) || undefined}
                      alt={user.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden text-lg font-medium text-gray-700 md:block">
                    {user.username}
                  </span>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    新規登録
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
