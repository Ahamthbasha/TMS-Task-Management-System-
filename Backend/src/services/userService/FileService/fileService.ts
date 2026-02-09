// src/services/userService/FileService/fileService.ts
import { IFile,FileType } from '../../../models/fileModel';
import { IFileRepository } from '../../../repositories/userRepo/fileRepo/IFileRepo'; 
import { IFileService, IUploadFileDTO } from './IFileService';
import { AppError } from '../../../utils/errorUtil/appError'; 
import { ITaskRepository } from '../../../repositories/userRepo/taskRepo/IUserTaskRepo'; 
import { ICommentRepository } from '../../../repositories/userRepo/commentRepo/ICommentRepo';  
import { Types } from 'mongoose';

export class FileService implements IFileService {
  constructor(
    private fileRepository: IFileRepository,
    private taskRepository: ITaskRepository,
    private commentRepository: ICommentRepository
  ) {}

  private getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType === 'application/pdf') return FileType.PDF;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileType.SPREADSHEET;
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return FileType.PRESENTATION;
    if (mimeType.includes('document') || mimeType.includes('word')) return FileType.DOCUMENT;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return FileType.ARCHIVE;
    return FileType.OTHER;
  }

  async uploadFile(data: IUploadFileDTO): Promise<IFile> {
    const { file, taskId, commentId, userId } = data;

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new AppError('File size exceeds 10MB limit', 400);
    }

    // Validate either taskId or commentId is provided
    if (!taskId && !commentId) {
      throw new AppError('Either taskId or commentId must be provided', 400);
    }

    // If taskId is provided, verify task exists and user has access
    if (taskId) {
      const task = await this.taskRepository.findByIdWithPopulate(taskId);
      if (!task || task.isDeleted) {
        throw new AppError('Task not found', 404);
      }
      
      // Check if user has access to task
      const hasAccess = 
        task.createdBy._id.toString() === userId ||
        (task.assignedTo && task.assignedTo._id.toString() === userId);
      
      if (!hasAccess) {
        throw new AppError('You do not have access to this task', 403);
      }
    }

    // If commentId is provided, verify comment exists and user has access
    if (commentId) {
      const comment = await this.commentRepository.findById(commentId);
      if (!comment || comment.isDeleted) {
        throw new AppError('Comment not found', 404);
      }
      
      // Get task to check access
      const task = await this.taskRepository.findByIdWithPopulate(comment.taskId.toString());
      if (!task) {
        throw new AppError('Associated task not found', 404);
      }
      
      // Check if user has access to task
      const hasAccess = 
        task.createdBy._id.toString() === userId ||
        (task.assignedTo && task.assignedTo._id.toString() === userId);
      
      if (!hasAccess) {
        throw new AppError('You do not have access to this task', 403);
      }
    }

    // Generate file URL (In production, this would be cloud storage URL)
    const fileUrl = `/uploads/${Date.now()}-${file.originalname}`;

    const fileData: Partial<IFile> = {
      filename: `${Date.now()}-${file.originalname}`,
      originalName: file.originalname,
      fileUrl,
      fileType: this.getFileType(file.mimetype),
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: new Types.ObjectId(userId),
      task: taskId ? new Types.ObjectId(taskId) : undefined,
      comment: commentId ? new Types.ObjectId(commentId) : undefined,
    };

    return this.fileRepository.create(fileData);
  }

  async getFile(fileId: string, userId: string): Promise<IFile> {
    const file = await this.fileRepository.findById(fileId);
    
    if (!file || file.isDeleted) {
      throw new AppError('File not found', 404);
    }

    // Check access based on whether file is attached to task or comment
    if (file.task) {
      const task = await this.taskRepository.findByIdWithPopulate(file.task.toString());
      if (!task) {
        throw new AppError('Associated task not found', 404);
      }
      
      const hasAccess = 
        task.createdBy._id.toString() === userId ||
        (task.assignedTo && task.assignedTo._id.toString() === userId);
      
      if (!hasAccess) {
        throw new AppError('You do not have access to this file', 403);
      }
    } else if (file.comment) {
      const comment = await this.commentRepository.findById(file.comment.toString());
      if (!comment) {
        throw new AppError('Associated comment not found', 404);
      }
      
      const task = await this.taskRepository.findByIdWithPopulate(comment.taskId.toString());
      if (!task) {
        throw new AppError('Associated task not found', 404);
      }
      
      const hasAccess = 
        task.createdBy._id.toString() === userId ||
        (task.assignedTo && task.assignedTo._id.toString() === userId);
      
      if (!hasAccess) {
        throw new AppError('You do not have access to this file', 403);
      }
    }

    return file;
  }

  async getTaskFiles(taskId: string, userId: string): Promise<IFile[]> {
    const task = await this.taskRepository.findByIdWithPopulate(taskId);
    if (!task || task.isDeleted) {
      throw new AppError('Task not found', 404);
    }

    const hasAccess = 
      task.createdBy._id.toString() === userId ||
      (task.assignedTo && task.assignedTo._id.toString() === userId);
    
    if (!hasAccess) {
      throw new AppError('You do not have access to this task', 403);
    }

    return this.fileRepository.getTaskFiles(taskId);
  }

  async getCommentFiles(commentId: string, userId: string): Promise<IFile[]> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment || comment.isDeleted) {
      throw new AppError('Comment not found', 404);
    }

    const task = await this.taskRepository.findByIdWithPopulate(comment.taskId.toString());
    if (!task) {
      throw new AppError('Associated task not found', 404);
    }

    const hasAccess = 
      task.createdBy._id.toString() === userId ||
      (task.assignedTo && task.assignedTo._id.toString() === userId);
    
    if (!hasAccess) {
      throw new AppError('You do not have access to this comment', 403);
    }

    return this.fileRepository.getCommentFiles(commentId);
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findById(fileId);
    
    if (!file || file.isDeleted) {
      throw new AppError('File not found', 404);
    }

    // Check if user uploaded the file or has task access
    if (file.uploadedBy.toString() !== userId) {
      if (file.task) {
        const task = await this.taskRepository.findByIdWithPopulate(file.task.toString());
        if (task?.createdBy._id.toString() !== userId) {
          throw new AppError('Only file uploader or task owner can delete file', 403);
        }
      } else if (file.comment) {
        // For comment files, check comment ownership
        const comment = await this.commentRepository.findById(file.comment.toString());
        if (comment?.createdBy.toString() !== userId) {
          const task = await this.taskRepository.findByIdWithPopulate(comment?.taskId.toString() || '');
          if (task?.createdBy._id.toString() !== userId) {
            throw new AppError('Only file uploader or task owner can delete file', 403);
          }
        }
      }
    }

    await this.fileRepository.softDelete(fileId);
  }

  async getAllTaskFiles(taskId: string, userId: string): Promise<IFile[]> {
    const task = await this.taskRepository.findByIdWithPopulate(taskId);
    if (!task || task.isDeleted) {
      throw new AppError('Task not found', 404);
    }

    const hasAccess = 
      task.createdBy._id.toString() === userId ||
      (task.assignedTo && task.assignedTo._id.toString() === userId);
    
    if (!hasAccess) {
      throw new AppError('You do not have access to this task', 403);
    }

    // Get both task-level and comment-level files
    const taskFiles = await this.fileRepository.getTaskFiles(taskId);
    
    // Get all comments for the task using find method
    const comments = await this.commentRepository.findAll({
      task: taskId,
      isDeleted: false,
    });
    
    // Get files for each comment
    const commentFilesPromises = comments.map((comment: any) => 
      this.fileRepository.getCommentFiles(comment._id.toString())
    );
    
    const commentFilesArrays = await Promise.all(commentFilesPromises);
    const commentFiles = commentFilesArrays.flat();

    return [...taskFiles, ...commentFiles].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}