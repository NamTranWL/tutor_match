export interface ApiResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
}

export interface ApiError {
  statusCode: number;
  message?: string;
  error?: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  pages: number;
  total: number;
}

export interface PageParams {
  page?: number;
  limit?: number;
  sort?: string;
}
