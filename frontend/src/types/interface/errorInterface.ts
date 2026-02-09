// types/interface/errorInterface.ts

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface AxiosErrorResponse {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
    statusText?: string;
  };
  message?: string;
}