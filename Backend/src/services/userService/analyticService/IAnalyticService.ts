// src/services/analyticsService/IAnalyticsService.ts
import { 
  ITaskOverviewStats, 
  IUserPerformanceMetric, 
  ITaskTrendPoint, 
  IExportTasksData,
  IAnalyticsQueryDTO,
} from '../../../models/analyticsModel';
import { IGetTasksQueryDTO } from '../taskService/IUserTaskService';

export interface IExportTasksOptions {
  includeComments?: boolean;
  includeFiles?: boolean;
  format?: 'json' | 'csv' | 'excel';
}

export interface IAnalyticsService {
  // Task overview statistics
  getTaskOverviewStats(userId: string): Promise<ITaskOverviewStats>;
  
  // User performance metrics
  getUserPerformanceMetrics(userId?: string): Promise<IUserPerformanceMetric[]>;
  
  // Task trends over time
  getTaskTrendsOverTime(
    userId: string,
    query: IAnalyticsQueryDTO
  ): Promise<ITaskTrendPoint[]>;
  
  // Export tasks data
  exportTasksData(
    userId: string,
    filters: IGetTasksQueryDTO,
    options: IExportTasksOptions
  ): Promise<IExportTasksData>;
  
  // Additional analytics methods
  getDashboardStats(userId: string): Promise<any>;
  getActivitySummary(userId: string, days?: number): Promise<any>;
}