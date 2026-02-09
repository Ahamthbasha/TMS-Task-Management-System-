// src/repositories/taskRepo/taskRepo.ts
import { Task, ITask } from '../../../models/taskModel';
import { GenericRepository } from '../../genericRepo/genericRepo';
import {
  ITaskRepository,
  ITaskFilters,
  ITaskSortOptions,
  ITaskPaginationOptions,
  IPaginatedTasks,
  ITaskResponse,
} from './IUserTaskRepo';
import { QueryFilter, SortOrder } from 'mongoose';

export class TaskRepository
  extends GenericRepository<ITask>
  implements ITaskRepository
{
  constructor() {
    super(Task);
  }

  async findAllWithFilters(
    filters: ITaskFilters & {$or ? : any[]},
    sortOptions: ITaskSortOptions,
    paginationOptions: ITaskPaginationOptions
  ): Promise<IPaginatedTasks> {
    const {
      status,
      priority,
      assignedTo,
      createdBy,
      tags,
      dueDateFrom,
      dueDateTo,
      search,
      $or,
    } = filters;

    const { sortBy = 'createdAt', sortOrder = 'desc' } = sortOptions;
    const { page = 1, limit = 10 } = paginationOptions;

    // Build query with proper typing
    const query: QueryFilter<ITask> = { isDeleted: false };

    if($or){
      query.$or = $or
    }
    else if(createdBy){
      query.createdBy = createdBy
    }
    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (createdBy) {
      query.createdBy = createdBy;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Due date range filter
    if (dueDateFrom || dueDateTo) {
      query.dueDate = {};
      if (dueDateFrom) {
        query.dueDate.$gte = dueDateFrom;
      }
      if (dueDateTo) {
        query.dueDate.$lte = dueDateTo;
      }
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object with proper typing
    const sort: Record<string, SortOrder> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [tasksData, total] = await Promise.all([
      this.model
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .lean()
        .exec(),
      this.model.countDocuments(query),
    ]);

    // Map the lean results to ITaskResponse type
    const tasks: ITaskResponse[] = tasksData.map((task) => ({
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags,
      assignedTo: task.assignedTo
        ? {
            _id: (task.assignedTo as unknown as { _id: string; name: string; email: string })._id,
            name: (task.assignedTo as unknown as { _id: string; name: string; email: string }).name,
            email: (task.assignedTo as unknown as { _id: string; name: string; email: string }).email,
          }
        : undefined,
      createdBy: {
        _id: (task.createdBy as unknown as { _id: string; name: string; email: string })._id,
        name: (task.createdBy as unknown as { _id: string; name: string; email: string }).name,
        email: (task.createdBy as unknown as { _id: string; name: string; email: string }).email,
      },
      isDeleted: task.isDeleted,
      deletedAt: task.deletedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      tasks,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async softDelete(id: string): Promise<ITask | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        { new: true }
      )
      .exec();
  }

  async bulkCreate(tasks: Partial<ITask>[]): Promise<ITask[]> {
    const createdTasks = await this.model.insertMany(tasks);
    // Cast the result to ITask[] since insertMany returns Document[] which extends ITask
    return createdTasks as unknown as ITask[];
  }

  async findByIdWithPopulate(id: string): Promise<ITask | null> {
    return this.model
      .findOne({ _id: id, isDeleted: false })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .exec();
  }
}