// Cookieベースの認証に変更したため、トークン管理関数は不要
// トークンとユーザーデータはHTTP-Only Cookieに保存され、JavaScriptからアクセスできない

// これらの関数は後方互換性のために残すが、実際には何もしない
export const setAccessToken = (_token: string): void => {
  // HTTP-Only Cookieに保存されるため、JavaScriptから設定不可
};

export const getAccessToken = (): string | null => {
  // HTTP-Only Cookieに保存されているため、JavaScriptから取得不可
  return null;
};

export const setRefreshToken = (_token: string): void => {
  // HTTP-Only Cookieに保存されるため、JavaScriptから設定不可
};

export const getRefreshToken = (): string | null => {
  // HTTP-Only Cookieに保存されているため、JavaScriptから取得不可
  return null;
};

export const setTokens = (
  _accessToken: string,
  _refreshToken: string,
): void => {
  // HTTP-Only Cookieに保存されるため、JavaScriptから設定不可
};

export const removeTokens = (): void => {
  // ログアウトAPIを呼び出すことでCookieが削除される
};

// User data management
export const setUserData = (_user: unknown): void => {
  // HTTP-Only Cookieに保存されるため、JavaScriptから設定不可
};

export const getUserData = (): unknown | null => {
  // HTTP-Only Cookieに保存されているため、JavaScriptから取得不可
  // 代わりに /api/auth/me エンドポイントを使用
  return null;
};

export const removeUserData = (): void => {
  // ログアウトAPIを呼び出すことでCookieが削除される
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  // Cookieの存在確認はサーバーサイドで行われる
  // フロントエンドでは /api/auth/me を呼び出して確認
  return false;
};

// Clear all auth data
export const clearAuthData = (): void => {
  // ログアウトAPIを呼び出すことでCookieが削除される
};
