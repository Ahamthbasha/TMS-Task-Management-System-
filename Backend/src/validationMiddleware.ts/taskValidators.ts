// src/validators/taskValidator.ts
import { body, query } from 'express-validator';
import { TaskStatus, TaskPriority } from '../models/taskModel';

export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid task status'),

  body('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Invalid task priority'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),

  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string'),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid task status'),

  body('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Invalid task priority'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),

  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string'),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const bulkCreateTasksValidation = [
  body('tasks')
    .isArray({ min: 1, max: 100 })
    .withMessage('Tasks must be an array with 1 to 100 items'),

  body('tasks.*.title')
    .trim()
    .notEmpty()
    .withMessage('Each task must have a title')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('tasks.*.description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  body('tasks.*.status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid task status'),

  body('tasks.*.priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Invalid task priority'),

  body('tasks.*.dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  body('tasks.*.tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),

  body('tasks.*.assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const getTasksQueryValidation = [
  query('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid task status'),

  query('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Invalid task priority'),

  query('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),

  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string'),

  query('dueDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dueDateFrom'),

  query('dueDateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dueDateTo'),

  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),

  query('sortBy')
    .optional()
    .isIn(['title', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];