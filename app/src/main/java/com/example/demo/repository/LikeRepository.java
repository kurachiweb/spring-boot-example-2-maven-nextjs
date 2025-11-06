package com.example.demo.repository;

import com.example.demo.entity.Like;
import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);
    boolean existsByUserAndPost(User user, Post post);
    long countByPost(Post post);

    /**
     * 指定されたユーザーが指定された投稿IDリストのいずれかをいいね済みかを確認
     * いいね済みの投稿のIDリストを返す
     */
    @Query("SELECT l.post.id FROM Like l WHERE l.user = :user AND l.post.id IN :postIds")
    List<Long> findLikedPostIdsByUserAndPostIds(@Param("user") User user, @Param("postIds") List<Long> postIds);
}
