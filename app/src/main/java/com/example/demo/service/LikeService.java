package com.example.demo.service;

import com.example.demo.entity.Like;
import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import com.example.demo.exception.CustomExceptions;
import com.example.demo.repository.LikeRepository;
import com.example.demo.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;

    /**
     * いいねを追加
     * - ユーザーが同じ投稿に複数回いいねできないようにチェック
     */
    public long addLike(Long postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Post not found"));

        // 既にいいねされているかチェック
        if (likeRepository.existsByUserAndPost(currentUser, post)) {
            throw new CustomExceptions.ConflictException("You have already liked this post");
        }

        Like like = new Like();
        like.setUser(currentUser);
        like.setPost(post);

        likeRepository.save(like);

        return getCountLikes(postId);
    }

    /**
     * いいねを削除
     */
    public long removeLike(Long postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Post not found"));

        Like like = likeRepository.findByUserAndPost(currentUser, post)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Like not found"));

        likeRepository.delete(like);

        return getCountLikes(postId);
    }

    /**
     * いいね数をカウント
     */
    @Transactional(readOnly = true)
    public long getCountLikes(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Post not found"));

        return likeRepository.countByPost(post);
    }
}
