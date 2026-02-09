// src/controllers/fileController/IFileController.ts
import { AuthRequest } from '../../../middlewares/authMiddleware';
import { Response, NextFunction } from 'express';

export interface IFileController {
  uploadFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getTaskFiles(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getCommentFiles(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getAllTaskFiles(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  deleteFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}