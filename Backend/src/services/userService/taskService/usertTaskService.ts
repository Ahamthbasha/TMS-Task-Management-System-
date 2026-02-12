
import { ITaskRepository } from '../../../repositories/userRepo/taskRepo/IUserTaskRepo';
import { IUserRepository } from '../../../repositories/userRepo/userAuthRepo/IuserAuthRepo';
import { ITask } from '../../../models/taskModel';
import {
  ITaskService,
  ICreateTaskDTO,
  IUpdateTaskDTO,
  IGetTasksQueryDTO,
} from './IUserTaskService';
import { AppError } from '../../../utils/errorUtil/appError';
import { IPaginatedTasks } from '../../../repositories/userRepo/taskRepo/IUserTaskRepo';
import { Types } from 'mongoose';

export class TaskService implements ITaskService {
  constructor(
    private taskRepository: ITaskRepository,
    private userRepository: IUserRepository
  ) {}

  async createTask(data: ICreateTaskDTO, userId: string): Promise<ITask> {
    // Validate assigned user if provided
    if (data.assignedTo) {
      const assignedUser = await this.userRepository.findById(data.assignedTo);
      if (!assignedUser || !assignedUser.isActive) {
        throw new AppError('Assigned user not found or inactive', 400);
      }
    }

    // Validate due date
    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      throw new AppError('Due date cannot be in the past', 400);
    }

    const task = await this.taskRepository.create({
      ...data,
      createdBy: new Types.ObjectId(userId),
      assignedTo: data.assignedTo ? new Types.ObjectId(data.assignedTo) : undefined,
    } as Partial<ITask>);

    return task;
  }

  async getTasks(
  query: IGetTasksQueryDTO,
  userId: string
): Promise<IPaginatedTasks> {
  const {
    status,
    priority,
    assignedTo,
    tags,
    dueDateFrom,
    dueDateTo,
    search,
    sortBy,
    sortOrder,
    page,
    limit,
  } = query;

  // Parse dates
  const parsedDueDateFrom = dueDateFrom ? new Date(dueDateFrom) : undefined;
  const parsedDueDateTo = dueDateTo ? new Date(dueDateTo) : undefined;

  // **IMPORTANT CHANGE**: Show tasks where user is either creator OR assigned
  const filters = {
    status,
    priority,
    assignedTo: assignedTo || undefined, // Keep if filtering by assignedTo
    // Remove createdBy filter and use $or instead
    $or: [
      { createdBy: userId },
      { assignedTo: userId }
    ],
    tags,
    dueDateFrom: parsedDueDateFrom,
    dueDateTo: parsedDueDateTo,
    search,
  };

  const sortOptions = {
    sortBy,
    sortOrder,
  };

  const paginationOptions = {
    page,
    limit,
  };

  return this.taskRepository.findAllWithFilters(
    filters,
    sortOptions,
    paginationOptions
  );
}

  async getTaskById(taskId: string, userId: string): Promise<ITask> {
  const task = await this.taskRepository.findByIdWithPopulate(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const isOwner = task.createdBy._id.toString() === userId;
  const isAssigned = task.assignedTo && task.assignedTo._id.toString() === userId;
  
  if (!isOwner && !isAssigned) {
    throw new AppError('You do not have access to this task', 403);
  }

  return task;
}

async updateTask(
  taskId: string,
  data: IUpdateTaskDTO,
  userId: string
): Promise<ITask> {
  const task = await this.taskRepository.findByIdWithPopulate(taskId);

  if (!task || task.isDeleted) {
    throw new AppError('Task not found', 404);
  }

  const isOwner = task.createdBy._id.toString() === userId;
  const isAssigned = task.assignedTo && task.assignedTo._id.toString() === userId;

  // Check if user has any access
  if (!isOwner && !isAssigned) {
    throw new AppError('You do not have access to this task', 403);
  }

  // **Permission-based update logic**
  if (isOwner) {
    // Owner can update everything
    // Proceed with full update
  } else if (isAssigned) {
    // Assigned user can only update status
    const allowedUpdates = ['status'];
    const attemptedUpdates = Object.keys(data);
    
    const hasUnauthorizedUpdate = attemptedUpdates.some(
      key => !allowedUpdates.includes(key)
    );
    
    if (hasUnauthorizedUpdate) {
      throw new AppError('Assigned users can only update task status', 403);
    }
  }

  // Validate assigned user if provided (only owner can reassign)
  if (data.assignedTo) {
    if (!isOwner) {
      throw new AppError('Only task owner can reassign tasks', 403);
    }
    
    const assignedUser = await this.userRepository.findById(data.assignedTo);
    if (!assignedUser || !assignedUser.isActive) {
      throw new AppError('Assigned user not found or inactive', 400);
    }
  }

  // Validate due date
  if (data.dueDate && new Date(data.dueDate) < new Date()) {
    throw new AppError('Due date cannot be in the past', 400);
  }

  // Prepare update data
  const updateData: any = { ...data };
  if (data.assignedTo) {
    updateData.assignedTo = new Types.ObjectId(data.assignedTo);
  }

  const updatedTask = await this.taskRepository.update(taskId, updateData);

  if (!updatedTask) {
    throw new AppError('Failed to update task', 500);
  }

  return updatedTask;
}

  async deleteTask(taskId: string, userId: string): Promise<void> {
  const task = await this.taskRepository.findById(taskId);

  if (!task || task.isDeleted) {
    throw new AppError('Task not found', 404);
  }

  // Only owner can delete the task
  if (task.createdBy.toString() !== userId) {
    throw new AppError('Only task owner can delete the task', 403);
  }

  await this.taskRepository.softDelete(taskId);
}

  async bulkCreateTasks(
    tasks: ICreateTaskDTO[],
    userId: string
  ): Promise<ITask[]> {
    if (!tasks || tasks.length === 0) {
      throw new AppError('No tasks provided', 400);
    }

    if (tasks.length > 100) {
      throw new AppError('Cannot create more than 100 tasks at once', 400);
    }

    // Validate all tasks
    for (const task of tasks) {
      if (!task.title || task.title.trim().length < 3) {
        throw new AppError('All tasks must have a valid title', 400);
      }

      if (task.assignedTo) {
        const assignedUser = await this.userRepository.findById(
          task.assignedTo
        );
        if (!assignedUser || !assignedUser.isActive) {
          throw new AppError(
            `Assigned user ${task.assignedTo} not found or inactive`,
            400
          );
        }
      }

      if (task.dueDate && new Date(task.dueDate) < new Date()) {
        throw new AppError('Due date cannot be in the past', 400);
      }
    }

    // Add createdBy to all tasks with proper ObjectId conversion
    const tasksWithCreator = tasks.map((task) => ({
      ...task,
      createdBy: new Types.ObjectId(userId),
      assignedTo: task.assignedTo ? new Types.ObjectId(task.assignedTo) : undefined,
    })) as Partial<ITask>[];

    return this.taskRepository.bulkCreate(tasksWithCreator);
  }
}