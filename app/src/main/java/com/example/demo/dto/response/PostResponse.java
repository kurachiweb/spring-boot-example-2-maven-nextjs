package com.example.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {
    private Long id;
    private String content;
    private Long userId;
    private String username;
    private String userProfileImageUrl;
    private Long parentPostId;
    private Long likesCount;
    private Long repliesCount;
    private Boolean isLikedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
