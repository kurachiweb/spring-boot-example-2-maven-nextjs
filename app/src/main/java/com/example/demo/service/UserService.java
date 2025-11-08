package com.example.demo.service;

import com.example.demo.dto.request.UpdateProfileRequest;
import com.example.demo.dto.response.UserResponse;
import com.example.demo.entity.User;
import com.example.demo.exception.CustomExceptions;
import com.example.demo.repository.FollowRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final IStorageService storageService;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    /**
     * ユーザー名からユーザー情報を取得
     */
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
    }

    /**
     * ユーザー情報をレスポンスDTOに変換
     * プロフィール画像URLを生成する
     */
    @Transactional(readOnly = true)
    public UserResponse getUserResponse(User user) {
        long followingCount = followRepository.countByFollower(user);
        long followersCount = followRepository.countByFollowing(user);

        // UserResponse.fromEntityでURL生成を行う
        UserResponse response = UserResponse.fromEntity(user, bucketName, region);
        response.setFollowingCount(followingCount);
        response.setFollowersCount(followersCount);

        return response;
    }

    /**
     * プロフィール情報を更新
     */
    public UserResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            if (!request.getUsername().equals(currentUser.getUsername())) {
                if (userRepository.existsByUsername(request.getUsername())) {
                    throw new CustomExceptions.ConflictException("Username already taken");
                }
            }
            currentUser.setUsername(request.getUsername());
        }

        if (request.getBio() != null) {
            if (request.getBio().length() > 1000) {
                throw new CustomExceptions.BadRequestException("Bio must be at most 1000 characters");
            }
            currentUser.setBio(request.getBio());
        }

        User updatedUser = userRepository.save(currentUser);
        return getUserResponse(updatedUser);
    }

    /**
     * プロフィール画像をアップロード
     * - 既存画像がある場合は削除
     * - ファイルを保存してファイル名をDBに保存
     * - 完全なURLを生成してクライアントに返す
     */
    public String uploadProfileImage(User currentUser, byte[] imageData, String originalFilename) {
        // ファイルサイズ検証（2MB）
        if (imageData.length > 2 * 1024 * 1024) {
            throw new CustomExceptions.BadRequestException("File size must not exceed 2MB");
        }

        // ファイル形式検証
        String filename = originalFilename.toLowerCase();
        if (!filename.endsWith(".jpg") && !filename.endsWith(".jpeg") &&
            !filename.endsWith(".png") && !filename.endsWith(".webp")) {
            throw new CustomExceptions.BadRequestException("Only JPEG, PNG, and WebP images are allowed");
        }

        // 既存画像を削除
        if (currentUser.getProfileImageUrl() != null && !currentUser.getProfileImageUrl().isEmpty()) {
            storageService.deleteFile(currentUser.getId(), currentUser.getProfileImageUrl());
        }

        // ファイル保存（ファイル名のみが返る）
        String savedFilename = storageService.saveProfileImage(currentUser.getId(), imageData, originalFilename);
        currentUser.setProfileImageUrl(savedFilename);
        userRepository.save(currentUser);

        // 完全なURLを生成してクライアントに返す
        // 例: https://my-bucket.s3.ap-northeast-1.amazonaws.com/profiles/1/05c1cbbc-91c6-4dcf-9ff8-2291a27a8190.jpg
        return String.format("https://%s.s3.%s.amazonaws.com/profiles/%d/%s",
                bucketName, region, currentUser.getId(), savedFilename);
    }

    /**
     * メールアドレスからユーザーを取得
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
    }
}
