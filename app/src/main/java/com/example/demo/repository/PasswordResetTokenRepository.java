package com.example.demo.repository;

import com.example.demo.entity.PasswordResetToken;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenAndUsedFalseAndExpiresAtAfter(String token, LocalDateTime now);
    void deleteByUser(User user);
}
