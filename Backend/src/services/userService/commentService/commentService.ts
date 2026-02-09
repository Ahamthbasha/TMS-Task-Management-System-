// services/commentService.ts
import { Types } from 'mongoose';
import { ICommentRepository } from '../../../repositories/userRepo/commentRepo/ICommentRepo'; 
import { IUserRepository } from '../../../repositories/userRepo/userAuthRepo/IuserAuthRepo';
import { ITaskRepository } from '../../../repositories/userRepo/taskRepo/IUserTaskRepo'; 
import { IComment } from '../../../models/commentModel';
import {
  ICommentService,
  ICreateCommentDTO,
  IUpdateCommentDTO,
} from './ICommentService';
import { IPaginatedComments } from '../../../repositories/userRepo/commentRepo/ICommentRepo';
import { AppError } from '../../../utils/errorUtil/appError';

export class CommentService implements ICommentService {
  constructor(
    private commentRepository: ICommentRepository,
    private taskRepository: ITaskRepository,
    private userRepository: IUserRepository
  ) {}

  async createComment(data: ICreateCommentDTO, userId: string): Promise<IComment> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(data.taskId)) {
      throw new AppError('Invalid task ID format', 400);
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    const task = await this.taskRepository.findByIdWithPopulate(data.taskId);
    if (!task || task.isDeleted) {
      throw new AppError('Task not found', 404);
    }

    const isOwner = task.createdBy._id.toString() === userId;
    const isAssigned = task.assignedTo && task.assignedTo._id.toString() === userId;
    
    if (!isOwner && !isAssigned) {
      throw new AppError('You do not have access to this task', 403);
    }

    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 400);
    }

    const comment = await this.commentRepository.create({
      content: data.content,
      taskId: new Types.ObjectId(data.taskId),
      createdBy: new Types.ObjectId(userId),
    } as Partial<IComment>);

    return comment;
  }

  async getCommentsByTaskId(
    taskId: string,
    userId: string,
    page?: number,
    limit?: number
  ): Promise<IPaginatedComments> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(taskId)) {
      throw new AppError('Invalid task ID format', 400);
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    const task = await this.taskRepository.findByIdWithPopulate(taskId);
    if (!task || task.isDeleted) {
      throw new AppError('Task not found', 404);
    }

    const isOwner = task.createdBy._id.toString() === userId;
    const isAssigned = task.assignedTo && task.assignedTo._id.toString() === userId;
    
    if (!isOwner && !isAssigned) {
      throw new AppError('You do not have access to this task', 403);
    }

    const paginationOptions = {
      page: page || 1,
      limit: limit || 20,
    };

    return this.commentRepository.findByTaskIdWithPopulate(
      taskId,
      paginationOptions
    );
  }

  async getCommentById(commentId: string): Promise<IComment> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(commentId)) {
      throw new AppError('Invalid comment ID format', 400);
    }

    const comment = await this.commentRepository.findByIdWithPopulate(commentId);

    if (!comment || comment.isDeleted) {
      throw new AppError('Comment not found', 404);
    }

    return comment;
  }

  async updateComment(
    commentId: string,
    data: IUpdateCommentDTO,
    userId: string
  ): Promise<IComment> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(commentId)) {
      throw new AppError('Invalid comment ID format', 400);
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    const comment = await this.commentRepository.findByIdWithPopulate(commentId);

    if (!comment || comment.isDeleted) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.createdBy._id.toString() !== userId) {
      throw new AppError('You do not have permission to update this comment', 403);
    }

    const task = await this.taskRepository.findByIdWithPopulate(comment.taskId.toString());
    const isTaskOwner = task?.createdBy._id.toString() === userId;
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (comment.createdAt < twentyFourHoursAgo && !isTaskOwner) {
      throw new AppError('Cannot update comments older than 24 hours', 400);
    }

    const updatedComment = await this.commentRepository.update(commentId, {
      content: data.content,
    });

    if (!updatedComment) {
      throw new AppError('Failed to update comment', 500);
    }

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(commentId)) {
      throw new AppError('Invalid comment ID format', 400);
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    const comment = await this.commentRepository.findByIdWithPopulate(commentId);

    if (!comment || comment.isDeleted) {
      throw new AppError('Comment not found', 404);
    }

    const task = await this.taskRepository.findByIdWithPopulate(comment.taskId.toString());
    const isTaskOwner = task?.createdBy._id.toString() === userId;
    const isCommentOwner = comment.createdBy._id.toString() === userId;
    
    if (!isTaskOwner && !isCommentOwner) {
      throw new AppError('You do not have permission to delete this comment', 403);
    }

    await this.commentRepository.softDelete(commentId);
  }
}