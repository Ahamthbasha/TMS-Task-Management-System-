// src/validationMiddleware.ts/analyticsValidator.ts
import { query, param } from 'express-validator';
import { TimeRange } from '../models/analyticsModel';

export const taskTrendsValidation = [
  query('timeRange')
    .optional()
    .isIn(Object.values(TimeRange))
    .withMessage('Invalid time range. Must be today, week, month, quarter, year, or custom'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format. Use YYYY-MM-DD'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format. Use YYYY-MM-DD'),
  
  // Simplified custom validation without TypeScript errors
  query('timeRange').custom((value, { req }) => {
    if (value === TimeRange.CUSTOM) {
      const query = req.query as any;
      if (!query?.startDate || !query?.endDate) {
        throw new Error('Start date and end date are required for custom time range');
      }
    }
    return true;
  })
];

// Helper function for boolean validation
const isBooleanString = (value: any) => {
  return value === 'true' || value === 'false';
};

export const exportTasksValidation = [
  query('format')
    .optional()
    .isIn(['json', 'csv', 'excel'])
    .withMessage('Export format must be json, csv, or excel'),
  
  query('includeComments')
    .optional()
    .custom(isBooleanString)
    .withMessage('includeComments must be a boolean (true/false)'),
  
  query('includeFiles')
    .optional()
    .custom(isBooleanString)
    .withMessage('includeFiles must be a boolean (true/false)'),
  
  // Task filters
  query('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid task status'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid task priority'),
  
  query('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  query('dueDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid dueDateFrom format'),
  
  query('dueDateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid dueDateTo format'),
  
  query('createdAtFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid createdAtFrom format'),
  
  query('createdAtTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid createdAtTo format')
];

export const userPerformanceValidation = [
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format')
];

export const downloadFileValidation = [
  param('filename')
    .notEmpty()
    .withMessage('Filename is required')
    .isString()
    .withMessage('Invalid filename')
    .custom((value) => {
      const filename = value as string;
      const validExtensions = ['.json', '.csv', '.xlsx'];
      const hasValidExtension = validExtensions.some(ext => filename.endsWith(ext));
      
      if (!hasValidExtension) {
        throw new Error('Invalid file extension. Must be .json, .csv, or .xlsx');
      }
      
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new Error('Invalid filename format');
      }
      
      return true;
    })
];