// src/services/taskService/ITaskService.ts
import { ITask, TaskStatus, TaskPriority } from '../../../models/taskModel';
import { IPaginatedTasks } from '../../../repositories/userRepo/taskRepo/IUserTaskRepo'; 

export interface ICreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  tags?: string[];
  assignedTo?: string;
}

export interface IUpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  tags?: string[];
  assignedTo?: string;
}

export interface IGetTasksQueryDTO {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  tags?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ITaskService {
  createTask(data: ICreateTaskDTO, userId: string): Promise<ITask>;
  
  getTasks(query: IGetTasksQueryDTO, userId: string): Promise<IPaginatedTasks>;
  
  getTaskById(taskId: string, userId: string): Promise<ITask>;
  
  updateTask(taskId: string, data: IUpdateTaskDTO, userId: string): Promise<ITask>;
  
  deleteTask(taskId: string, userId: string): Promise<void>;
  
  bulkCreateTasks(tasks: ICreateTaskDTO[], userId: string): Promise<ITask[]>;
}