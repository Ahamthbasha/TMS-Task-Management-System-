// src/models/analyticsModel.ts
export enum TimeRange {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export interface ITaskTrendPoint {
  date: string;
  count: number;
  total?: number;
  todo?: number;
  inProgress?: number;
  completed?: number;
  cancelled?: number;
}

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

export interface IUserPerformanceMetric {
  userId: string;
  userName: string;
  userEmail: string;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  totalTasks: number;
  completionRate: number;
  averageCompletionTime: number; // in hours
  overdueTasks: number;
}

export interface ITaskOverviewStats {
  totalTasks: number;
  tasksByStatus: IStatusCount[];
  tasksByPriority: IPriorityCount[];
  overdueTasks: number;
  upcomingTasks: number; // due in next 7 days
  noDueDateTasks: number;
  completionRate: number;
  averageCompletionTime: number; // in hours
}

export interface IExportTasksData {
  tasks: any[];
  format: 'json' | 'csv' | 'excel';
  filename: string;
  generatedAt: Date;
  totalCount: number;
  filePath?: string;      // Add this
  mimeType?: string;      // Add this
  fileContent?: string | Buffer; // Add this
}

export interface IAnalyticsQueryDTO {
  timeRange?: TimeRange;
  startDate?: string;
  endDate?: string;
  userId?: string; // for filtering by specific user
}

// Extended export filters
export interface IExportFiltersDTO {
  status?: string;
  priority?: string;
  assignedTo?: string;
  tags?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}