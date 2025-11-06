export interface User {
  id: number;
  email: string;
  username: string;
  bio?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  newPasswordConfirm: string;
}
