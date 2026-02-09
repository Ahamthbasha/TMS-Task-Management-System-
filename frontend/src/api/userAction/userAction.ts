// api/userAction/userAction.ts

import { API } from "../../service/axios"; 
import userRouterEndPoints from "../../endpoints/userEndpoint"; 
import type {
  ICreateTaskDTO,
  IUpdateTaskDTO,
  IGetTasksQueryParams,
  IBulkCreateTasksDTO,
  TaskApiResponse,
  ITask,
  IPaginatedTasks,
} from "../../types/interface/taskInterface";

import type {
  ICreateCommentDTO,
  IUpdateCommentDTO,
  IGetCommentsParams,
  CommentApiResponse,
  IComment,
  IPaginatedComments,
} from "../../types/interface/commentInterface";

export const createTask = async (data: ICreateTaskDTO): Promise<TaskApiResponse<ITask>> => {
  const response = await API.post(userRouterEndPoints.userCreateTask, data);
  return response.data;
};

export const getTasks = async (
  params?: IGetTasksQueryParams
): Promise<TaskApiResponse<IPaginatedTasks>> => {
  const response = await API.get(userRouterEndPoints.userGetTask, { params });
  return response.data;
};

export const getTaskById = async (taskId: string): Promise<TaskApiResponse<ITask>> => {
  const response = await API.get(`${userRouterEndPoints.userGetTaskById}/${taskId}`);
  return response.data;
};

export const updateTask = async (
  taskId: string,
  data: IUpdateTaskDTO
): Promise<TaskApiResponse<ITask>> => {
  const response = await API.put(`${userRouterEndPoints.userUpdateTask}/${taskId}`, data);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<TaskApiResponse<void>> => {
  const response = await API.delete(`${userRouterEndPoints.userUpdateTask}/${taskId}`);
  return response.data;
};

export const bulkCreateTasks = async (
  data: IBulkCreateTasksDTO
): Promise<TaskApiResponse<ITask[]>> => {
  const response = await API.post(userRouterEndPoints.userBulkTask, data);
  return response.data;
};
export const createComment = async (data: ICreateCommentDTO): Promise<CommentApiResponse<IComment>> => {
  console.log('API: createComment called with:', data);
  try {
    const response = await API.post(userRouterEndPoints.userCreateComment, data);
    console.log('API: createComment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: createComment error:', error);
    throw error;
  }
};

export const getCommentsByTaskId = async (
  taskId: string,
  params?: IGetCommentsParams
): Promise<CommentApiResponse<IPaginatedComments>> => {
  console.log('API: getCommentsByTaskId called with:', { taskId, params });
  try {
    const response = await API.get(`${userRouterEndPoints.userGetComments}/${taskId}`, { params });
    return response.data;
  } catch (error) {
    console.error('API: getCommentsByTaskId error:', error);
    throw error;
  }
};

export const getCommentById = async (commentId: string): Promise<CommentApiResponse<IComment>> => {
  console.log('API: getCommentById called with:', commentId);
  try {
    const response = await API.get(`${userRouterEndPoints.userGetCommentById}/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('API: getCommentById error:', error);
    throw error;
  }
};

export const updateComment = async (
  commentId: string,
  data: IUpdateCommentDTO
): Promise<CommentApiResponse<IComment>> => {
  console.log('API: updateComment called with:', { commentId, data });
  try {
    const response = await API.put(`${userRouterEndPoints.userUpdateComment}/${commentId}`, data);
    console.log('API: updateComment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: updateComment error:', error);
    throw error;
  }
};

export const deleteComment = async (commentId: string): Promise<CommentApiResponse<void>> => {
  console.log('API: deleteComment called with:', commentId);
  try {
    const response = await API.delete(`${userRouterEndPoints.userDeleteComment}/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('API: deleteComment error:', error);
    throw error;
  }
};