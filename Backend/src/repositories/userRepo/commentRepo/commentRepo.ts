import { Comment, IComment } from '../../../models/commentModel';
import { GenericRepository } from '../../genericRepo/genericRepo';
import {
  ICommentRepository,
  ICommentFilters,
  ICommentSortOptions,
  ICommentPaginationOptions,
  IPaginatedComments,
  ICommentResponse,
  IPopulatedCommentUser,
} from './ICommentRepo';
import { QueryFilter, SortOrder } from 'mongoose';

export class CommentRepository
  extends GenericRepository<IComment>
  implements ICommentRepository
{
  constructor() {
    super(Comment);
  }

  async findAllWithFilters(
    filters: ICommentFilters,
    sortOptions: ICommentSortOptions,
    paginationOptions: ICommentPaginationOptions
  ): Promise<IPaginatedComments> {
    const { taskId, createdBy } = filters;
    const { sortBy = 'createdAt', sortOrder = 'desc' } = sortOptions;
    const { page = 1, limit = 20 } = paginationOptions;

    const query: QueryFilter<IComment> = { isDeleted: false };

    if (taskId) {
      query.taskId = taskId;
    }

    if (createdBy) {
      query.createdBy = createdBy;
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [commentsData, total] = await Promise.all([
      this.model
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean()
        .exec(),
      this.model.countDocuments(query),
    ]);

    const comments: ICommentResponse[] = commentsData.map((comment) => ({
      _id: comment._id.toString(),
      content: comment.content,
      taskId: comment.taskId.toString(),
      createdBy: {
        _id: (comment.createdBy as unknown as IPopulatedCommentUser)._id,
        name: (comment.createdBy as unknown as IPopulatedCommentUser).name,
        email: (comment.createdBy as unknown as IPopulatedCommentUser).email,
      },
      isDeleted: comment.isDeleted,
      deletedAt: comment.deletedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      comments,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async softDelete(id: string): Promise<IComment | null> {
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

  async findByIdWithPopulate(id: string): Promise<IComment | null> {
    return this.model
      .findOne({ _id: id, isDeleted: false })
      .populate('createdBy', 'name email')
      .exec();
  }

  async findByTaskIdWithPopulate(
  taskId: string,
  paginationOptions: ICommentPaginationOptions
): Promise<IPaginatedComments> {
  const { page = 1, limit = 20 } = paginationOptions;

  const query: QueryFilter<IComment> = {
    taskId,
    isDeleted: false,
  };

  const skip = (page - 1) * limit;
  
  // CHANGED: Sort by createdAt ascending (oldest first)
  const sort: Record<string, SortOrder> = {
    createdAt: 1  // Changed from -1 to 1 for ascending order
  };

  const [commentsData, total] = await Promise.all([
    this.model
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean()
      .exec(),
    this.model.countDocuments(query),
  ]);

  const comments: ICommentResponse[] = commentsData.map((comment) => ({
    _id: comment._id.toString(),
    content: comment.content,
    taskId: comment.taskId.toString(),
    createdBy: {
      _id: (comment.createdBy as unknown as IPopulatedCommentUser)._id,
      name: (comment.createdBy as unknown as IPopulatedCommentUser).name,
      email: (comment.createdBy as unknown as IPopulatedCommentUser).email,
    },
    isDeleted: comment.isDeleted,
    deletedAt: comment.deletedAt,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    comments,
    total,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
}