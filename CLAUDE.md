# 単文投稿サービス「AtamiShare」開発要件

## プロジェクト概要

Next.js（フロントエンド）+ Spring Boot（バックエンド API）+ MySQL（データベース）を使用したソーシャルメディア型単文投稿 Web アプリケーション

## 公開予定ドメイン

https://atami-share.jp

## 技術スタック

### フロントエンド（Web サーバー層）

- **フレームワーク**: Next.js 15.x (App Router)
- **言語**: TypeScript
- **UI ライブラリ**: React 19.x
- **スタイリング**: Tailwind CSS
- **状態管理**: React Query (TanStack Query) / Zustand
- **HTTP クライアント**: Axios
- **フォームバリデーション**: React Hook Form + Zod
- **無限スクロール**: React Intersection Observer / TanStack Virtual

### バックエンド（App サーバー層）

- **Java**: 25
- **フレームワーク**: Spring Boot 3.5.7
- **ビルドツール**: Maven
- **認証**: Spring Security + JWT
- **メール送信**: AWS SES (Simple Email Service)
- **画像保存**: AWS S3 または ローカルストレージ

### データベース（DB 層）

- **RDBMS**: MySQL 8.0+
- **ORM**: Spring Data JPA (Hibernate)

## 開発時に使うポート

- **データベース**: 55031
- **バックエンド API**: 55032
- **フロントエンド**: 55033

## 本番時に使うポート

一般的なベストプラクティスに従う。

## デプロイ先

AWS ECS(Farget)にデプロイする想定。

---

## 主要機能

### 1. ユーザー認証・アカウント管理機能

#### 1.1 会員登録

- メールアドレスとパスワード（8 桁以上）で登録
- パスワードは BCrypt でハッシュ化して保存
- 登録完了後、AWS SES でウェルカムメール送信
- メール認証機能（オプション推奨）

#### 1.2 ログイン

- メールアドレスとパスワードで認証
- JWT（Access Token + Refresh Token）発行
- トークンを HTTP-Only Cookie またはローカルストレージに保存

#### 1.3 パスワードリセット

- パスワードリセット画面でメールアドレス入力
- AWS SES でリセットリンク付きメール送信
- 新しいパスワード入力画面で 8 桁以上のパスワードを設定

### 2. 投稿機能

#### 2.1 投稿作成

- 200 文字以内のテキスト投稿
- リアルタイム文字数カウント表示
- 投稿ボタン（文字数超過時は無効化）
- 作成日時を自動記録

#### 2.2 投稿表示

- 本文中の URL（http://、https://）を自動検出
- URL をクリック可能なリンクとして表示（target="\_blank"）
- 投稿者情報（プロフィール画像、ユーザー名）
- 投稿日時（相対時間表示: "3 分前"など）
- 返信数、いいね数の表示

#### 2.3 投稿削除

- 自分の投稿のみ削除可能
- 削除確認ダイアログ表示

### 3. タイムライン機能

#### 3.1 トップページタイムライン

- 全ユーザーの投稿を最新順に表示
- 無限スクロール（Intersection Observer 使用）
- 1 回のロードで 20 件ずつ取得
- スクロール位置記憶（ページ戻り時）

#### 3.2 ユーザー投稿一覧

- 特定ユーザーの投稿のみを最新順に表示
- 無限スクロール対応

### 4. プロフィール機能

#### 4.1 公開プロフィール画面

- プロフィール情報表示
  - プロフィール画像（256px × 256px、円形トリミング）
  - ユーザー名
  - 紹介文（1000 文字以内）
  - フォロー数
  - フォロワー数
- 投稿一覧（最新順、無限スクロール）
- ログインユーザー本人の場合
  - 投稿入力フォーム表示
  - プロフィール編集画面へのリンク表示

#### 4.2 プロフィール編集画面

- 編集可能項目
  - プロフィール画像（アップロード・プレビュー）
  - ユーザー名（最大 50 文字）
  - 紹介文（最大 1000 文字）
- 保存ボタン（公開プロフィール画面に戻る）
- キャンセルボタン

### 5. ソーシャル機能

#### 5.1 返信機能

