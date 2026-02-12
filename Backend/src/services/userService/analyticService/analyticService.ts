// src/services/userService/analyticService/analyticService.ts
import { 
  ITaskOverviewStats, 
  IUserPerformanceMetric, 
  ITaskTrendPoint, 
  IExportTasksData,
  IAnalyticsQueryDTO,
  TimeRange,
} from '../../../models/analyticsModel';
import { IAnalyticsRepository } from '../../../repositories/userRepo/analyticsRepo/IAnalyticsRepo';
import { IAnalyticsService, IExportTasksOptions } from './IAnalyticService';
import { IGetTasksQueryDTO } from '../taskService/IUserTaskService';
import { AppError } from '../../../utils/errorUtil/appError';
import { Types } from 'mongoose';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export class AnalyticsService implements IAnalyticsService {
  constructor(
    private analyticsRepository: IAnalyticsRepository
  ) {}

  async getTaskOverviewStats(userId: string): Promise<ITaskOverviewStats> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    return this.analyticsRepository.getTaskOverviewStats(userId);
  }

  async getUserPerformanceMetrics(userId?: string): Promise<IUserPerformanceMetric[]> {
    if (userId && !Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    return this.analyticsRepository.getUserPerformanceMetrics(userId);
  }

  async getTaskTrendsOverTime(
    userId: string,
    query: IAnalyticsQueryDTO
  ): Promise<ITaskTrendPoint[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    let { startDate, endDate, timeRange } = query;

    // Set date range based on timeRange
    if (timeRange) {
      const now = new Date();
      endDate = endDate || now.toISOString();

      switch (timeRange) {
        case TimeRange.TODAY:
          startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case TimeRange.WEEK:
          startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
          break;
        case TimeRange.MONTH:
          startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
          break;
        case TimeRange.QUARTER:
          startDate = new Date(now.setMonth(now.getMonth() - 3)).toISOString();
          break;
        case TimeRange.YEAR:
          startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
          break;
      }
    }

    // Validate dates
    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    if (parsedStartDate > parsedEndDate) {
      throw new AppError('Start date must be before end date', 400);
    }

    // Determine grouping based on date range
    let groupBy: 'day' | 'week' | 'month' = 'day';
    const daysDiff = Math.ceil(
      (parsedEndDate.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 90) {
      groupBy = 'month';
    } else if (daysDiff > 31) {
      groupBy = 'week';
    }

    return this.analyticsRepository.getTaskTrendsOverTime(
      userId,
      parsedStartDate,
      parsedEndDate,
      groupBy
    );
  }

  async exportTasksData(
    userId: string,
    filters: IGetTasksQueryDTO,
    options: IExportTasksOptions
  ): Promise<IExportTasksData> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    const {
      includeComments = true,
      includeFiles = false,
      format = 'json'
    } = options;

    // Convert IGetTasksQueryDTO to IExportFiltersDTO
    const exportFilters = {
      status: filters.status,
      priority: filters.priority,
      assignedTo: filters.assignedTo,
      tags: filters.tags,
      dueDateFrom: filters.dueDateFrom,
      dueDateTo: filters.dueDateTo,
      createdAtFrom: filters.createdAtFrom,
      createdAtTo: filters.createdAtTo,
      search: filters.search,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    };

    // Get tasks data
    const tasks = await this.analyticsRepository.getTasksForExport(
      userId,
      exportFilters,
      includeComments,
      includeFiles
    );

    if (tasks.length === 0) {
      throw new AppError('No tasks found to export', 404);
    }

    const timestamp = Date.now();
    const filename = `tasks_export_${timestamp}`;
    let fileContent: Buffer | string;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'csv':
        // Flatten the data for CSV
        const flattenedTasks = tasks.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          tags: task.tags?.join(', '),
          assignedTo: task.assignedTo?.name || task.assignedTo?.email || '',
          createdBy: task.createdBy?.name || task.createdBy?.email || '',
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          commentsCount: task.comments?.length || 0,
          filesCount: task.files?.length || 0
        }));

        const json2csvParser = new Parser();
        fileContent = json2csvParser.parse(flattenedTasks);
        mimeType = 'text/csv';
        fileExtension = 'csv';
        break;

      case 'excel':
        // Create Excel workbook
        const wb = XLSX.utils.book_new();
        
        // Tasks worksheet
        const tasksWs = XLSX.utils.json_to_sheet(
          tasks.map((task: any) => ({
            ID: task._id,
            Title: task.title,
            Description: task.description,
            Status: task.status,
            Priority: task.priority,
            'Due Date': task.dueDate,
            Tags: task.tags?.join(', '),
            'Assigned To': task.assignedTo?.name || task.assignedTo?.email || '',
            'Created By': task.createdBy?.name || task.createdBy?.email || '',
            'Created At': task.createdAt,
            'Updated At': task.updatedAt
          }))
        );
        XLSX.utils.book_append_sheet(wb, tasksWs, 'Tasks');

        // Comments worksheet if included
        if (includeComments) {
          const allComments = tasks.flatMap((task: any) => 
            (task.comments || []).map((comment: any) => ({
              'Task ID': task._id,
              'Task Title': task.title,
              'Comment': comment.content,
              'Comment By': comment.createdBy?.name || comment.createdBy?.email || '',
              'Comment Date': comment.createdAt
            }))
          );
          
          if (allComments.length > 0) {
            const commentsWs = XLSX.utils.json_to_sheet(allComments);
            XLSX.utils.book_append_sheet(wb, commentsWs, 'Comments');
          }
        }

        // Files worksheet if included
        if (includeFiles) {
          const allFiles = tasks.flatMap((task: any) => 
            (task.files || []).map((file: any) => ({
              'Task ID': task._id,
              'Task Title': task.title,
              'File Name': file.originalName,
              'File Type': file.fileType,
              'File Size (KB)': Math.round(file.size / 1024),
              'Uploaded By': file.uploadedBy?.name || file.uploadedBy?.email || '',
              'Upload Date': file.createdAt
            }))
          );
          
          if (allFiles.length > 0) {
            const filesWs = XLSX.utils.json_to_sheet(allFiles);
            XLSX.utils.book_append_sheet(wb, filesWs, 'Files');
          }
        }

        // Summary worksheet
        const summaryWs = XLSX.utils.json_to_sheet([
          {
            'Metric': 'Total Tasks',
            'Value': tasks.length
          },
          {
            'Metric': 'Completed Tasks',
            'Value': tasks.filter((t: any) => t.status === 'completed').length
          },
          {
            'Metric': 'In Progress Tasks',
            'Value': tasks.filter((t: any) => t.status === 'in_progress').length
          },
          {
            'Metric': 'Pending Tasks',
            'Value': tasks.filter((t: any) => t.status === 'todo').length
          },
          {
            'Metric': 'High Priority Tasks',
            'Value': tasks.filter((t: any) => t.priority === 'high' || t.priority === 'urgent').length
          },
          {
            'Metric': 'Export Date',
            'Value': new Date().toISOString()
          }
        ]);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        // Generate Excel file
        fileContent = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;

      case 'json':
      default:
        fileContent = JSON.stringify(tasks, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
    }

    // Save file temporarily
    const tempDir = path.join(process.cwd(), 'temp_exports');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fullFilename = `${filename}.${fileExtension}`;
    const filePath = path.join(tempDir, fullFilename);
    
    if (typeof fileContent === 'string') {
      fs.writeFileSync(filePath, fileContent);
    } else {
      fs.writeFileSync(filePath, fileContent);
    }

    return {
      tasks,
      format,
      filename: fullFilename,
      generatedAt: new Date(),
      totalCount: tasks.length,
      filePath,
      mimeType,
      fileContent
    };
  }

  async getDashboardStats(userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    const [overview, completionRate, avgCompletionTime, activitySummary] = await Promise.all([
      this.analyticsRepository.getTaskOverviewStats(userId),
      this.analyticsRepository.getTaskCompletionRate(userId, 30),
      this.analyticsRepository.getAverageTaskCompletionTime(userId),
      this.analyticsRepository.getActivitySummary(userId, 7)
    ]);

    // Get trends for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const trends = await this.analyticsRepository.getTaskTrendsOverTime(
      userId,
      startDate,
      endDate,
      'day'
    );

    return {
      overview,
      completionRate,
      avgCompletionTime,
      activitySummary,
      trends: trends.slice(-10) // Last 10 days
    };
  }

  async getActivitySummary(userId: string, days: number = 7): Promise<any> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format', 400);
    }

    return this.analyticsRepository.getActivitySummary(userId, days);
  }
}