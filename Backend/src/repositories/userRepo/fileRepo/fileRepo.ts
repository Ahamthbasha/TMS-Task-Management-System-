// src/repositories/fileRepo/fileRepo.ts
import { File, IFile } from '../../../models/fileModel';
import { GenericRepository } from '../../genericRepo/genericRepo';
import { IFileRepository } from './IFileRepo';
import { Types } from 'mongoose';

export class FileRepository
  extends GenericRepository<IFile>
  implements IFileRepository
{
  constructor() {
    super(File);
  }

  async getTaskFiles(taskId: string): Promise<IFile[]> {
    return this.model
      .find({ 
        task: new Types.ObjectId(taskId),
        isDeleted: false 
      })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getCommentFiles(commentId: string): Promise<IFile[]> {
    return this.model
      .find({ 
        comment: new Types.ObjectId(commentId),
        isDeleted: false 
      })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserFiles(userId: string): Promise<IFile[]> {
    return this.model
      .find({ 
        uploadedBy: new Types.ObjectId(userId),
        isDeleted: false 
      })
      .populate('task', 'title')
      .populate('comment', 'content')
      .sort({ createdAt: -1 })
      .exec();
  }

  async softDelete(id: string): Promise<IFile | null> {
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

  async deleteTaskFiles(taskId: string): Promise<void> {
    await this.model.updateMany(
      { task: new Types.ObjectId(taskId) },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    );
  }

  async deleteCommentFiles(commentId: string): Promise<void> {
    await this.model.updateMany(
      { comment: new Types.ObjectId(commentId) },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    );
  }
}