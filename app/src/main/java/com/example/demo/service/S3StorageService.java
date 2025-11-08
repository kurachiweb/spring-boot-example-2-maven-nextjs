package com.example.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.util.UUID;

/**
 * Amazon S3ストレージサービス
 * - app.storage.type=s3の場合に使用される
 * - Amazon S3に画像をアップロード
 * - ファイル名のみを返す（URL生成はDTOで行う）
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3StorageService implements IStorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${app.storage.storage-base-url}")
    private String storageBaseUrl;

    /**
     * プロフィール画像をS3に保存
     * @param userId ユーザーID
     * @param imageData 画像データ
     * @param originalFilename 元のファイル名
     * @return ファイル名のみ（例: 05c1cbbc-91c6-4dcf-9ff8-2291a27a8190.jpg）
     */
    @Override
    public String saveProfileImage(Long userId, byte[] imageData, String originalFilename) {
        try {
            // ファイル名を生成（拡張子を保持）
            String fileExtension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + "." + fileExtension;

            // S3のキー（パス）を生成: profiles/{userId}/{filename}
            String s3Key = "profiles/" + userId + "/" + filename;

            // Content-Typeを設定
            String contentType = getContentType(fileExtension);

            // S3にアップロード
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(contentType)
                    .contentLength((long) imageData.length)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(imageData));

            log.info("Profile image uploaded to S3 for user {}: s3://{}/{}", userId, bucketName, s3Key);

            // ファイル名のみを返す（DBに保存される）
            // URL生成はUserResponseで行う
            return filename;

        } catch (S3Exception e) {
            log.error("Failed to upload profile image to S3 for user {}: {}", userId, e.awsErrorDetails().errorMessage(), e);
            throw new RuntimeException("Failed to upload image to S3", e);
        } catch (Exception e) {
            log.error("Unexpected error uploading profile image to S3 for user {}", userId, e);
            throw new RuntimeException("Failed to upload image to S3", e);
        }
    }

    /**
     * S3からファイルを削除
     * @param userId ユーザーID
     * @param filename ファイル名（例: 05c1cbbc-91c6-4dcf-9ff8-2291a27a8190.jpg）
     */
    @Override
    public void deleteFile(Long userId, String filename) {
        try {
            if (filename == null || filename.isEmpty()) {
                return;
            }

            // S3のキー（パス）を生成: profiles/{userId}/{filename}
            String s3Key = "profiles/" + userId + "/" + filename;

            // S3から削除
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

            log.info("File deleted from S3: s3://{}/{}", bucketName, s3Key);

        } catch (S3Exception e) {
            log.error("Failed to delete file from S3 (user: {}, file: {}): {}", userId, filename, e.awsErrorDetails().errorMessage(), e);
            // ファイル削除失敗時はエラーをログするが、処理は続行
        } catch (Exception e) {
            log.error("Unexpected error deleting file from S3 (user: {}, file: {})", userId, filename, e);
            // ファイル削除失敗時はエラーをログするが、処理は続行
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

    /**
     * ファイル拡張子からContent-Typeを取得
     */
    private String getContentType(String fileExtension) {
        return switch (fileExtension.toLowerCase()) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            case "gif" -> "image/gif";
            default -> "application/octet-stream";
        };
    }
}
