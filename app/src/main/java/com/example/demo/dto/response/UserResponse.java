package com.example.demo.dto.response;

import com.example.demo.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

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

    /**
     * ユーザーエンティティからUserResponseを生成
     * プロフィール画像URLを生成する
     *
     * @param user ユーザーエンティティ
     * @param bucketName S3バケット名
     * @param region AWSリージョン
     * @return UserResponse
     */
    public static UserResponse fromEntity(User user, String bucketName, String region) {
        String profileImageUrl = null;
        if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isEmpty()) {
            // DBにはファイル名のみが保存されているため、完全なURLを生成
            // 例: 05c1cbbc-91c6-4dcf-9ff8-2291a27a8190.jpg
            // -> https://my-bucket.s3.ap-northeast-1.amazonaws.com/profiles/1/05c1cbbc-91c6-4dcf-9ff8-2291a27a8190.jpg
            profileImageUrl = String.format("https://%s.s3.%s.amazonaws.com/profiles/%d/%s",
                    bucketName, region, user.getId(), user.getProfileImageUrl());
        }

        return UserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .bio(user.getBio())
            .profileImageUrl(profileImageUrl)
            .createdAt(user.getCreatedAt())
            .build();
    }

    /**
     * 後方互換性のため、storageBaseUrlなしのメソッドも残す（非推奨）
     * @deprecated storageBaseUrlを指定するメソッドを使用してください
     */
    @Deprecated
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
