// controllers/commentController.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/authMiddleware';
import { ICommentService } from '../../../services/userService/commentService/ICommentService'; 
import { ICommentController } from './ICommentController';

export class CommentController implements ICommentController {
  constructor(private commentService: ICommentService) {}

  // Helper method to ensure param is string
  private getStringParam(param: string | string[] | undefined): string {
    if (Array.isArray(param)) {
      return param[0]; // Take first element if it's an array
    }
    return param || ''; // Return param or empty string
  }

  createComment = async (
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

      const comment = await this.commentService.createComment(
        req.body,
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  getCommentsByTaskId = async (
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

      const taskId = this.getStringParam(req.params.taskId);

      if (!taskId) {
        res.status(400).json({
          success: false,
          message: 'Task ID is required',
        });
        return;
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.commentService.getCommentsByTaskId(
        taskId,
        req.user.userId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        message: 'Comments retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCommentById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const commentId = this.getStringParam(req.params.id);

      if (!commentId) {
        res.status(400).json({
          success: false,
          message: 'Comment ID is required',
        });
        return;
      }

      const comment = await this.commentService.getCommentById(commentId);

      res.status(200).json({
        success: true,
        message: 'Comment retrieved successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  updateComment = async (
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

      const commentId = this.getStringParam(req.params.id);

    console.log("comment id", commentId);
    console.log("user id", req.user.userId); // ADD THIS
    console.log("user object", req.user);     // AND THIS
      if (!commentId) {
        res.status(400).json({
          success: false,
          message: 'Comment ID is required',
        });
        return;
      }

      const comment = await this.commentService.updateComment(
        commentId,
        req.body,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (
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

      const commentId = this.getStringParam(req.params.id);

      if (!commentId) {
        res.status(400).json({
          success: false,
          message: 'Comment ID is required',
        });
        return;
      }

      await this.commentService.deleteComment(commentId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}