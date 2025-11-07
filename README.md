# AtamiShare - 短文投稿 SNS アプリケーション

Next.js 15 + Spring Boot 3.5.7 + MySQL で構築されたソーシャルメディア型短文投稿 Web アプリケーションです。

## 📋 目次

- [機能概要](#機能概要)
- [技術スタック](#技術スタック)
- [プロジェクト構成](#プロジェクト構成)
- [環境構築](#環境構築)
- [起動方法](#起動方法)
- [API 仕様](#api仕様)
- [デプロイ](#デプロイ)

## 🎯 機能概要

### 主要機能

- **ユーザー認証**: JWT 認証による会員登録・ログイン・パスワードリセット
- **投稿機能**: 200 文字以内のテキスト投稿、返信機能
- **タイムライン**: 全ユーザーの投稿を最新順に表示（無限スクロール対応）
- **ソーシャル機能**: いいね、フォロー/アンフォロー
- **プロフィール**: プロフィール画像、自己紹介、投稿一覧
- **通知**: AWS SES によるメール通知（ウェルカムメール、パスワードリセット）

## 🛠 技術スタック

### バックエンド

- **Java**: 25
- **Spring Boot**: 3.5.7
- **Spring Security**: JWT 認証
- **Spring Data JPA**: Hibernate
- **MySQL**: 8.0+
- **Maven**: ビルドツール
- **AWS SES**: メール送信

### フロントエンド

- **Next.js**: 15.x (App Router)
- **React**: 19.x
- **TypeScript**: 5.x
- **Tailwind CSS**: スタイリング
- **TanStack Query**: サーバー状態管理
- **Zustand**: クライアント状態管理
- **Axios**: HTTP クライアント
- **React Hook Form + Zod**: フォームバリデーション

## 📁 プロジェクト構成

```
spring-boot-demo-2-maven-nextjs/
├── app/                          # Spring Boot バックエンド
│   ├── config/
│   │   └── secret/              # 環境変数の代わりとなる上書き設定ファイル
│   ├── src/main/java/com/example/demo/
│   │   ├── config/              # 設定クラス
│   │   ├── controller/          # REST コントローラー
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── entity/              # JPA エンティティ
│   │   ├── exception/           # 例外ハンドラー
│   │   ├── repository/          # JPA リポジトリ
│   │   ├── security/            # JWT・認証関連
│   │   └── service/             # ビジネスロジック
│   ├── src/main/resources/
│   │   └── application.yaml     # アプリケーション設定
│   └── pom.xml                  # Maven依存関係
│
└── web/                          # Next.js フロントエンド
    ├── src/
    │   ├── app/                 # Next.js App Router ページ
    │   ├── components/          # React コンポーネント
    │   ├── hooks/               # カスタムフック
    │   ├── lib/                 # ユーティリティ・API クライアント
    │   ├── store/               # 状態管理
    │   └── types/               # TypeScript 型定義
    ├── .env.local              # 環境変数
    └── package.json            # npm 依存関係
```

## 🚀 環境構築

### 前提条件

- Java 25
- Node.js 20+
- MySQL 8.0+
- Maven 3.9+

### 1. Java 環境のセットアップ

```bash
# Temurin (OpenJDK) をインストール
brew install --cask temurin@25

# 環境変数を設定 (~/.zshrc または ~/.bash_profile)
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-25.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# 確認
java -version
```

### 2. MySQL データベースのセットアップ

```bash
# MySQLをインストール（Docker使用の場合）
docker run -d \
  --name atamishare-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=atamishare_db \
  mysql:8.0

# または、ローカルMySQLで
mysql -u root -p
CREATE DATABASE atamishare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
```

### 3. バックエンドの設定

```bash
cd app

# application.yamlを編集（必要に応じて）
# - データベース接続情報
# - JWT秘密鍵
# - AWS SES認証情報
```

### 4. フロントエンドの設定

```bash
cd web

# 依存関係をインストール
npm install

# .env.localは既に設定済み
```

## 🎮 起動方法

### バックエンドの起動

```bash
cd app

# Mavenでビルド＆起動
./mvnw spring-boot:run

# または
./mvnw clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

バックエンドは http://localhost:55032 で起動します。

### フロントエンドの起動

```bash
cd web

# 開発サーバーを起動
npm run dev
```

フロントエンドは http://localhost:55033 で起動します。

### アクセス

ブラウザで http://localhost:55033 を開いてください。

## 📡 API 仕様

### 認証エンドポイント

| メソッド | エンドポイント                     | 説明                   |
| -------- | ---------------------------------- | ---------------------- |
| POST     | `/api/auth/register`               | 会員登録               |
| POST     | `/api/auth/login`                  | ログイン               |
| POST     | `/api/auth/logout`                 | ログアウト             |
| POST     | `/api/auth/refresh`                | トークンリフレッシュ   |
| POST     | `/api/auth/password-reset/request` | パスワードリセット依頼 |
| POST     | `/api/auth/password-reset/confirm` | パスワードリセット実行 |

### 投稿エンドポイント

| メソッド | エンドポイント                | 説明             | 認証 |
| -------- | ----------------------------- | ---------------- | ---- |
| GET      | `/api/posts`                  | タイムライン取得 | -    |
| GET      | `/api/posts/{postId}`         | 投稿詳細取得     | -    |
| POST     | `/api/posts`                  | 投稿作成         | 必須 |
| DELETE   | `/api/posts/{postId}`         | 投稿削除         | 必須 |
| GET      | `/api/posts/{postId}/replies` | 返信一覧取得     | -    |

### ユーザーエンドポイント

| メソッド | エンドポイント                | 説明                         | 認証 |
| -------- | ----------------------------- | ---------------------------- | ---- |
| GET      | `/api/users/{username}`       | ユーザー情報取得             | -    |
| GET      | `/api/users/{username}/posts` | ユーザー投稿一覧             | -    |
| PUT      | `/api/users/me`               | プロフィール更新             | 必須 |
| POST     | `/api/users/me/profile-image` | プロフィール画像アップロード | 必須 |

### いいね・フォローエンドポイント

| メソッド | エンドポイント               | 説明         | 認証 |
| -------- | ---------------------------- | ------------ | ---- |
| POST     | `/api/posts/{postId}/like`   | いいね追加   | 必須 |
| DELETE   | `/api/posts/{postId}/like`   | いいね削除   | 必須 |
| POST     | `/api/users/{userId}/follow` | フォロー     | 必須 |
| DELETE   | `/api/users/{userId}/follow` | アンフォロー | 必須 |

## 🚢 デプロイ

本番環境では AWS ECS (Fargate) へのデプロイを想定しています。

### デプロイ前の準備

1. **環境変数の設定**

   - JWT 秘密鍵を本番用に変更
   - AWS SES 認証情報を設定
   - データベース接続情報を本番用に変更

2. **ビルド**

```bash
# バックエンド
cd app
./mvnw clean package

# フロントエンド
cd web
npm run build
```

3. **Docker イメージの作成**（オプション）

```bash
# バックエンド用Dockerfile
# フロントエンド用Dockerfile
```

## 🔒 セキュリティ

- パスワードは BCrypt（strength 12）でハッシュ化
- JWT（Access Token: 15 分、Refresh Token: 7 日）
- CORS 設定済み
- SQL Injection 対策（JPA 使用）
- XSS 対策（React 自動エスケープ）
- CSRF 対策（Spring Security トークン）
- ファイルアップロードサイズ制限（2MB）

## 📝 開発時のポート

- **MySQL**: 3306
- **バックエンド API**: 55032
- **フロントエンド**: 55033
