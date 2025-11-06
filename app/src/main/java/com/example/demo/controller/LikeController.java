package com.example.demo.controller;

import com.example.demo.dto.response.MessageResponse;
import com.example.demo.entity.User;
import com.example.demo.service.LikeService;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;
    private final UserService userService;

    /**
     * いいね追加エンドポイント
     * POST /api/posts/{postId}/like
     */
    @PostMapping
    public ResponseEntity<MessageResponse> addLike(@PathVariable Long postId) {
        User currentUser = getCurrentUser();
        long likesCount = likeService.addLike(postId, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("Post liked successfully. Likes count: " + likesCount));
    }

    /**
     * いいね削除エンドポイント
     * DELETE /api/posts/{postId}/like
     */
    @DeleteMapping
    public ResponseEntity<MessageResponse> removeLike(@PathVariable Long postId) {
        User currentUser = getCurrentUser();
        long likesCount = likeService.removeLike(postId, currentUser);
        return ResponseEntity.ok(
                new MessageResponse("Like removed successfully. Likes count: " + likesCount));
    }

    /**
     * いいね数取得エンドポイント
     * GET /api/posts/{postId}/likes/count
     */
    @GetMapping("/count")
    public ResponseEntity<String> getLikesCount(@PathVariable Long postId) {
        long count = likeService.getCountLikes(postId);
        return ResponseEntity.ok("{\"count\": " + count + "}");
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
