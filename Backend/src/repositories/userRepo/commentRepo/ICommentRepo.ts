import { IGenericRepository } from '../../genericRepo/interface/IGenericRepo';
import { IComment } from '../../../models/commentModel';

export interface IPopulatedCommentUser {
  _id: string;
  name: string;
  email: string;
}

export interface IPopulatedCommentFile {
  _id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string;
  size: number;
  uploadedBy: IPopulatedCommentUser;
}

export interface ICommentResponse {
  _id: string;
  content: string;
  taskId: string;
  createdBy: IPopulatedCommentUser;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  files?: IPopulatedCommentFile[]; // ADD THIS
}

export interface ICommentFilters {
  taskId?: string;
  createdBy?: string;
}

export interface ICommentSortOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ICommentPaginationOptions {
  page?: number;
  limit?: number;
}

export interface IPaginatedComments {
  comments: ICommentResponse[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ICommentRepository extends IGenericRepository<IComment> {
  findAllWithFilters(
    filters: ICommentFilters,
    sortOptions: ICommentSortOptions,
    paginationOptions: ICommentPaginationOptions
  ): Promise<IPaginatedComments>;
  
  softDelete(id: string): Promise<IComment | null>;
  
  findByIdWithPopulate(id: string): Promise<IComment | null>;
  
  findByTaskIdWithPopulate(
    taskId: string, 
    paginationOptions: ICommentPaginationOptions
  ): Promise<IPaginatedComments>;
}