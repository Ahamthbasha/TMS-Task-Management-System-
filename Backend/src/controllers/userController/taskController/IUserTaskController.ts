// src/controllers/taskController/ITaskController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/authMiddleware';

export interface ITaskController {
  createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  
  getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  
  getTaskById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  
  updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  
  deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  
  bulkCreateTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}