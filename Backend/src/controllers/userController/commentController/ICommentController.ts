import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/authMiddleware';

export interface ICommentController {
  createComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  
  getCommentsByTaskId(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  
  getCommentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  
  updateComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  
  deleteComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}