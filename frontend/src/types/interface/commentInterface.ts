export interface IPopulatedCommentUser {
  _id: string;
  name: string;
  email: string;
}

export interface IPopulatedCommentFileUser {
  _id: string;
  name: string;
  email: string;
}
export interface ICommentFile {
  _id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string;
  size: number;
  uploadedBy: IPopulatedCommentFileUser;
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
  files?: ICommentFile[]; // ADD THIS
}

export interface ICommentWithFiles extends IComment {
  files?: ICommentFile[];
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

export interface CommentApiResponse<T = IComment | IPaginatedComments | ICommentWithFiles | null> {
  success: boolean;
  message: string;
  data: T;
}