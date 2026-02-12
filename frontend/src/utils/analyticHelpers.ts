// src/utils/analyticsHelpers.ts

import { TimeRange, type ITaskOverviewStats, type ITaskTrendPoint } from '../types/interface/analyticsInterface';

/**
 * Get date range based on time range
 */
export const getDateRangeFromTimeRange = (timeRange: TimeRange): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case TimeRange.TODAY:
      startDate.setHours(0, 0, 0, 0);
      break;
    case TimeRange.WEEK:
      startDate.setDate(startDate.getDate() - 7);
      break;
    case TimeRange.MONTH:
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case TimeRange.QUARTER:
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case TimeRange.YEAR:
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case TimeRange.CUSTOM:
      // Return empty strings for custom range - should be set manually
      return { startDate: '', endDate: '' };
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

/**
 * Format completion rate for display
 */
export const formatCompletionRate = (rate: number): string => {
  return `${Math.round(rate)}%`;
};

/**
 * Format average completion time
 */
export const formatAverageTime = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }
  if (hours < 24) {
    return `${Math.round(hours * 10) / 10} hrs`;
  }
  const days = Math.round((hours / 24) * 10) / 10;
  return `${days} days`;
};

/**
 * Get color for status
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    todo: '#6B7280',
    in_progress: '#3B82F6',
    completed: '#10B981',
    cancelled: '#EF4444'
  };
  return colors[status] || '#6B7280';
};

/**
 * Get color for priority
 */
export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    urgent: '#7F1D1D'
  };
  return colors[priority] || '#6B7280';
};

/**
 * Prepare chart data for tasks by status
 */
export const prepareStatusChartData = (stats: ITaskOverviewStats) => {
  return {
    labels: stats.tasksByStatus.map(s => s.status.replace('_', ' ')),
    datasets: [
      {
        data: stats.tasksByStatus.map(s => s.count),
        backgroundColor: stats.tasksByStatus.map(s => getStatusColor(s.status)),
      },
    ],
  };
};

/**
 * Prepare chart data for tasks by priority
 */
export const preparePriorityChartData = (stats: ITaskOverviewStats) => {
  return {
    labels: stats.tasksByPriority.map(p => p.priority),
    datasets: [
      {
        data: stats.tasksByPriority.map(p => p.count),
        backgroundColor: stats.tasksByPriority.map(p => getPriorityColor(p.priority)),
      },
    ],
  };
};

/**
 * Prepare chart data for task trends
 */
export const prepareTrendsChartData = (trends: ITaskTrendPoint[]) => {
  return {
    labels: trends.map(t => t.date),
    datasets: [
      {
        label: 'Total Tasks',
        data: trends.map(t => t.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        label: 'Completed',
        data: trends.map(t => t.completed || 0),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
      {
        label: 'In Progress',
        data: trends.map(t => t.inProgress || 0),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
      },
    ],
  };
};