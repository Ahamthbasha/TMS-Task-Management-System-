// types/interface/commentInterface.ts

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

export interface CommentApiResponse<T = IComment | IPaginatedComments | null> {
  success: boolean;
  message: string;
  data: T;
}