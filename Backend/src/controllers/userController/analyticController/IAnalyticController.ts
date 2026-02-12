// src/controllers/userController/analyticController/IAnalyticController.ts
import { AuthRequest } from '../../../middlewares/authMiddleware';
import { Response, NextFunction } from 'express';

export interface IAnalyticsController {
  getTaskOverviewStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getUserPerformanceMetrics(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getTaskTrendsOverTime(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  exportTasksData(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  downloadExportedFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}