- 各投稿に返信可能（200 文字以内）
- 返信スレッド表示
- 返信数カウント

#### 5.2 いいね機能

- ハートマークボタンでいいね/いいね解除
- いいね数カウント
- ユーザーごとに 1 投稿 1 いいねまで

#### 5.3 フォロー機能

- 他ユーザーをフォロー/アンフォロー
- フォロー数・フォロワー数表示
- フォロー一覧、フォロワー一覧画面（オプション）

---

## データベース設計

### users テーブル

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    bio TEXT,
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);
```

### posts テーブル

```sql
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content VARCHAR(200) NOT NULL,
    parent_post_id BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_parent_post_id (parent_post_id)
);
```

### likes テーブル

```sql
CREATE TABLE likes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post (user_id, post_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
);
```

### follows テーブル

```sql
CREATE TABLE follows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX idx_follower_id (follower_id),
    INDEX idx_following_id (following_id)
);
```

### password_reset_tokens テーブル

```sql
CREATE TABLE password_reset_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);
```

---

## API 設計（Spring Boot REST API）

### 認証関連

#### POST /api/auth/register

- リクエスト: `{ email, password }`
- レスポンス: `{ message, userId }`
- 処理: ユーザー登録 + ウェルカムメール送信

#### POST /api/auth/login

- リクエスト: `{ email, password }`
- レスポンス: `{ accessToken, refreshToken, user }`

#### POST /api/auth/logout

- リクエスト: `{ refreshToken }`
- レスポンス: `{ message }`

#### POST /api/auth/refresh

- リクエスト: `{ refreshToken }`
- レスポンス: `{ accessToken }`

#### POST /api/auth/password-reset/request

- リクエスト: `{ email }`
- レスポンス: `{ message }`
- 処理: リセットトークン生成 + メール送信

#### POST /api/auth/password-reset/confirm

- リクエスト: `{ token, newPassword }`
- レスポンス: `{ message }`

### 投稿関連

#### GET /api/posts

- クエリパラメータ: `?page=0&size=20`
- レスポンス: `{ posts: [], totalPages, currentPage }`
- 処理: 全投稿を最新順で取得（ページネーション）

#### GET /api/posts/{postId}

- レスポンス: 投稿詳細（返信含む）

#### POST /api/posts

- リクエスト: `{ content, parentPostId? }`
- レスポンス: `{ post }`
- 認証: 必須

#### DELETE /api/posts/{postId}

- レスポンス: `{ message }`
- 認証: 必須（本人のみ）

#### GET /api/posts/{postId}/replies

- クエリパラメータ: `?page=0&size=20`
- レスポンス: 返信一覧

### いいね関連

#### POST /api/posts/{postId}/like

- レスポンス: `{ message, likesCount }`
- 認証: 必須

#### DELETE /api/posts/{postId}/like

- レスポンス: `{ message, likesCount }`
- 認証: 必須

#### GET /api/posts/{postId}/likes/count

- レスポンス: `{ count }`

### ユーザー関連

#### GET /api/users/{username}

- レスポンス: 公開プロフィール情報

#### GET /api/users/{username}/posts

- クエリパラメータ: `?page=0&size=20`
- レスポンス: ユーザーの投稿一覧

#### PUT /api/users/me

- リクエスト: `{ username?, bio?, profileImage? }`
- レスポンス: `{ user }`
- 認証: 必須

#### POST /api/users/me/profile-image

- リクエスト: FormData (multipart/form-data)
- レスポンス: `{ profileImageUrl }`
- 認証: 必須

### フォロー関連

#### POST /api/users/{userId}/follow

- レスポンス: `{ message }`
- 認証: 必須

#### DELETE /api/users/{userId}/follow

- レスポンス: `{ message }`
- 認証: 必須

#### GET /api/users/{userId}/followers

- クエリパラメータ: `?page=0&size=20`
- レスポンス: フォロワー一覧

#### GET /api/users/{userId}/following

- クエリパラメータ: `?page=0&size=20`
- レスポンス: フォロー中一覧

---

## フロントエンド画面構成（Next.js）

### 1. トップページ `/`

- グローバルタイムライン
- 投稿フォーム（ログイン時のみ）
- 無限スクロール

### 2. ログインページ `/login`

- メールアドレス入力
- パスワード入力
- ログインボタン
- 新規登録リンク
- パスワードリセットリンク

### 3. 会員登録ページ `/register`

- メールアドレス入力
- パスワード入力（8 桁以上）
- パスワード確認入力
- 登録ボタン
- ログインリンク

### 4. パスワードリセット依頼ページ `/password-reset`

- メールアドレス入力
- 送信ボタン

### 5. 新しいパスワード入力ページ `/password-reset/[token]`

- 新しいパスワード入力（8 桁以上）
- パスワード確認入力
- 保存ボタン

### 6. 公開プロフィールページ `/[username]`

- プロフィール情報表示
- 投稿一覧（無限スクロール）
- 投稿フォーム（本人ログイン時のみ）
- プロフィール編集リンク（本人ログイン時のみ）
- フォロー/アンフォローボタン（他ユーザー閲覧時）

### 7. プロフィール編集ページ `/settings/profile`

- プロフィール画像アップロード
- ユーザー名入力
- 紹介文入力
- 保存ボタン
- キャンセルボタン

### 8. 投稿詳細ページ `/posts/[postId]`

- 投稿内容表示
- 返信一覧
- 返信フォーム（ログイン時のみ）

---

## セキュリティ要件

### 認証・認可

- JWT（Access Token: 15 分、Refresh Token: 7 日）
- Spring Security によるエンドポイント保護
- CORS 設定（Next.js のオリジンを許可）

### データ保護

- パスワードの BCrypt ハッシュ化（strength 12）
- SQL インジェクション対策（JPA 使用）
- XSS 対策（React/Next.js の自動エスケープ）
- CSRF 対策（Spring Security のトークン）

### API 制限

- Rate Limiting（Spring Boot Bucket4j）
- ファイルアップロードサイズ制限（2MB）
- 画像ファイル形式制限（JPEG, PNG, WebP）

---

## プロジェクト構成の検討案

### バックエンド（Spring Boot）

```
backend/
├── src/main/java/com/example/socialapp/
│   ├── SocialAppApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── CorsConfig.java
│   │   ├── AwsSesConfig.java
│   │   └── JwtConfig.java
│   ├── entity/
│   │   ├── User.java
│   │   ├── Post.java
│   │   ├── Like.java
│   │   ├── Follow.java
│   │   └── PasswordResetToken.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── PostRepository.java
│   │   ├── LikeRepository.java
│   │   ├── FollowRepository.java
│   │   └── PasswordResetTokenRepository.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── UserService.java
│   │   ├── PostService.java
│   │   ├── LikeService.java
│   │   ├── FollowService.java
│   │   ├── EmailService.java
│   │   ├── JwtService.java
│   │   └── StorageService.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   ├── PostController.java
│   │   ├── LikeController.java
│   │   └── FollowController.java
│   ├── dto/
│   │   ├── request/
│   │   └── response/
│   ├── security/
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       └── CustomExceptions.java
├── src/main/resources/
│   ├── application.properties
│   └── application-prod.properties
└── pom.xml
```

### フロントエンド（Next.js）

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (トップページ)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── password-reset/
│   │   │   ├── page.tsx
│   │   │   └── [token]/page.tsx
│   │   ├── [username]/
│   │   │   └── page.tsx
│   │   ├── posts/
│   │   │   └── [postId]/page.tsx
│   │   └── settings/
│   │       └── profile/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── post/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostForm.tsx
│   │   │   ├── PostList.tsx
│   │   │   └── ReplyList.tsx
│   │   ├── user/
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── ProfileEditForm.tsx
│   │   │   └── FollowButton.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useInfiniteScroll.ts
│   │   └── useDebounce.ts
│   ├── lib/
│   │   ├── api.ts (Axios instance)
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── post.ts
│   │   └── api.ts
│   └── styles/
│       └── globals.css
├── public/
│   └── images/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 設定ファイル

以下では properties 形式で記述しているが、今回は yaml 形式を採用するので、その形式に変換すること。

### application.properties (Spring Boot)

```properties
# サーバー設定
server.port=8080

