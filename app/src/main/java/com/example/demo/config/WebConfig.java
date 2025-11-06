package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.storage.local-path:./uploads}")
    private String storagePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            // 相対パスを絶対パスに変換
            File storageDir = new File(storagePath);
            String absolutePath = storageDir.getCanonicalPath();

            // アップロードされた画像を静的リソースとして提供
            registry.addResourceHandler("/profiles/**")
                    .addResourceLocations("file:" + absolutePath + "/profiles/");
        } catch (IOException e) {
            throw new RuntimeException("Failed to resolve storage path", e);
        }
    }
}
