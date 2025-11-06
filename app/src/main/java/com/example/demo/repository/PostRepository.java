package com.example.demo.repository;

import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p WHERE p.parentPost IS NULL ORDER BY p.createdAt DESC")
    Page<Post> findAllTopLevelPosts(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user = :user AND p.parentPost IS NULL ORDER BY p.createdAt DESC")
    Page<Post> findByUserAndParentPostIsNull(User user, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.parentPost.id = :parentPostId ORDER BY p.createdAt ASC")
    Page<Post> findByParentPostId(Long parentPostId, Pageable pageable);
}
