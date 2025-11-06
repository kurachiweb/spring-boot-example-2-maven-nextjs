package com.example.demo.controller;

import com.example.demo.dto.request.LoginRequest;
import com.example.demo.dto.request.PasswordResetConfirmRequest;
import com.example.demo.dto.request.PasswordResetRequest;
import com.example.demo.dto.request.RegisterRequest;
import com.example.demo.dto.response.AuthResponse;
import com.example.demo.dto.response.MessageResponse;
import com.example.demo.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * ユーザー登録エンドポイント
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("User registered successfully"));
    }

    /**
     * ログインエンドポイント
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.login(request);

            // Refresh Token のみをHTTP-Only Cookieに保存
            // AccessTokenはメモリに保持し、短命にする
            Cookie refreshTokenCookie = new Cookie("refreshToken", authResponse.getRefreshToken());
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setSecure(false); // 開発環境ではfalse、本番環境ではtrueに設定
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7日

            // SameSite属性を設定（クロスサイトリクエストでもCookieを送信可能にする）
            response.setHeader("Set-Cookie", String.format(
                "refreshToken=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax",
                authResponse.getRefreshToken(),
                7 * 24 * 60 * 60
            ));

            // レスポンスボディにはaccessTokenとユーザー情報を返す
            // accessTokenはフロントエンドのメモリに保持される
            return ResponseEntity.ok(AuthResponse.builder()
                    .accessToken(authResponse.getAccessToken())
                    .user(authResponse.getUser())
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to set authentication cookies", e);
        }
    }

    /**
     * ログアウトエンドポイント
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletResponse response) {
        // Refresh Token Cookieを削除
        response.setHeader("Set-Cookie",
            "refreshToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");

        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    /**
     * トークンリフレッシュエンドポイント
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AuthResponse response = authService.refreshAccessToken(refreshToken);

        return ResponseEntity.ok(response);
    }

    /**
     * パスワードリセット依頼エンドポイント
     * POST /api/auth/password-reset/request
     */
    @PostMapping("/password-reset/request")
    public ResponseEntity<MessageResponse> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(
                new MessageResponse("Password reset email has been sent"));
    }

    /**
     * パスワードリセット確認エンドポイント
     * POST /api/auth/password-reset/confirm
     */
    @PostMapping("/password-reset/confirm")
    public ResponseEntity<MessageResponse> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request) {
        authService.confirmPasswordReset(request);
        return ResponseEntity.ok(
                new MessageResponse("Password has been reset successfully"));
    }
}
