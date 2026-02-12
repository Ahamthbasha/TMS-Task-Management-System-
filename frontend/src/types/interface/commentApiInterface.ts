
import {type IComment, type IPaginatedComments, type ICommentWithFiles } from './commentInterface';

export interface CommentApiResponse<T = IComment | IPaginatedComments | ICommentWithFiles | null> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedCommentResponse {
  success: boolean;
  message: string;
  data: IPaginatedComments;
}

export interface SingleCommentResponse {
  success: boolean;
  message: string;
  data: IComment;
}

// NEW: Response type for comment with files
export interface CommentWithFilesResponse {
  success: boolean;
  message: string;
  data: ICommentWithFiles;
}