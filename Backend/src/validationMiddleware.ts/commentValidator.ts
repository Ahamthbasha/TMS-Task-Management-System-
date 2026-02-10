// validationMiddleware/commentValidator.ts
import { body, param, query } from 'express-validator';
import { Types } from 'mongoose';

// Custom validator for MongoDB ObjectId
const isValidObjectId = (value: string) => {
  return Types.ObjectId.isValid(value);
};

export const createCommentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
  
  body('taskId')
    .trim()
    .notEmpty()
    .withMessage('Task ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid task ID format'),
];

export const updateCommentValidation = [
  param('commentId')
    .trim()
    .notEmpty()
    .withMessage('Comment ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid comment ID format'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
];

export const deleteCommentValidation = [
  param('commentId')
    .trim()
    .notEmpty()
    .withMessage('Comment ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid comment ID format'),
];

export const getCommentsValidation = [
  param('taskId')
    .trim()
    .notEmpty()
    .withMessage('Task ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid task ID format'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];