package com.example.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * ウェルカムメール送信
     */
    public void sendWelcomeEmail(String toEmail, String username) {
        try {
            String subject = "Welcome to AtamiShare!";
            String text = buildWelcomeEmailBody(username);

            sendEmail(toEmail, subject, text);
            log.info("Welcome email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}", toEmail, e);
            // メール送信失敗時も登録処理は続行
        }
    }

    /**
     * パスワードリセットメール送信
     */
    public void sendPasswordResetEmail(String toEmail, String username, String resetToken) {
        try {
            String subject = "Password Reset Request - AtamiShare";
            String resetLink = frontendUrl + "/password-reset/" + resetToken;
            String text = buildPasswordResetEmailBody(username, resetLink);

            sendEmail(toEmail, subject, text);
            log.info("Password reset email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", toEmail, e);
            // メール送信失敗時も処理は続行
        }
    }

    /**
     * メール送信（内部用）
     */
    private void sendEmail(String toEmail, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    /**
     * ウェルカムメールのBody生成
     */
    private String buildWelcomeEmailBody(String username) {
        return String.format(
                "Hello %s,\n\n" +
                "Welcome to AtamiShare! We're excited to have you join our community.\n\n" +
                "You can start posting, following other users, and engaging with content right away.\n\n" +
                "If you have any questions, feel free to reach out to our support team.\n\n" +
                "Best regards,\n" +
                "AtamiShare Team",
                username
        );
    }

    /**
     * パスワードリセットメールのBody生成
     */
    private String buildPasswordResetEmailBody(String username, String resetLink) {
        return String.format(
                "Hello %s,\n\n" +
                "We received a request to reset your password. If you didn't make this request, you can ignore this email.\n\n" +
                "To reset your password, click the link below:\n" +
                "%s\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you're unable to click the link, copy and paste it into your browser.\n\n" +
                "Best regards,\n" +
                "AtamiShare Team",
                username, resetLink
        );
    }
}
