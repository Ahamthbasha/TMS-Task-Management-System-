// src/repositories/fileRepo/IFileRepo.ts
import { IGenericRepository } from '../../genericRepo/interface/IGenericRepo';
import { IFile } from '../../../models/fileModel';

export interface IFileRepository extends IGenericRepository<IFile> {
  getTaskFiles(taskId: string): Promise<IFile[]>;
  getCommentFiles(commentId: string): Promise<IFile[]>;
  getUserFiles(userId: string): Promise<IFile[]>;
  softDelete(id: string): Promise<IFile | null>;
  deleteTaskFiles(taskId: string): Promise<void>;
  deleteCommentFiles(commentId: string): Promise<void>;
}