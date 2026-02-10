// src/services/fileService/IFileService.ts - Updated
import { IFile } from '../../../models/fileModel';

export interface IUploadFileDTO {
  file: Express.Multer.File;
  taskId?: string;
  commentId?: string;
  userId: string;
  multerFilename?: string;
}

export interface IFileService {
  uploadFile(data: IUploadFileDTO): Promise<IFile>;
  getFile(fileId: string, userId: string): Promise<IFile>;
  getTaskFiles(taskId: string, userId: string): Promise<IFile[]>;
  getCommentFiles(commentId: string, userId: string): Promise<IFile[]>;
  deleteFile(fileId: string, userId: string): Promise<void>;
  getAllTaskFiles(taskId: string, userId: string): Promise<IFile[]>;
  getFileForDownload(fileId: string, userId: string): Promise<{ file: IFile, filePath: string }>; // NEW METHOD
}