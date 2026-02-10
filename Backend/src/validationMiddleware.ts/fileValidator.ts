// src/validators/fileValidator.ts
import { body, param } from 'express-validator';

export const uploadFileValidation = [
  body('taskId')
    .optional()
    .isMongoId()
    .withMessage('Invalid task ID'),
    
  body('commentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid comment ID'),
    
  body()
    .custom((value, { req }) => {
      if (!req.body.taskId && !req.body.commentId) {
        throw new Error('Either taskId or commentId must be provided');
      }
      if (req.body.taskId && req.body.commentId) {
        throw new Error('Cannot provide both taskId and commentId');
      }
      return true;
    }),
];

export const fileIdValidation = [
  param('fileId')
    .isMongoId()
    .withMessage('Invalid file ID'),
];

export const taskIdValidation = [
  param('taskId')
    .isMongoId()
    .withMessage('Invalid task ID'),
];

export const commentIdValidation = [
  param('commentId')
    .isMongoId()
    .withMessage('Invalid comment ID'),
];