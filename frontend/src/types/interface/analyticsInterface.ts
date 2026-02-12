
export const TimeRange = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  CUSTOM: 'custom'
} as const;

export type TimeRange = typeof TimeRange[keyof typeof TimeRange];

export interface IStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface IPriorityCount {
  priority: string;
  count: number;
  percentage: number;
}

export interface ITaskOverviewStats {
  totalTasks: number;
  tasksByStatus: IStatusCount[];
  tasksByPriority: IPriorityCount[];
  overdueTasks: number;
  upcomingTasks: number;
  noDueDateTasks: number;
  completionRate: number;
  averageCompletionTime: number;
}

export interface IUserPerformanceMetric {
  userId: string;
  userName: string;
  userEmail: string;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  totalTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  overdueTasks: number;
}

export interface ITaskTrendPoint {
  date: string;
  count: number;
  completed?: number;
  inProgress?: number;
  todo?: number;
}

export interface IExportTasksData {
  format: 'json' | 'csv' | 'excel';
  filename: string;
  generatedAt: Date;
  totalCount: number;
}

export interface AnalyticsApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ITaskTrendsQueryParams {
  timeRange?: TimeRange;
  startDate?: string;
  endDate?: string;
}