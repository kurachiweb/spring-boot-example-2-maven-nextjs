import Link from "next/link";
import { Button } from "@/components/common/Button";

export const metadata = {
  title: "AtamiShareについて | AtamiShare",
  description:
    "AtamiShareは200文字以内で日頃の呟きを投稿できる短文投稿サービスです。",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-12">
      {/* ヘッダーセクション */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">AtamiShareについて</h1>
        <p className="mt-4 text-lg text-gray-600">
          シンプルに、気軽に、つながる
        </p>
      </div>

      {/* メインコンテンツ */}
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            AtamiShareとは
          </h2>
          <p className="leading-relaxed text-gray-700">
            AtamiShareは短文投稿サービスであり、200文字以内で日頃の呟きを投稿できます。シンプルな操作で誰でも簡単に思いついたことをその場で共有でき、他のユーザーとつながることができます。熱海の魅力や日常の出来事、ふとした瞬間の感動を気軽に発信し、コミュニティの一員として交流を楽しめるプラットフォームです。アカウント登録は無料で、すぐに始められます。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">主な機能</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                1
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">短文投稿</h3>
                <p className="text-sm text-gray-600">
                  200文字以内で気軽に投稿。思いついたことをすぐにシェアできます。
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                2
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">返信・いいね</h3>
                <p className="text-sm text-gray-600">
                  投稿に返信したり、いいねを送って反応を伝えられます。
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                3
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">フォロー機能</h3>
                <p className="text-sm text-gray-600">
                  気になるユーザーをフォローして、最新の投稿をチェックできます。
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                4
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  プロフィールページ
                </h3>
                <p className="text-sm text-gray-600">
                  自分専用のプロフィールページで、投稿履歴や自己紹介を表示できます。
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            こんな方におすすめ
          </h2>
          <ul className="list-inside list-disc space-y-2 text-gray-700">
            <li>日々の出来事や思いつきを気軽に発信したい方</li>
            <li>熱海の魅力や地域情報を共有したい方</li>
            <li>シンプルなSNSで交流を楽しみたい方</li>
            <li>短い文章で自分の考えを表現したい方</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            今すぐ始めましょう
          </h2>
          <p className="text-gray-700">
            AtamiShareは無料でご利用いただけます。アカウントを登録して、すぐに投稿を始めましょう。
          </p>
        </section>
      </div>

      {/* フッターリンク */}
      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
