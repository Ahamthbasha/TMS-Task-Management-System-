// src/controllers/fileController/fileController.ts - Updated
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/authMiddleware';
import { IFileService } from '../../../services/userService/FileService/IFileService';
import { IFileController } from './IFileController';
import fs from 'fs';
import path from 'path';

export class FileController implements IFileController {
  constructor(private fileService: IFileService) {}

  // uploadFile = async (
  //   req: AuthRequest,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> => {
  //   try {
  //     if (!req.user) {
  //       res.status(401).json({
  //         success: false,
  //         message: 'Unauthorized',
  //       });
  //       return;
  //     }

  //     if (!req.file) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'No file uploaded',
  //       });
  //       return;
  //     }

  //     const { taskId, commentId } = req.body;
      
  //     if (!taskId && !commentId) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'Either taskId or commentId must be provided',
  //       });
  //       return;
  //     }

  //     const file = await this.fileService.uploadFile({
  //       file: req.file,
  //       taskId,
  //       commentId,
  //       userId: req.user.userId,
  //     });

  //     res.status(201).json({
  //       success: true,
  //       message: 'File uploaded successfully',
  //       data: file,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

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

    // Get the actual filename saved by multer
    const multerFilename = req.multerFilenames?.[0]?.filename || req.file.filename;
    
    console.log('Controller: Multer saved file as:', multerFilename);
    console.log('Controller: req.file.filename:', req.file.filename);

    const file = await this.fileService.uploadFile({
      file: req.file,
      taskId,
      commentId,
      userId: req.user.userId,
      multerFilename: multerFilename // Pass the actual filename
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

      const fileId = Array.isArray(req.params.fileId) 
        ? req.params.fileId[0] 
        : req.params.fileId;

      const file = await this.fileService.getFile(fileId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'File retrieved successfully',
        data: {
          ...file.toObject(),
          downloadUrl: `/api/files/${fileId}/download`,
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

      const fileId = Array.isArray(req.params.fileId) 
        ? req.params.fileId[0] 
        : req.params.fileId;

      await this.fileService.deleteFile(fileId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      console.log("deleting file error", error);
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

      const fileId = Array.isArray(req.params.fileId) 
        ? req.params.fileId[0] 
        : req.params.fileId;

      const { file, filePath } = await this.fileService.getFileForDownload(fileId, req.user.userId);

      // Set appropriate headers
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
      res.setHeader('Content-Length', file.size.toString());

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        res.status(500).json({
          success: false,
          message: 'Error streaming file',
        });
      });

      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  };
}