// hooks/useFileQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadFile,
  getTaskFiles,
  getCommentFiles,
  getAllTaskFiles,
  deleteFile,
  downloadFile,
  uploadMultipleFiles,
} from '../api/userAction/userAction';
import { toast } from 'react-toastify';
import type {
  IUploadFileDTO,
  IUploadFileResponse,
  IGetFilesResponse,
  IDeleteFileResponse,
} from '../types/interface/fileInterface';

// Error response type
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface DownloadResponse {
  blob: Blob;
  filename: string;
}

// Query Keys
export const fileKeys = {
  all: ['files'] as const,
  task: (taskId: string) => [...fileKeys.all, 'task', taskId] as const,
  taskAll: (taskId: string) => [...fileKeys.all, 'task-all', taskId] as const,
  comment: (commentId: string) => [...fileKeys.all, 'comment', commentId] as const,
};

/**
 * Hook to fetch task-level files
 */
export const useGetTaskFiles = (taskId: string) => {
  return useQuery<IGetFilesResponse, Error>({
    queryKey: fileKeys.task(taskId),
    queryFn: () => getTaskFiles(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch all files for a task (including comment files)
 */
export const useGetAllTaskFiles = (taskId: string) => {
  return useQuery<IGetFilesResponse, Error>({
    queryKey: fileKeys.taskAll(taskId),
    queryFn: () => getAllTaskFiles(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch comment files
 */
export const useGetCommentFiles = (commentId: string) => {
  return useQuery<IGetFilesResponse, Error>({
    queryKey: fileKeys.comment(commentId),
    queryFn: () => getCommentFiles(commentId),
    enabled: !!commentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to upload a single file
 */
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation<IUploadFileResponse, ApiError, IUploadFileDTO>({
    mutationFn: uploadFile,
    onSuccess: (response, variables) => {
      // Invalidate relevant queries based on where file was uploaded
      if (variables.taskId) {
        queryClient.invalidateQueries({ queryKey: fileKeys.task(variables.taskId) });
        queryClient.invalidateQueries({ queryKey: fileKeys.taskAll(variables.taskId) });
      }
      if (variables.commentId) {
        queryClient.invalidateQueries({ queryKey: fileKeys.comment(variables.commentId) });
      }
      toast.success(response.message || 'File uploaded successfully');
    },
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to upload file';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to upload multiple files
 */
export const useUploadMultipleFiles = () => {
  const queryClient = useQueryClient();

  return useMutation<IUploadFileResponse[], ApiError, IUploadFileDTO[]>({
    mutationFn: uploadMultipleFiles,
    onSuccess: (responses, variables) => {
      // Invalidate queries for each file's context
      variables.forEach(file => {
        if (file.taskId) {
          queryClient.invalidateQueries({ queryKey: fileKeys.task(file.taskId) });
          queryClient.invalidateQueries({ queryKey: fileKeys.taskAll(file.taskId) });
        }
        if (file.commentId) {
          queryClient.invalidateQueries({ queryKey: fileKeys.comment(file.commentId) });
        }
      });
      toast.success(`${responses.length} files uploaded successfully`);
    },
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to upload files';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete a file
 */
export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation<IDeleteFileResponse, ApiError, string>({
    mutationFn: deleteFile,
    onSuccess: (response) => {
      // Invalidate all file queries
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
      toast.success(response.message || 'File deleted successfully');
    },
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete file';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to download a file
 */


export const useDownloadFile = () => {
  return useMutation<DownloadResponse, ApiError, string>({
    mutationFn: downloadFile,
    onSuccess: (data) => {
      // Create download link
      const url = window.URL.createObjectURL(data.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Download started: ${data.filename}`);
    },
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to download file';
      toast.error(errorMessage);
    },
  });
};