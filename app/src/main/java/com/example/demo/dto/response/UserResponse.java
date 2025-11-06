package com.example.demo.dto.response;

import com.example.demo.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String username;
    private String bio;
    private String profileImageUrl;
    private Long followersCount;
    private Long followingCount;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .bio(user.getBio())
            .profileImageUrl(user.getProfileImageUrl())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
