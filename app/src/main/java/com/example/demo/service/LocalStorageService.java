package com.example.demo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * ローカルストレージサービス
 * - app.storage.type=localの場合に使用される
 * - ローカルファイルシステムに画像を保存
 * - ファイル名のみを返す（URL生成はDTOで行う）
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local")
public class LocalStorageService implements IStorageService {

    @Value("${app.storage.local-path:/tmp/uploads}")
    private String storagePath;

    @Value("${app.storage.storage-base-url}")
    private String storageBaseUrl;

    /**
     * プロフィール画像を保存
     * - ローカルストレージにファイルを保存
     * - ファイル名のみを返す（例: 05c1cbbc-91c6-4dcf-9ff8-2291a27a8190.jpg）
     */
    @Override
    public String saveProfileImage(Long userId, byte[] imageData, String originalFilename) {
        try {
            // ディレクトリ構造を作成
            String userDir = storagePath + "/profiles/" + userId;
            createDirectoryIfNotExists(userDir);

            // ファイル名を生成（拡張子を保持）
            String fileExtension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + "." + fileExtension;
            String filePath = userDir + "/" + filename;

            // ファイルを保存
            writeFile(filePath, imageData);

            log.info("Profile image saved for user {}: {}", userId, filePath);

            // ファイル名のみを返す（DBに保存される）
            // URL生成はUserResponseで行う
            return filename;
        } catch (IOException e) {
            log.error("Failed to save profile image for user {}", userId, e);
            throw new RuntimeException("Failed to save image", e);
        }
    }

    /**
     * ローカルストレージからファイルを削除
     * @param userId ユーザーID
     * @param filename ファイル名（例: 05c1cbbc-91c6-4dcf-9ff8-2291a27a8190.jpg）
     */
    @Override
    public void deleteFile(Long userId, String filename) {
        try {
            if (filename == null || filename.isEmpty()) {
                return;
            }

            // ローカルパスを生成: {storagePath}/profiles/{userId}/{filename}
            String localPath = storagePath + "/profiles/" + userId + "/" + filename;

            File file = new File(localPath);
            if (file.exists()) {
                if (file.delete()) {
                    log.info("File deleted: {}", localPath);
                } else {
                    log.warn("Failed to delete file: {}", localPath);
                }
            }
        } catch (Exception e) {
            log.error("Error deleting file (user: {}, file: {})", userId, filename, e);
            // ファイル削除失敗時はエラーをログするが、処理は続行
        }
    }

    /**
     * ディレクトリを作成（存在しない場合）
     */
    private void createDirectoryIfNotExists(String dirPath) throws IOException {
        Path path = Paths.get(dirPath);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            log.info("Directory created: {}", dirPath);
        }
    }

    /**
     * ファイルを書き込み
     */
    private void writeFile(String filePath, byte[] data) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(filePath)) {
            fos.write(data);
        }
    }

    /**
     * ファイル拡張子を取得
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf(".");
        if (lastDot > 0) {
            return filename.substring(lastDot + 1).toLowerCase();
        }
        return "jpg"; // デフォルト値
    }
}
