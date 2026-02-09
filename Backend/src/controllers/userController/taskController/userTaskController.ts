// src/controllers/taskController/taskController.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/authMiddleware';
import { ITaskService, IGetTasksQueryDTO } from '../../../services/userService/taskService/IUserTaskService';
import { ITaskController } from './IUserTaskController';
import { TaskStatus, TaskPriority } from '../../../models/taskModel';

export class TaskController implements ITaskController {
  constructor(private taskService: ITaskService) {}

  createTask = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const task = await this.taskService.createTask(req.body, req.user.userId);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  getTasks = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const query: IGetTasksQueryDTO = {
        status: req.query.status as TaskStatus | undefined,
        priority: req.query.priority as TaskPriority | undefined,
        assignedTo: req.query.assignedTo as string | undefined,
        tags: req.query.tags
          ? (req.query.tags as string).split(',')
          : undefined,
        dueDateFrom: req.query.dueDateFrom as string | undefined,
        dueDateTo: req.query.dueDateTo as string | undefined,
        search: req.query.search as string | undefined,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      };

      const result = await this.taskService.getTasks(query, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {

      console.log(req.user)
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Handle req.params.id which can be string | string[]
      const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const task = await this.taskService.getTaskById(
        taskId,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Handle req.params.id which can be string | string[]
      const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const task = await this.taskService.updateTask(
        taskId,
        req.body,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Handle req.params.id which can be string | string[]
      const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      await this.taskService.deleteTask(taskId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  bulkCreateTasks = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const tasks = await this.taskService.bulkCreateTasks(
        req.body.tasks,
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: `${tasks.length} tasks created successfully`,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  };
}