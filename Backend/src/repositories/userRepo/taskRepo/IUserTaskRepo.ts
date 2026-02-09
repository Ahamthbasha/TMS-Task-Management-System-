// src/repositories/taskRepo/ITaskRepo.ts
import { IGenericRepository } from '../../genericRepo/interface/IGenericRepo';
import { ITask, TaskStatus, TaskPriority } from '../../../models/taskModel';

export interface ITaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  createdBy?: string;
  tags?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
}

export interface ITaskSortOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ITaskPaginationOptions {
  page?: number;
  limit?: number;
}

export interface IPopulatedUser {
  _id: string;
  name: string;
  email: string;
}

export interface ITaskResponse {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags?: string[];
  assignedTo?: IPopulatedUser;
  createdBy: IPopulatedUser;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaginatedTasks {
  tasks: ITaskResponse[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ITaskRepository extends IGenericRepository<ITask> {
  findAllWithFilters(
    filters: ITaskFilters,
    sortOptions: ITaskSortOptions,
    paginationOptions: ITaskPaginationOptions
  ): Promise<IPaginatedTasks>;
  
  softDelete(id: string): Promise<ITask | null>;
  
  bulkCreate(tasks: Partial<ITask>[]): Promise<ITask[]>;
  
  findByIdWithPopulate(id: string): Promise<ITask | null>;
}