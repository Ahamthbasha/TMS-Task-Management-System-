import { IComment } from '../../../models/commentModel';
import { IPaginatedComments } from '../../../repositories/userRepo/commentRepo/ICommentRepo';
 
export interface ICreateCommentDTO {
  content: string;
  taskId: string;
}

export interface IUpdateCommentDTO {
  content: string;
}

export interface ICommentService {
  createComment(data: ICreateCommentDTO, userId: string): Promise<IComment>;
  
  getCommentsByTaskId(
  taskId: string,
  userId: string, // Add userId parameter
  page?: number,
  limit?: number
): Promise<IPaginatedComments> 
  
  getCommentById(commentId: string): Promise<IComment>;
  
  updateComment(commentId: string, data: IUpdateCommentDTO, userId: string): Promise<IComment>;
  
  deleteComment(commentId: string, userId: string): Promise<void>;
}