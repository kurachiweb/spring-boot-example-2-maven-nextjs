import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              AtamiShare
            </h3>
            <p className="text-sm text-gray-600">
              シンプルで使いやすい短文投稿サービス。思いついたことを気軽にシェアしましょう。
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">リンク</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600"
                >
                  ホーム
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600"
                >
                  AtamiShareについて
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600"
                >
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              サポート
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600"
                >
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600"
                >
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            &copy; {currentYear} AtamiShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
