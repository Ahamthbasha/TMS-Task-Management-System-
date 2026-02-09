// types/interface/commentApiInterface.ts

import {type IComment, type IPaginatedComments } from './commentInterface';

export interface CommentApiResponse<T = IComment | IPaginatedComments | null> {
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