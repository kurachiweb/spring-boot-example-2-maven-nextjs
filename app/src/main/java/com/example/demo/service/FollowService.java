package com.example.demo.service;

import com.example.demo.dto.response.UserResponse;
import com.example.demo.entity.Follow;
import com.example.demo.entity.User;
import com.example.demo.exception.CustomExceptions;
import com.example.demo.repository.FollowRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * ユーザーをフォロー
     * - 同じユーザーを複数回フォローできないようにチェック
     * - 自分自身をフォローできないようにチェック
     */
    public void follow(Long targetUserId, User currentUser) {
        if (currentUser.getId().equals(targetUserId)) {
            throw new CustomExceptions.BadRequestException("You cannot follow yourself");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        if (followRepository.existsByFollowerAndFollowing(currentUser, targetUser)) {
            throw new CustomExceptions.ConflictException("You are already following this user");
        }

        Follow follow = new Follow();
        follow.setFollower(currentUser);
        follow.setFollowing(targetUser);

        followRepository.save(follow);
    }

    /**
     * ユーザーをアンフォロー
     */
    public void unfollow(Long targetUserId, User currentUser) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        Follow follow = followRepository.findByFollowerAndFollowing(currentUser, targetUser)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("You are not following this user"));

        followRepository.delete(follow);
    }

    /**
     * フォロー中のユーザー一覧を取得
     * - 指定ユーザーがフォロー中のユーザー
     * - ページネーション対応
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getFollowing(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        Page<Follow> follows = followRepository.findByFollower(user, pageable);

        List<UserResponse> responses = follows.stream()
                .map(follow -> userService.getUserResponse(follow.getFollowing()))
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, follows.getTotalElements());
    }

    /**
     * フォロワー一覧を取得
     * - 指定ユーザーをフォロー中のユーザー
     * - ページネーション対応
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getFollowers(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        Page<Follow> follows = followRepository.findByFollowing(user, pageable);

        List<UserResponse> responses = follows.stream()
                .map(follow -> userService.getUserResponse(follow.getFollower()))
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, follows.getTotalElements());
    }

    /**
     * フォロー中か確認
     */
    @Transactional(readOnly = true)
    public boolean isFollowing(Long targetUserId, User currentUser) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        return followRepository.existsByFollowerAndFollowing(currentUser, targetUser);
    }

    /**
     * フォロー数を取得
     */
    @Transactional(readOnly = true)
    public long getFollowingCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        return followRepository.countByFollower(user);
    }

    /**
     * フォロワー数を取得
     */
    @Transactional(readOnly = true)
    public long getFollowersCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        return followRepository.countByFollowing(user);
    }
}
