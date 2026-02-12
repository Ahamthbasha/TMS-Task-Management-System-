
import { useState, useCallback } from 'react';
import {
  getTaskOverviewStats,
  getUserPerformanceMetrics,
  getTaskTrendsOverTime,
  exportTasksData,
  downloadExportedFile,
  triggerFileDownload
} from '../api/userAction/userAction';
import type {
  ITaskOverviewStats,
  IUserPerformanceMetric,
  ITaskTrendPoint,
  IExportTasksData,
  ITaskTrendsQueryParams
} from '../types/interface/analyticsInterface';
import type { IGetTasksQueryParams } from '../types/interface/taskInterface';

// Define proper type for export filters
export interface ExportFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  search?: string;
  tags?: string[];
}

export const useAnalytics = () => {
  const [overviewStats, setOverviewStats] = useState<ITaskOverviewStats | null>(null);
  const [userPerformance, setUserPerformance] = useState<IUserPerformanceMetric[]>([]);
  const [taskTrends, setTaskTrends] = useState<ITaskTrendPoint[]>([]);
  const [exportData, setExportData] = useState<IExportTasksData | null>(null);
  
  const [loading, setLoading] = useState({
    overview: false,
    performance: false,
    trends: false,
    export: false
  });
  
  const [error, setError] = useState({
    overview: '',
    performance: '',
    trends: '',
    export: ''
  });

  const fetchOverviewStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, overview: true }));
    setError(prev => ({ ...prev, overview: '' }));
    try {
      const response = await getTaskOverviewStats();
      if (response.success) setOverviewStats(response.data);
    } catch {
      setError(prev => ({ ...prev, overview: 'Failed to load overview statistics' }));
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  }, []);

  const fetchUserPerformance = useCallback(async () => {
    setLoading(prev => ({ ...prev, performance: true }));
    setError(prev => ({ ...prev, performance: '' }));
    try {
      const response = await getUserPerformanceMetrics();
      if (response.success) setUserPerformance(response.data);
    } catch {
      setError(prev => ({ ...prev, performance: 'Failed to load user performance' }));
    } finally {
      setLoading(prev => ({ ...prev, performance: false }));
    }
  }, []);

  const fetchTaskTrends = useCallback(async (params: ITaskTrendsQueryParams) => {
    setLoading(prev => ({ ...prev, trends: true }));
    setError(prev => ({ ...prev, trends: '' }));
    try {
      const response = await getTaskTrendsOverTime(params);
      if (response.success) setTaskTrends(response.data);
    } catch {
      setError(prev => ({ ...prev, trends: 'Failed to load task trends' }));
    } finally {
      setLoading(prev => ({ ...prev, trends: false }));
    }
  }, []);

  const exportTasks = useCallback(async (
    filters?: IGetTasksQueryParams | ExportFilters, 
    format: 'json' | 'csv' | 'excel' = 'excel'
  ) => {
    setLoading(prev => ({ ...prev, export: true }));
    setError(prev => ({ ...prev, export: '' }));
    try {
      // Pass format directly as second parameter, not as an object
      const response = await exportTasksData(filters, format);
      if (response.success) setExportData(response.data);
      return response.data;
    } catch {
      setError(prev => ({ ...prev, export: 'Failed to export tasks' }));
      throw new Error('Failed to export tasks');
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  }, []);

  const downloadExport = useCallback(async (filename: string) => {
    try {
      const blob = await downloadExportedFile(filename);
      triggerFileDownload(blob, filename);
    } catch {
      console.error('Download failed');
      throw new Error('Failed to download file');
    }
  }, []);

  return {
    // Data
    overviewStats,
    userPerformance,
    taskTrends,
    exportData,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Actions
    fetchOverviewStats,
    fetchUserPerformance,
    fetchTaskTrends,
    exportTasks,
    downloadExport,
    
    // Reset
    resetOverviewStats: () => setOverviewStats(null),
    resetUserPerformance: () => setUserPerformance([]),
    resetTaskTrends: () => setTaskTrends([]),
    resetExportData: () => setExportData(null)
  };
};