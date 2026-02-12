// src/repositories/analyticsRepo/IAnalyticsRepo.ts
import { ITaskTrendPoint,IUserPerformanceMetric, ITaskOverviewStats } from '../../../models/analyticsModel';


export interface IAnalyticsRepository {
  // Task overview statistics
  getTaskOverviewStats(userId: string): Promise<ITaskOverviewStats>;
  
  // User performance metrics
  getUserPerformanceMetrics(userId?: string): Promise<IUserPerformanceMetric[]>;
  

getTaskTrendsOverTime(
  userId: string,
  startDate: Date,
  endDate: Date,
  groupBy: "day" | "week" | "month" | "day",
): Promise<ITaskTrendPoint[]>
  
  // Export tasks data
  getTasksForExport(
    userId: string,
    filters?: any,
    includeComments?: boolean,
    includeFiles?: boolean
  ): Promise<any[]>;
  
  // Additional analytics methods
  getTaskCompletionRate(userId: string, days?: number): Promise<number>;
  getAverageTaskCompletionTime(userId: string): Promise<number>;
  getOverdueTasksCount(userId: string): Promise<number>;
  getTasksByAssignee(userId: string): Promise<any[]>;
  getActivitySummary(userId: string, days?: number): Promise<any>;
}