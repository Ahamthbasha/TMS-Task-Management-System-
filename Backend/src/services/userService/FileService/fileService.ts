// src/services/userService/FileService/fileService.ts - Updated
import { IFile, FileType } from '../../../models/fileModel';
import { IFileRepository } from '../../../repositories/userRepo/fileRepo/IFileRepo';
import { IFileService, IUploadFileDTO } from './IFileService';
import { AppError } from '../../../utils/errorUtil/appError';
import { ITaskRepository } from '../../../repositories/userRepo/taskRepo/IUserTaskRepo';
import { ICommentRepository } from '../../../repositories/userRepo/commentRepo/ICommentRepo';
import { Types } from 'mongoose';
import path from 'path';

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
  const { file, taskId, commentId, userId, multerFilename } = data;

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

  // Use the filename from multer if provided, otherwise generate one
  let uniqueFilename: string;
  let storagePath: string;
  
  if (multerFilename) {
    // Use the filename that multer actually saved
    uniqueFilename = multerFilename;
    storagePath = `uploads/${uniqueFilename}`;
    
    console.log('Using multer filename:', uniqueFilename);
  } else {
    // Fallback: generate filename (shouldn't happen if multer is working)
    const timestamp = Date.now();
    const safeOriginalName = file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/gi, '');
    
    uniqueFilename = `${timestamp}-${safeOriginalName}`;
    storagePath = `uploads/${uniqueFilename}`;
    
    console.warn('WARNING: No multer filename provided, generated:', uniqueFilename);
  }

  // DEBUG: Log file info
  console.log('FileService - Uploading file:', {
    originalName: file.originalname,
    uniqueFilename,
    storagePath,
    size: file.size,
    mimetype: file.mimetype,
    hasMulterFilename: !!multerFilename
  });

  // Verify the file actually exists on disk
  const fs = await import('fs');
  const path = await import('path');
  
  const fileExists = fs.existsSync(storagePath);
  console.log('File exists on disk?', fileExists, 'at path:', storagePath);
  
  if (!fileExists) {
    // List files in uploads to see what's actually there
    const uploadsDir = 'uploads';
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log('Files in uploads directory:', files);
      
      // Try to find a matching file
      const matchingFile = files.find(f => 
        f.includes(file.originalname.replace(/\s/g, '_')) || 
        f.includes(uniqueFilename.substring(0, 13)) // First 13 chars of timestamp
      );
      
      if (matchingFile) {
        console.log('Found matching file:', matchingFile);
        uniqueFilename = matchingFile;
        storagePath = `uploads/${matchingFile}`;
      } else {
        throw new AppError('Uploaded file not found on server', 500);
      }
    }
  }

  // Create temporary fileUrl
  const tempFileUrl = `/api/files/temp/download`;

  // Create file data
  const fileData: Partial<IFile> = {
    filename: uniqueFilename, // Stored filename
    originalName: file.originalname, // Original filename
    fileUrl: tempFileUrl, // Temporary URL
    storagePath, // Physical storage path
    fileType: this.getFileType(file.mimetype),
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: new Types.ObjectId(userId),
    task: taskId ? new Types.ObjectId(taskId) : undefined,
    comment: commentId ? new Types.ObjectId(commentId) : undefined,
  };

  // Save file record to database
  const savedFile = await this.fileRepository.create(fileData);
  
  // Update fileUrl with actual file ID
  savedFile.fileUrl = `/api/files/${savedFile._id}/download`;
  await savedFile.save();
  
  console.log('File saved to database:', {
    id: savedFile._id,
    filename: savedFile.filename,
    storagePath: savedFile.storagePath,
    fileUrl: savedFile.fileUrl
  });
  
  return savedFile;
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

    // Delete physical file from storage
    const fs = await import('fs');
    const path = await import('path');
    
    if (fs.existsSync(file.storagePath)) {
      fs.unlinkSync(file.storagePath);
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



async getFileForDownload(fileId: string, userId: string): Promise<{ file: IFile, filePath: string }> {
  const file = await this.getFile(fileId, userId);
  
  const fs = await import('fs');
  const path = await import('path');
  const os = await import('os');
  
  // Normalize the path to handle both forward and backward slashes
  const normalizedPath = file.storagePath.replace(/\\/g, '/');
  
  console.log('=== DEBUG: File Download ===');
  console.log('File ID:', fileId);
  console.log('Storage path from DB:', file.storagePath);
  console.log('Normalized path:', normalizedPath);
  console.log('Current directory:', process.cwd());
  console.log('Platform:', os.platform());
  
  // Try different path combinations
  const possiblePaths = [
    // Try as is
    normalizedPath,
    // Try with current directory
    path.join(process.cwd(), normalizedPath),
    // Try relative path
    `./${normalizedPath}`,
    // Try with absolute path
    path.resolve(normalizedPath),
    // Try with different slashes (for Windows)
    file.storagePath.replace(/\//g, '\\'),
    // Try original path
    file.storagePath,
  ];
  
  console.log('Checking possible paths:');
  for (const possiblePath of possiblePaths) {
    const exists = fs.existsSync(possiblePath);
    console.log(`- ${possiblePath}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
    if (exists) {
      console.log('Found file at:', possiblePath);
      return { file, filePath: possiblePath };
    }
  }
  
  // List files in uploads directory to debug
  const uploadsDir = 'uploads';
  if (fs.existsSync(uploadsDir)) {
    console.log(`Files in ${uploadsDir} directory:`);
    try {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(f => console.log(`  - ${f}`));
    } catch (error) {
      console.log('Cannot read uploads directory:', error);
    }
  } else {
    console.log(`Directory ${uploadsDir} does not exist`);
  }
  
  throw new AppError('File not found on server', 404);
}

}