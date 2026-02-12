import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  getCommentsByTaskId,
  getCommentById,
  updateComment,
  deleteComment,
  createCommentWithFiles as createCommentWithFilesApi
} from '../api/userAction/userAction'
import type {
  ICreateCommentDTO,
  IUpdateCommentDTO,
  IGetCommentsParams,
  IComment,
  IPaginatedComments,

} from '../types/interface/commentInterface';
import type { 
  CommentApiResponse, 
  PaginatedCommentResponse,
  SingleCommentResponse,
  CommentWithFilesResponse 
} from '../types/interface/commentApiInterface';
import type { AxiosErrorResponse } from '../types/interface/errorInterface';
import { toast } from 'react-toastify';


// Query Keys
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (taskId: string, filters: IGetCommentsParams) => 
    [...commentKeys.lists(), taskId, filters] as const,
  details: () => [...commentKeys.all, 'detail'] as const,
  detail: (id: string) => [...commentKeys.details(), id] as const,
};
interface CachedCommentData {
  data: IPaginatedComments;
}

interface MutationContext {
  previousComments?: CachedCommentData;
}

export const useGetCommentsByTaskId = (taskId: string, params?: IGetCommentsParams) => {
  return useQuery<PaginatedCommentResponse, Error>({
    queryKey: commentKeys.list(taskId, params || {}),
    queryFn: () => getCommentsByTaskId(taskId, params),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10, 
  });
};

