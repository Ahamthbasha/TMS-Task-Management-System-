// src/controllers/fileController/fileController.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/authMiddleware';
import { IFileService } from '../../../services/userService/FileService/IFileService'; 
import { IFileController } from './IFileController';

export class FileController implements IFileController {
  constructor(private fileService: IFileService) {}

  uploadFile = async (
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

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const { taskId, commentId } = req.body;
      
      if (!taskId && !commentId) {
        res.status(400).json({
          success: false,
          message: 'Either taskId or commentId must be provided',
        });
        return;
      }

      const file = await this.fileService.uploadFile({
        file: req.file,
        taskId,
        commentId,
        userId: req.user.userId,
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: file,
      });
    } catch (error) {
      next(error);
    }
  };

  getFile = async (
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

      const fileId = Array.isArray(req.params.id) 
        ? req.params.id[0] 
        : req.params.id;

      const file = await this.fileService.getFile(fileId, req.user.userId);

      // For download, you can redirect to the actual file URL or serve it
      // This depends on your storage setup
      res.status(200).json({
        success: true,
        message: 'File retrieved successfully',
        data: {
          ...file.toObject(),
          downloadUrl: `/api/files/${fileId}/download`, // Separate endpoint for actual file download
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getTaskFiles = async (
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

      const taskId = Array.isArray(req.params.taskId) 
        ? req.params.taskId[0] 
        : req.params.taskId;

      const files = await this.fileService.getTaskFiles(taskId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Task files retrieved successfully',
        data: files,
      });
    } catch (error) {
      next(error);
    }
  };

  getCommentFiles = async (
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

      const commentId = Array.isArray(req.params.commentId) 
        ? req.params.commentId[0] 
        : req.params.commentId;

      const files = await this.fileService.getCommentFiles(commentId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Comment files retrieved successfully',
        data: files,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllTaskFiles = async (
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

      const taskId = Array.isArray(req.params.taskId) 
        ? req.params.taskId[0] 
        : req.params.taskId;

      const files = await this.fileService.getAllTaskFiles(taskId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'All task files retrieved successfully',
        data: files,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteFile = async (
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

      const fileId = Array.isArray(req.params.id) 
        ? req.params.id[0] 
        : req.params.id;

      await this.fileService.deleteFile(fileId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  downloadFile = async (
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

      const fileId = Array.isArray(req.params.id) 
        ? req.params.id[0] 
        : req.params.id;

      const file = await this.fileService.getFile(fileId, req.user.userId);

      // In production, this would redirect to cloud storage signed URL
      // For local development, serve the file directly
      res.download(file.fileUrl, file.originalName);
    } catch (error) {
      next(error);
    }
  };
}