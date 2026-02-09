// types/interface/taskInterface.ts

// Replace enums with const objects for better TypeScript compatibility
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Create type aliases from the const objects
export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];
export type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority];

export interface IPopulatedUser {
  _id: string;
  name: string;
  email: string;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatusType;
  priority: TaskPriorityType;
  dueDate?: Date | string;
  tags?: string[];
  assignedTo?: IPopulatedUser;
  createdBy: IPopulatedUser;
  isDeleted: boolean;
  deletedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IPaginatedTasks {
  tasks: ITask[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ICreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  dueDate?: Date | string;
  tags?: string[];
  assignedTo?: string;
}

export interface IUpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  dueDate?: Date | string;
  tags?: string[];
  assignedTo?: string;
}

export interface IGetTasksQueryParams {
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  assignedTo?: string;
  tags?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IBulkCreateTasksDTO {
  tasks: ICreateTaskDTO[];
}

export interface TaskApiResponse<T = ITask | IPaginatedTasks | ITask[] | null> {
  success: boolean;
  message: string;
  data: T;
}