export const useGetCommentById = (commentId: string, enabled: boolean = true) => {
  return useQuery<SingleCommentResponse, Error>({
    queryKey: commentKeys.detail(commentId),
    queryFn: () => getCommentById(commentId),
    enabled: enabled && !!commentId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<SingleCommentResponse, AxiosErrorResponse, ICreateCommentDTO>({
    mutationFn: (data: ICreateCommentDTO) => {
      console.log('Creating comment with data:', data);
      return createComment(data);
    },
    onMutate: async (variables) => {
      const queryKey = commentKeys.list(variables.taskId, {});
      await queryClient.cancelQueries({ queryKey });
      const previousComments = queryClient.getQueryData<CachedCommentData>(queryKey);

      if (previousComments) {
        const optimisticComment: IComment = {
          _id: `temp-${Date.now()}`,
          content: variables.content,
          taskId: variables.taskId,
          createdBy: {
            _id: 'temp-user-id',
            name: 'Loading...',
            email: 'loading...@example.com'
          },
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<CachedCommentData>(queryKey, (old) => {
          if (!old?.data) return old;
          
          return {
            ...old,
            data: {
              ...old.data,
              comments: [optimisticComment, ...old.data.comments],
              total: old.data.total + 1,
            }
          };
        });
      }

      return { previousComments } as unknown;
    },
    onSuccess: (response, variables) => {
      console.log('Comment created successfully:', response);
      
      // Update the cache with the actual response data
      const queryKey = commentKeys.list(variables.taskId, {});
      queryClient.setQueryData<CachedCommentData>(queryKey, (old) => {
        if (!old?.data) return old;

        const comments = old.data.comments.map(comment => 
          comment._id.startsWith('temp-') ? response.data : comment
        );
        
        return {
          ...old,
          data: {
            ...old.data,
            comments,
            total: old.data.total,
          }
        };
      });

      // Force a refetch to ensure we have the latest data
      queryClient.invalidateQueries({ 
        queryKey: commentKeys.list(variables.taskId, {}) 
      });
      
      toast.success(response.message || 'Comment created successfully');
    },
    onError: (error: AxiosErrorResponse, variables, context: unknown) => {
      console.error('Error creating comment:', error);
      
      // Rollback optimistic update
      if (context && typeof context === 'object' && 'previousComments' in context) {
        const previousComments = (context as { previousComments?: CachedCommentData }).previousComments;
        if (previousComments) {
          const queryKey = commentKeys.list(variables.taskId, {});
          queryClient.setQueryData<CachedCommentData>(queryKey, previousComments);
        }
      }
      
      // Force refetch on error
      queryClient.invalidateQueries({ 
        queryKey: commentKeys.list(variables.taskId, {}) 
      });
      
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create comment';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<SingleCommentResponse, AxiosErrorResponse, { commentId: string; data: IUpdateCommentDTO }>({
    mutationFn: ({ commentId, data }: { commentId: string; data: IUpdateCommentDTO }) => {
      console.log('Updating comment:', { commentId, data });
      return updateComment(commentId, data);
    },
    onMutate: async (variables) => {
      return { commentId: variables.commentId } as unknown;
    },
    onSuccess: (response, variables) => {
      console.log('Comment updated successfully:', response);
      
      // If we have taskId in the response, update the cache
      if (response.data?.taskId) {
        const queryKey = commentKeys.list(response.data.taskId, {});
        queryClient.setQueryData<CachedCommentData>(queryKey, (old) => {
          if (!old?.data?.comments) return old;
          
          return {
            ...old,
            data: {
              ...old.data,
              comments: old.data.comments.map((comment: IComment) =>
                comment._id === variables.commentId 
                  ? { ...comment, ...response.data, content: variables.data.content }
                  : comment
              )
            }
          };
        });
        
        // Force refetch for this task
        queryClient.invalidateQueries({ 
          queryKey: commentKeys.list(response.data.taskId, {}) 
        });
      } else {
        // If we don't have taskId, invalidate all comment lists
        queryClient.invalidateQueries({ 
          queryKey: commentKeys.lists() 
        });
      }
      
      toast.success(response.message || 'Comment updated successfully');
    },
    onError: (error: AxiosErrorResponse) => {
      console.error('Error updating comment:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update comment';
      toast.error(errorMessage);
    },
  });
};

export const useDeleteComment = (taskId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<CommentApiResponse<void>, AxiosErrorResponse, string, MutationContext>({
    mutationFn: (commentId: string) => {
      console.log('Deleting comment:', commentId);
      return deleteComment(commentId);
    },
    onMutate: async (commentId: string) => {
      // Cancel any outgoing refetches
      if (taskId) {
        const queryKey = commentKeys.list(taskId, {});
        await queryClient.cancelQueries({ queryKey });
        
        // Snapshot the previous value
        const previousComments = queryClient.getQueryData<CachedCommentData>(queryKey);
        
        // Optimistically update to remove the comment
        if (previousComments) {
          queryClient.setQueryData<CachedCommentData>(queryKey, (old) => {
            if (!old?.data) return old;
            
            return {
              ...old,
              data: {
                ...old.data,
                comments: old.data.comments.filter((comment: IComment) => comment._id !== commentId),
                total: old.data.total - 1,
              }
            };
          });
        }
        
        return { previousComments };
      }
      
      return { previousComments: undefined };
    },
    onSuccess: (response) => {
      console.log('Comment deleted successfully:', response);
      
      // Force refetch to ensure UI is updated
      if (taskId) {
        queryClient.invalidateQueries({ 
          queryKey: commentKeys.list(taskId, {}) 
        });
      } else {
        // If we don't have taskId, invalidate all
        queryClient.invalidateQueries({ 
          queryKey: commentKeys.lists() 
        });
      }
      
      toast.success(response.message || 'Comment deleted successfully');
    },
    onError: (error: AxiosErrorResponse, _commentId: string, context?: MutationContext) => {
      console.error('Error deleting comment:', error);
      
      // Rollback optimistic update
      if (taskId && context?.previousComments) {
        const queryKey = commentKeys.list(taskId, {});
        queryClient.setQueryData<CachedCommentData>(queryKey, context.previousComments);
      }
      
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete comment';
      toast.error(errorMessage);
    },
  });
};

export const useCreateCommentWithFiles = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CommentWithFilesResponse, // Use the correct response type
    AxiosErrorResponse, 
    { data: ICreateCommentDTO; files: File[] }
  >({
    mutationFn: ({ data, files }: { data: ICreateCommentDTO; files: File[] }) => {
      console.log('Creating comment with files:', { data, filesCount: files.length });
      return createCommentWithFilesApi(data, files);
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for this query
      const queryKey = commentKeys.list(variables.data.taskId, {});
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<CachedCommentData>(queryKey);

      // Optimistically update to add the comment
      if (previousComments) {
        const optimisticComment: IComment = {
          _id: `temp-${Date.now()}`,
          content: variables.data.content,
          taskId: variables.data.taskId,
          createdBy: {
            _id: 'temp-user-id',
            name: 'Loading...',
            email: 'loading...@example.com'
          },
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<CachedCommentData>(queryKey, (old) => {
          if (!old?.data) return old;
          
          return {
            ...old,
            data: {
              ...old.data,
              comments: [optimisticComment, ...old.data.comments],
              total: old.data.total + 1,
            }
          };
        });
      }

      return { previousComments } as unknown;
    },
    onSuccess: (response, variables) => {
      console.log('Comment with files created successfully:', response);
      
      // Update the cache with the actual response data
      const queryKey = commentKeys.list(variables.data.taskId, {});
      queryClient.setQueryData<CachedCommentData>(queryKey, (old) => {
        if (!old?.data) return old;
        
        // Replace the temporary comment with the real one
        const comments = old.data.comments.map(comment => 
          comment._id.startsWith('temp-') ? response.data : comment
        );
        
        return {
          ...old,
          data: {
            ...old.data,
            comments,
            total: old.data.total,
          }
        };
      });

      // Force a refetch to ensure we have the latest data
      queryClient.invalidateQueries({ 
        queryKey: commentKeys.list(variables.data.taskId, {}) 
      });
      
      const message = response.message || 'Comment created successfully';
      
      // FIX: Access files from response.data, not response
      if (response.data?.files && response.data.files.length > 0) {
        toast.success(`${message} with ${response.data.files.length} files`);
      } else {
        toast.success(message);
      }
    },
    onError: (error: AxiosErrorResponse, variables, context: unknown) => {
      console.error('Error creating comment with files:', error);
      
      // Rollback optimistic update
      if (context && typeof context === 'object' && 'previousComments' in context) {
        const previousComments = (context as { previousComments?: CachedCommentData }).previousComments;
        if (previousComments) {
          const queryKey = commentKeys.list(variables.data.taskId, {});
          queryClient.setQueryData<CachedCommentData>(queryKey, previousComments);
        }
      }
      
      // Force refetch on error
      queryClient.invalidateQueries({ 
        queryKey: commentKeys.list(variables.data.taskId, {}) 
      });
      
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create comment with files';
      toast.error(errorMessage);
    },
  });
};