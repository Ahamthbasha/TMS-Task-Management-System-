// hooks/useTaskQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  bulkCreateTasks,
} from '../api/userAction/userAction';
import type {
  ICreateTaskDTO,
  IUpdateTaskDTO,
  IGetTasksQueryParams,
  IBulkCreateTasksDTO,
} from '../types/interface/taskInterface';
import type { AxiosErrorResponse } from '../types/interface/errorInterface';
import { toast } from 'react-toastify';

// Query Keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: IGetTasksQueryParams) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

/**
 * Hook to fetch all tasks with filters
 */
export const useGetTasks = (params?: IGetTasksQueryParams) => {
  return useQuery({
    queryKey: taskKeys.list(params || {}),
    queryFn: () => getTasks(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch a single task by ID
 */
export const useGetTaskById = (taskId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => getTaskById(taskId),
    enabled: enabled && !!taskId,
  });
};

/**
 * Hook to create a new task
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateTaskDTO) => createTask(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(response.message || 'Task created successfully');
    },
    onError: (error: AxiosErrorResponse) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create task';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update an existing task
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: IUpdateTaskDTO }) =>
      updateTask(taskId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
      toast.success(response.message || 'Task updated successfully');
    },
    onError: (error: AxiosErrorResponse) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update task';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete a task
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(response.message || 'Task deleted successfully');
    },
    onError: (error: AxiosErrorResponse) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete task';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to bulk create tasks
 */
export const useBulkCreateTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IBulkCreateTasksDTO) => bulkCreateTasks(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(response.message || 'Tasks created successfully');
    },
    onError: (error: AxiosErrorResponse) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create tasks';
      toast.error(errorMessage);
    },
  });
};