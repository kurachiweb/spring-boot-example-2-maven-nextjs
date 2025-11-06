import { formatDistanceToNow, format } from "date-fns";
import { ja } from "date-fns/locale";

// Date formatting utilities
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: ja });
};

export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "yyyy年MM月dd日 HH:mm", { locale: ja });
};

// URL detection and linkification
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const detectUrls = (text: string): string[] => {
  const matches = text.match(URL_REGEX);
  return matches || [];
};

export const linkifyText = (text: string): string => {
  return text.replace(URL_REGEX, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
  });
};

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

export const countCharacters = (text: string): number => {
  return text.length;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const isValidUsername = (username: string): boolean => {
  return username.length > 0 && username.length <= 50;
};

export const isValidBio = (bio: string): boolean => {
  return bio.length <= 1000;
};

export const isValidPostContent = (content: string): boolean => {
  return content.length > 0 && content.length <= 200;
};

// File utilities
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 2 * 1024 * 1024; // 2MB

  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const getImageFileError = (file: File): string | null => {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    return "画像ファイルはJPEG、PNG、WebP形式のみ対応しています";
  }

  if (file.size > maxSize) {
    return "画像ファイルは2MB以下にしてください";
  }

  return null;
};

// Class name utility for conditional styling
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

// Debounce utility
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// Local storage utilities
export const setLocalStorage = (key: string, value: unknown): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const getLocalStorage = <T>(key: string): T | null => {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as T;
      } catch (error) {
        console.error("Failed to parse localStorage item:", error);
        return null;
      }
    }
  }
  return null;
};

export const removeLocalStorage = (key: string): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

// Image URL utility
export const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;

  // 既に完全なURLの場合はそのまま返す
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 相対パスの場合、APIのベースURLと結合
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:55032/api";
  const baseUrl = apiUrl.replace("/api", "");
  return `${baseUrl}${path}`;
};
