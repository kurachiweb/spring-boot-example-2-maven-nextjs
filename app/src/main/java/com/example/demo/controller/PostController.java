package com.example.demo.controller;

import com.example.demo.dto.request.PostRequest;
import com.example.demo.dto.response.PostResponse;
import com.example.demo.dto.response.MessageResponse;
import com.example.demo.entity.User;
import com.example.demo.service.PostService;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final UserService userService;

    /**
     * タイムライン取得エンドポイント（全ユーザーの投稿）
     * GET /api/posts
     */
    @GetMapping
    public ResponseEntity<Page<PostResponse>> getTimeline(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PostResponse> posts = postService.getTimeline(pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * 投稿詳細取得エンドポイント
     * GET /api/posts/{postId}
     */
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long postId) {
        PostResponse post = postService.getPostResponse(postId);
        return ResponseEntity.ok(post);
    }

    /**
     * 投稿作成エンドポイント
     * POST /api/posts
     */
    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @Valid @RequestBody PostRequest request) {
        User currentUser = getCurrentUser();
        PostResponse response = postService.createPost(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 投稿削除エンドポイント
     * DELETE /api/posts/{postId}
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<MessageResponse> deletePost(@PathVariable Long postId) {
        User currentUser = getCurrentUser();
        postService.deletePost(postId, currentUser);
        return ResponseEntity.ok(new MessageResponse("Post deleted successfully"));
    }

    /**
     * 投稿への返信一覧取得エンドポイント
     * GET /api/posts/{postId}/replies
     */
    @GetMapping("/{postId}/replies")
    public ResponseEntity<Page<PostResponse>> getReplies(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<PostResponse> replies = postService.getReplies(postId, pageable);
        return ResponseEntity.ok(replies);
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
