package com.example.demo.service;

/**
 * ストレージサービスのインターフェース
 * - プロフィール画像の保存と削除を定義
 * - Local、S3などの実装クラスで実装
 */
public interface IStorageService {

    /**
     * プロフィール画像を保存
     * @param userId ユーザーID
     * @param imageData 画像データ
     * @param originalFilename 元のファイル名
     * @return 保存された画像のURL
     */
    String saveProfileImage(Long userId, byte[] imageData, String originalFilename);

    /**
     * ファイルを削除
     * @param userId ユーザーID
     * @param filename ファイル名（例: 05c1cbbc-91c6-4dcf-9ff8-2291a27a8190.jpg）
     */
    void deleteFile(Long userId, String filename);
}