# データベース設定
spring.datasource.url=jdbc:mysql://localhost:3306/socialapp_db?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT設定
jwt.secret=your-secret-key-change-this-in-production
jwt.access-token-expiration=900000
jwt.refresh-token-expiration=604800000

# AWS SES設定
aws.ses.region=ap-northeast-1
aws.ses.access-key=YOUR_ACCESS_KEY
aws.ses.secret-key=YOUR_SECRET_KEY
aws.ses.from-email=noreply@yourapp.com

# ファイルアップロード設定
spring.servlet.multipart.max-file-size=2MB
spring.servlet.multipart.max-request-size=2MB

# CORS設定
app.cors.allowed-origins=http://localhost:3000,https://yourapp.com

# ストレージ設定（S3 or Local）
storage.type=local
storage.local.path=/uploads
# storage.s3.bucket-name=your-bucket-name
```

### .env.local (Next.js)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## pom.xml（主要 Dependencies）

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- MySQL Driver -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Spring Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>

    <!-- AWS SDK for SES -->
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>ses</artifactId>
        <version>2.20.0</version>
    </dependency>

    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- DevTools -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>

    <!-- Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## package.json（主要 Dependencies）

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.3.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "react-intersection-observer": "^9.5.0",
    "date-fns": "^3.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 開発手順

### Phase 1: 環境構築

1. MySQL データベース作成
2. Spring Boot プロジェクト作成（Maven）
3. Next.js プロジェクト作成（TypeScript）
4. AWS SES 設定（メール送信用）

### Phase 2: バックエンド開発

1. エンティティ作成（User, Post, Like, Follow）
2. リポジトリ作成
3. JWT 認証実装
4. ユーザー登録・ログイン API 実装
5. 投稿 CRUD API 実装
6. いいね・フォロー機能 API 実装
7. パスワードリセット機能実装
8. メール送信機能実装（AWS SES）

### Phase 3: フロントエンド開発

1. 認証コンテキスト・フック作成
2. API クライアント設定（Axios）
3. レイアウトコンポーネント作成
4. 認証画面実装（ログイン・登録・パスワードリセット）
5. トップページ・タイムライン実装
6. 投稿フォーム・カード実装
7. 無限スクロール実装
8. プロフィール画面実装
9. いいね・返信機能実装

### Phase 4: テスト・デプロイ

1. 単体テスト作成
2. 統合テスト実行
3. E2E テスト（Playwright 推奨）
4. パフォーマンステスト
5. 本番デプロイ

---

## パフォーマンス最適化

### データベース

- インデックス最適化（created_at, user_id）
- N+1 問題対策（JPA fetch join）
- ページネーションによるデータ制限

### API

- レスポンスキャッシュ（Redis 推奨）
- 画像のリサイズ・圧縮
- CDN 配信（S3 + CloudFront）

### フロントエンド

- Next.js Image 最適化
- React Query によるキャッシュ
- コード分割（Dynamic Import）
- Virtual Scrolling（大量データ表示時）

---

## セキュリティチェックリスト

- [ ] パスワードの BCrypt ハッシュ化
- [ ] JWT 有効期限設定
- [ ] CORS 適切な設定
- [ ] HTTPS 通信（本番環境）
- [ ] SQL Injection 対策（JPA 使用）
- [ ] XSS 対策（自動エスケープ）
- [ ] CSRF 対策（トークン使用）
- [ ] Rate Limiting 実装
- [ ] ファイルアップロード検証
- [ ] 環境変数で機密情報管理

---

## 今後の拡張機能案

- [ ] ダイレクトメッセージ機能
- [ ] 通知機能（リアルタイム: WebSocket）
- [ ] ハッシュタグ機能
- [ ] 画像添付投稿
- [ ] ブックマーク機能
- [ ] ミュート・ブロック機能
- [ ] 検索機能（Elasticsearch 連携）
- [ ] トレンド機能
- [ ] 多言語対応（i18n）
- [ ] ダークモード

---

## 参考リンク

- Spring Boot 公式: https://spring.io/projects/spring-boot
- Next.js 公式: https://nextjs.org/
- AWS SES: https://aws.amazon.com/ses/
- JWT: https://jwt.io/
- React Query: https://tanstack.com/query
