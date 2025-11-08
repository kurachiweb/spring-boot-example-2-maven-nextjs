package com.example.demo.service;

import com.example.demo.dto.request.PasswordResetConfirmRequest;
import com.example.demo.dto.request.PasswordResetRequest;
import com.example.demo.dto.request.RegisterRequest;
import com.example.demo.dto.request.LoginRequest;
import com.example.demo.dto.response.AuthResponse;
import com.example.demo.entity.PasswordResetToken;
import com.example.demo.entity.User;
import com.example.demo.exception.CustomExceptions;
import com.example.demo.repository.PasswordResetTokenRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    /**
     * ユーザー登録処理
     * - メールアドレスの重複チェック
     * - ユーザー名の重複チェック
     * - パスワードをBCryptでハッシュ化
     * - ウェルカムメール送信
     */
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomExceptions.ConflictException("Email already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomExceptions.ConflictException("Username already taken");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        // ウェルカムメール送信
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getUsername());
    }

    /**
     * ログイン処理
     * - メールアドレスとパスワードで認証
     * - AccessToken（15分）とRefreshToken（7日）を生成
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomExceptions.UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomExceptions.UnauthorizedException("Invalid email or password");
        }

        // JWT生成用のUserDetails互換オブジェクトを作成
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                java.util.Collections.emptyList()
        );

        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(com.example.demo.dto.response.UserResponse.fromEntity(user, bucketName, region))
                .build();
    }

    /**
     * パスワードリセットリクエスト処理
     * - リセットトークン生成（24時間有効）
     * - メール送信
     */
    public void requestPasswordReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        // 既存の未使用トークンを削除
        passwordResetTokenRepository.deleteByUser(user);

        // 新しいリセットトークン生成
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiresAt(expiresAt);
        resetToken.setUsed(false);

        passwordResetTokenRepository.save(resetToken);

        // パスワードリセットメール送信
        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token);
    }

    /**
     * パスワードリセット確認処理
     * - トークン検証
     * - 新しいパスワード設定
     */
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenAndUsedFalseAndExpiresAtAfter(request.getToken(), LocalDateTime.now())
                .orElseThrow(() -> new CustomExceptions.BadRequestException("Invalid or expired reset token"));

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // トークンを使用済みにマーク
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    /**
     * トークンリフレッシュ処理
     * - RefreshTokenを検証
     * - 新しいAccessTokenとユーザー情報を返す
     */
    public AuthResponse refreshAccessToken(String refreshToken) {
        try {
            String email = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new CustomExceptions.UnauthorizedException("User not found"));

            var userDetails = new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPassword(),
                    java.util.Collections.emptyList()
            );

            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                throw new CustomExceptions.UnauthorizedException("Invalid refresh token");
            }

            String newAccessToken = jwtService.generateAccessToken(userDetails);

            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .user(com.example.demo.dto.response.UserResponse.fromEntity(user, bucketName, region))
                    .build();
        } catch (Exception e) {
            throw new CustomExceptions.UnauthorizedException("Invalid refresh token");
        }
    }
}
