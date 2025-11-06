export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  currentPage: number;
  totalElements: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface MessageResponse {
  message: string;
}
