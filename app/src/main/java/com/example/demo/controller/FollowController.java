package com.example.demo.controller;

import com.example.demo.dto.response.MessageResponse;
import com.example.demo.entity.User;
import com.example.demo.service.FollowService;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final UserService userService;

    /**
     * フォロー追加エンドポイント
     * POST /api/users/{userId}/follow
     */
    @PostMapping
    public ResponseEntity<MessageResponse> follow(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        followService.follow(userId, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("User followed successfully"));
    }

    /**
     * フォロー削除エンドポイント
     * DELETE /api/users/{userId}/follow
     */
    @DeleteMapping
    public ResponseEntity<MessageResponse> unfollow(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        followService.unfollow(userId, currentUser);
        return ResponseEntity.ok(new MessageResponse("User unfollowed successfully"));
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
