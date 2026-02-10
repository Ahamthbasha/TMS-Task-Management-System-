// types/interface/commentInterface.ts
import type { IFile } from './fileInterface';

export interface IPopulatedCommentUser {
  _id: string;
  name: string;
  email: string;
}

export interface IComment {
  _id: string;
  content: string;
  taskId: string;
  createdBy: IPopulatedCommentUser;
  isDeleted: boolean;
  deletedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// NEW: Interface for comment with files
export interface ICommentWithFiles extends IComment {
  files?: IFile[];
}

export interface IPaginatedComments {
  comments: IComment[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ICreateCommentDTO {
  content: string;
  taskId: string;
}

export interface IUpdateCommentDTO {
  content: string;
}

export interface IGetCommentsParams {
  page?: number;
  limit?: number;
}

// Update CommentApiResponse to include ICommentWithFiles
export interface CommentApiResponse<T = IComment | IPaginatedComments | ICommentWithFiles | null> {
  success: boolean;
  message: string;
  data: T;
}