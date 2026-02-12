// src/controllers/userController/analyticController/analyticController.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/authMiddleware';
import { IAnalyticsService } from '../../../services/userService/analyticService/IAnalyticService';
import { IAnalyticsController } from './IAnalyticController';
import { TimeRange } from '../../../models/analyticsModel';
import fs from 'fs';
import path from 'path';
import { ParsedQs } from 'qs';

export class AnalyticsController implements IAnalyticsController {
  constructor(private analyticsService: IAnalyticsService) {}

  // Helper method to safely extract string value from query parameters
  private getQueryStringValue(value: string | ParsedQs | (string | ParsedQs)[] | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    if (Array.isArray(value)) {
      const firstValue = value[0];
      if (typeof firstValue === 'string') {
        return firstValue;
      }
      if (firstValue && typeof firstValue === 'object') {
        return JSON.stringify(firstValue);
      }
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return undefined;
  }

  // Helper method to ensure param is string for params (not query)
  private getStringParam(param: string | string[] | undefined): string {
    if (Array.isArray(param)) {
      return param[0];
    }
    return param || '';
  }

  getTaskOverviewStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const stats = await this.analyticsService.getTaskOverviewStats(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Task overview statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  getUserPerformanceMetrics = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const userId = this.getQueryStringValue(req.query.userId);
      const metrics = await this.analyticsService.getUserPerformanceMetrics(userId);

      res.status(200).json({
        success: true,
        message: 'User performance metrics retrieved successfully',
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  };

  getTaskTrendsOverTime = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const { timeRange, startDate, endDate } = req.query;

      const trends = await this.analyticsService.getTaskTrendsOverTime(
        req.user.userId,
        {
          timeRange: this.getQueryStringValue(timeRange) as TimeRange,
          startDate: this.getQueryStringValue(startDate),
          endDate: this.getQueryStringValue(endDate)
        }
      );

      res.status(200).json({
        success: true,
        message: 'Task trends retrieved successfully',
        data: trends
      });
    } catch (error) {
      next(error);
    }
  };

  exportTasksData = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const {
        format = 'json',
        includeComments = 'true',
        includeFiles = 'false',
        status,
        priority,
        assignedTo,
        tags,
        dueDateFrom,
        dueDateTo,
        createdAtFrom,
        createdAtTo,
        search,
        sortBy,
        sortOrder
      } = req.query;

      // Get string values from query parameters
      const formatStr = this.getQueryStringValue(format) || 'json';
      const includeCommentsStr = this.getQueryStringValue(includeComments) || 'true';
      const includeFilesStr = this.getQueryStringValue(includeFiles) || 'false';
      const statusStr = this.getQueryStringValue(status);
      const priorityStr = this.getQueryStringValue(priority);
      const assignedToStr = this.getQueryStringValue(assignedTo);
      const tagsStr = this.getQueryStringValue(tags);
      const dueDateFromStr = this.getQueryStringValue(dueDateFrom);
      const dueDateToStr = this.getQueryStringValue(dueDateTo);
      const createdAtFromStr = this.getQueryStringValue(createdAtFrom);
      const createdAtToStr = this.getQueryStringValue(createdAtTo);
      const searchStr = this.getQueryStringValue(search);
      const sortByStr = this.getQueryStringValue(sortBy);
      const sortOrderStr = this.getQueryStringValue(sortOrder);

      const exportData = await this.analyticsService.exportTasksData(
        req.user.userId,
        {
          status: statusStr as any,
          priority: priorityStr as any,
          assignedTo: assignedToStr,
          tags: tagsStr ? tagsStr.split(',') : undefined,
          dueDateFrom: dueDateFromStr,
          dueDateTo: dueDateToStr,
          createdAtFrom: createdAtFromStr,
          createdAtTo: createdAtToStr,
          search: searchStr,
          sortBy: sortByStr,
          sortOrder: sortOrderStr as 'asc' | 'desc' | undefined
        },
        {
          format: formatStr as 'json' | 'csv' | 'excel',
          includeComments: includeCommentsStr === 'true',
          includeFiles: includeFilesStr === 'true'
        }
      );

      res.status(200).json({
        success: true,
        message: 'Tasks data exported successfully',
        data: {
          format: exportData.format,
          filename: exportData.filename,
          generatedAt: exportData.generatedAt,
          totalCount: exportData.totalCount,
          downloadUrl: `/api/analytics/export/download/${encodeURIComponent(exportData.filename)}`
        }
      });
    } catch (error) {
      next(error);
    }
  };

  downloadExportedFile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      // Handle filename properly - this is a param, not query
      const filenameParam = req.params.filename;
      const filename = this.getStringParam(filenameParam);
      
      if (!filename) {
        res.status(400).json({
          success: false,
          message: 'Filename is required'
        });
        return;
      }

      const decodedFilename = decodeURIComponent(filename);
      const tempDir = path.join(process.cwd(), 'temp_exports');
      const filePath = path.join(tempDir, decodedFilename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Export file not found or expired'
        });
        return;
      }

      let mimeType = 'application/octet-stream';
      if (decodedFilename.endsWith('.json')) {
        mimeType = 'application/json';
      } else if (decodedFilename.endsWith('.csv')) {
        mimeType = 'text/csv';
      } else if (decodedFilename.endsWith('.xlsx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${decodedFilename}"`);

      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file'
          });
        }
      });

      fileStream.pipe(res);

      // Optionally delete file after download
      res.on('finish', () => {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error('Error deleting temp file:', error);
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getDashboardStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const dashboardStats = await this.analyticsService.getDashboardStats(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: dashboardStats
      });
    } catch (error) {
      next(error);
    }
  };
}