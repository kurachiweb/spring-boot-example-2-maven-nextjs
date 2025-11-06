package com.example.demo.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessagePreparator;

import jakarta.mail.internet.MimeMessage;
import java.io.InputStream;

@Slf4j
@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        return new JavaMailSender() {
            @Override
            public MimeMessage createMimeMessage() {
                return null;
            }

            @Override
            public MimeMessage createMimeMessage(InputStream contentStream) {
                return null;
            }

            @Override
            public void send(MimeMessage mimeMessage) {
                log.info("Mock mail sender: Email would be sent (MimeMessage)");
            }

            @Override
            public void send(MimeMessage... mimeMessages) {
                log.info("Mock mail sender: {} emails would be sent (MimeMessages)", mimeMessages.length);
            }

            @Override
            public void send(MimeMessagePreparator mimeMessagePreparator) {
                log.info("Mock mail sender: Email would be sent (MimeMessagePreparator)");
            }

            @Override
            public void send(MimeMessagePreparator... mimeMessagePreparators) {
                log.info("Mock mail sender: {} emails would be sent (MimeMessagePreparators)", mimeMessagePreparators.length);
            }

            @Override
            public void send(SimpleMailMessage simpleMessage) {
                log.info("Mock mail sender: Email would be sent");
                log.info("  From: {}", simpleMessage.getFrom());
                log.info("  To: {}", simpleMessage.getTo() != null ? String.join(", ", simpleMessage.getTo()) : "");
                log.info("  Subject: {}", simpleMessage.getSubject());
                log.info("  Text: {}", simpleMessage.getText());
            }

            @Override
            public void send(SimpleMailMessage... simpleMessages) {
                log.info("Mock mail sender: {} emails would be sent", simpleMessages.length);
                for (SimpleMailMessage message : simpleMessages) {
                    send(message);
                }
            }
        };
    }
}
