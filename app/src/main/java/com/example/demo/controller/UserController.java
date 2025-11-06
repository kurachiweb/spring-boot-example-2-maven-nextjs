package com.example.demo.controller;

import com.example.demo.dto.request.UpdateProfileRequest;
import com.example.demo.dto.response.UserResponse;
import com.example.demo.dto.response.PostResponse;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import com.example.demo.service.PostService;
import com.example.demo.service.FollowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PostService postService;
    private final FollowService followService;

    /**
     * ユーザー情報取得エンドポイント
     * GET /api/users/{username}
     */
    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        UserResponse response = userService.getUserResponse(user);
        return ResponseEntity.ok(response);
    }

    /**
     * ユーザーの投稿一覧取得エンドポイント
     * GET /api/users/{username}/posts
     */
    @GetMapping("/{username}/posts")
    public ResponseEntity<Page<PostResponse>> getUserPosts(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostResponse> posts = postService.getUserPosts(username, pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * プロフィール更新エンドポイント
     * PUT /api/users/me
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        User currentUser = getCurrentUser();
        UserResponse response = userService.updateProfile(currentUser, request);
        return ResponseEntity.ok(response);
    }

    /**
     * プロフィール画像アップロードエンドポイント
     * POST /api/users/me/profile-image
     */
    @PostMapping("/me/profile-image")
    public ResponseEntity<String> uploadProfileImage(
            @RequestParam("profileImage") MultipartFile profileImage) throws IOException {
        User currentUser = getCurrentUser();

        // ファイルの読み込み
        byte[] imageData = profileImage.getBytes();
        String originalFilename = profileImage.getOriginalFilename();

        String savedPath = userService.uploadProfileImage(currentUser, imageData, originalFilename);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPath);
    }

    /**
     * フォロワー数取得エンドポイント
     * GET /api/users/{userId}/followers/count
     */
    @GetMapping("/{userId}/followers/count")
    public ResponseEntity<java.util.Map<String, Long>> getFollowersCount(@PathVariable Long userId) {
        long count = followService.getFollowersCount(userId);
        return ResponseEntity.ok(java.util.Map.of("count", count));
    }

    /**
     * フォロワー一覧取得エンドポイント
     * GET /api/users/{userId}/followers
     */
    @GetMapping("/{userId}/followers")
    public ResponseEntity<Page<UserResponse>> getFollowers(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> followers = followService.getFollowers(userId, pageable);
        return ResponseEntity.ok(followers);
    }

    /**
     * フォロー中ユーザー数取得エンドポイント
     * GET /api/users/{userId}/following/count
     */
    @GetMapping("/{userId}/following/count")
    public ResponseEntity<java.util.Map<String, Long>> getFollowingCount(@PathVariable Long userId) {
        long count = followService.getFollowingCount(userId);
        return ResponseEntity.ok(java.util.Map.of("count", count));
    }

    /**
     * フォロー中ユーザー一覧取得エンドポイント
     * GET /api/users/{userId}/following
     */
    @GetMapping("/{userId}/following")
    public ResponseEntity<Page<UserResponse>> getFollowing(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> following = followService.getFollowing(userId, pageable);
        return ResponseEntity.ok(following);
    }

    /**
     * フォロー中か確認エンドポイント
     * GET /api/users/{userId}/is-following
     */
    @GetMapping("/{userId}/is-following")
    public ResponseEntity<java.util.Map<String, Boolean>> isFollowing(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        boolean isFollowing = followService.isFollowing(userId, currentUser);
        return ResponseEntity.ok(java.util.Map.of("isFollowing", isFollowing));
    }

    /**
     * 現在のログイン中のユーザーを取得（内部ユーティリティメソッド）
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.getUserByEmail(email);
    }
}
