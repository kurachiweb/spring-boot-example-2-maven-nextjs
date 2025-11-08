package com.example.demo.service;

import com.example.demo.dto.request.PostRequest;
import com.example.demo.dto.response.PostResponse;
import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import com.example.demo.exception.CustomExceptions;
import com.example.demo.repository.LikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    /**
     * 投稿を作成
     * - 本文は200文字以内
     * - 返信の場合は parent_post_id を指定
     */
    public PostResponse createPost(User currentUser, PostRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new CustomExceptions.BadRequestException("Content cannot be empty");
        }

        if (request.getContent().length() > 200) {
            throw new CustomExceptions.BadRequestException("Content must be at most 200 characters");
        }

        Post post = new Post();
        post.setUser(currentUser);
        post.setContent(request.getContent());

        // 返信の場合は親投稿を設定
        if (request.getParentPostId() != null) {
            Post parentPost = getPostById(request.getParentPostId());
            post.setParentPost(parentPost);
        }

        Post savedPost = postRepository.save(post);
        return convertToResponse(savedPost);
    }

    /**
     * 投稿を削除
     * - 本人のみ削除可能
     * - 返信も一緒に削除される（cascade）
     */
    public void deletePost(Long postId, User currentUser) {
        Post post = getPostById(postId);

        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new CustomExceptions.ForbiddenException("You can only delete your own posts");
        }

        postRepository.delete(post);
    }

    /**
     * 投稿詳細を取得
     */
    @Transactional(readOnly = true)
    public PostResponse getPostResponse(Long postId) {
        Post post = getPostById(postId);
        return convertToResponse(post);
    }

    /**
     * 投稿を取得（内部用）
     */
    @Transactional(readOnly = true)
    public Post getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Post not found"));
    }

    /**
     * タイムライン取得（全ユーザーの投稿）
     * - トップレベルの投稿のみ（返信は除外）
     * - 最新順
     * - ページネーション対応
     */
    @Transactional(readOnly = true)
    public Page<PostResponse> getTimeline(Pageable pageable) {
        Page<Post> posts = postRepository.findAllTopLevelPosts(pageable);

        // 現在のユーザーのいいね状態を一括取得
        User currentUser = getCurrentUserOrNull();
        List<Long> likedPostIds = List.of();
        if (currentUser != null && !posts.isEmpty()) {
            List<Long> postIds = posts.getContent().stream()
                    .map(Post::getId)
                    .collect(Collectors.toList());
            likedPostIds = likeRepository.findLikedPostIdsByUserAndPostIds(currentUser, postIds);
        }

        List<Long> finalLikedPostIds = likedPostIds;
        List<PostResponse> responses = posts.stream()
                .map(post -> convertToResponse(post, finalLikedPostIds.contains(post.getId())))
                .collect(Collectors.toList());
        return new PageImpl<>(responses, pageable, posts.getTotalElements());
    }

    /**
     * ユーザーの投稿一覧を取得
     * - トップレベルの投稿のみ（返信は除外）
     * - 最新順
     * - ページネーション対応
     */
    @Transactional(readOnly = true)
    public Page<PostResponse> getUserPosts(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        Page<Post> posts = postRepository.findByUserAndParentPostIsNull(user, pageable);

        // 現在のユーザーのいいね状態を一括取得
        User currentUser = getCurrentUserOrNull();
        List<Long> likedPostIds = List.of();
        if (currentUser != null && !posts.isEmpty()) {
            List<Long> postIds = posts.getContent().stream()
                    .map(Post::getId)
                    .collect(Collectors.toList());
            likedPostIds = likeRepository.findLikedPostIdsByUserAndPostIds(currentUser, postIds);
        }

        List<Long> finalLikedPostIds = likedPostIds;
        List<PostResponse> responses = posts.stream()
                .map(post -> convertToResponse(post, finalLikedPostIds.contains(post.getId())))
                .collect(Collectors.toList());
        return new PageImpl<>(responses, pageable, posts.getTotalElements());
    }

    /**
     * 投稿の返信一覧を取得
     * - 指定された投稿への返信のみ
     * - 作成順（昇順）
     * - ページネーション対応
     */
    @Transactional(readOnly = true)
    public Page<PostResponse> getReplies(Long parentPostId, Pageable pageable) {
        // 親投稿の存在確認
        getPostById(parentPostId);

        Page<Post> replies = postRepository.findByParentPostId(parentPostId, pageable);

        // 現在のユーザーのいいね状態を一括取得
        User currentUser = getCurrentUserOrNull();
        List<Long> likedPostIds = List.of();
        if (currentUser != null && !replies.isEmpty()) {
            List<Long> postIds = replies.getContent().stream()
                    .map(Post::getId)
                    .collect(Collectors.toList());
            likedPostIds = likeRepository.findLikedPostIdsByUserAndPostIds(currentUser, postIds);
        }

        List<Long> finalLikedPostIds = likedPostIds;
        List<PostResponse> responses = replies.stream()
                .map(post -> convertToResponse(post, finalLikedPostIds.contains(post.getId())))
                .collect(Collectors.toList());
        return new PageImpl<>(responses, pageable, replies.getTotalElements());
    }

    /**
     * 現在のユーザーを取得（認証されていない場合はnullを返す）
     */
    private User getCurrentUserOrNull() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                    && !authentication.getPrincipal().equals("anonymousUser")) {
                String email = authentication.getName();
                return userRepository.findByEmail(email).orElse(null);
            }
        } catch (Exception e) {
            // 認証情報がない場合はnullを返す
        }
        return null;
    }

    /**
     * 投稿をレスポンスDTOに変換（いいね状態を指定）
     */
    private PostResponse convertToResponse(Post post, boolean isLikedByCurrentUser) {
        // プロフィール画像URLを生成
        String profileImageUrl = null;
        if (post.getUser().getProfileImageUrl() != null && !post.getUser().getProfileImageUrl().isEmpty()) {
            // DBにはファイル名のみが保存されているため、完全なURLを生成
            // 例: https://my-bucket.s3.ap-northeast-1.amazonaws.com/profiles/1/05c1cbbc-91c6-4dcf-9ff8-2291a27a8190.jpg
            profileImageUrl = String.format("https://%s.s3.%s.amazonaws.com/profiles/%d/%s",
                    bucketName, region, post.getUser().getId(), post.getUser().getProfileImageUrl());
        }

        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .userProfileImageUrl(profileImageUrl)
                .parentPostId(post.getParentPost() != null ? post.getParentPost().getId() : null)
                .likesCount((long) post.getLikesCount())
                .repliesCount((long) post.getRepliesCount())
                .isLikedByCurrentUser(isLikedByCurrentUser)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    /**
     * 投稿をレスポンスDTOに変換（単一投稿用、いいね状態を個別に取得）
     */
    private PostResponse convertToResponse(Post post) {
        // 現在のユーザーがいいね済みかチェック
        boolean isLikedByCurrentUser = false;
        User currentUser = getCurrentUserOrNull();
        if (currentUser != null) {
            isLikedByCurrentUser = likeRepository.existsByUserAndPost(currentUser, post);
        }
        return convertToResponse(post, isLikedByCurrentUser);
    }
}
