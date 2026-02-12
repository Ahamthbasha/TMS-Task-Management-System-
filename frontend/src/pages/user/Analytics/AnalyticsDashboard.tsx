// src/pages/dashboard/Dashboard.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { TimeRange } from '../../../types/interface/analyticsInterface';
import { 
  BarChart, Bar, LineChart, Line, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import './Dashboard.css';

const COLORS = {
  todo: '#6B7280',
  in_progress: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444',
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  urgent: '#7F1D1D'
} as const;

type StatusKey = keyof typeof COLORS;

const Dashboard: React.FC = () => {
  const { 
    overviewStats, 
    userPerformance, 
    taskTrends, 
    loading, 
    fetchOverviewStats, 
    fetchUserPerformance, 
    fetchTaskTrends,
    exportTasks,
    downloadExport,
  } = useAnalytics();

  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.WEEK);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('excel');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchOverviewStats();
    fetchUserPerformance();
  }, [fetchOverviewStats, fetchUserPerformance]);

  useEffect(() => {
    fetchTaskTrends({ timeRange });
  }, [timeRange, fetchTaskTrends]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await exportTasks({}, exportFormat);
      if (data?.filename) {
        await downloadExport(data.filename);
      }
    } finally {
      setIsExporting(false);
    }
  }, [exportFormat, exportTasks, downloadExport]);

  const renderPieLabel = (props: PieLabelRenderProps): string => {
    const { name, percent } = props;
    if (!name || percent === undefined || percent <= 0) return '';
    const percentage = (percent * 100).toFixed(1);
    return `${name}: ${percentage}%`;
  };

  const formatTooltipValue = (
    value: number | string | (number | string)[] | undefined
  ): [string, string] => {
    if (value === undefined) return ['0 tasks', 'Count'];

    let numValue: number;

    if (Array.isArray(value)) {
      numValue = value.reduce<number>((acc, val) => {
        return acc + Number(val || 0);
      }, 0);
    } else {
      numValue = Number(value || 0);
    }

    return [`${numValue} tasks`, 'Count'];
  };

  if (loading.overview && !overviewStats) {
    return (
      <div className="dashboard-loading">
        <RefreshCw className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Analytics Dashboard</h1>
        <div className="dashboard-actions">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv' | 'excel')}
            className="dashboard-select"
            aria-label="Export format"
          >
            <option value="excel">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
            <option value="json">JSON (.json)</option>
          </select>
          <button
            onClick={handleExport}
            disabled={isExporting || loading.export}
            className="dashboard-export-btn"
            aria-label="Export data"
          >
            {isExporting || loading.export ? (
              <RefreshCw className="btn-icon spinner" />
            ) : (
              <Download className="btn-icon" />
            )}
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      {overviewStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Tasks</p>
            <p className="stat-value stat-value-primary">{overviewStats.totalTasks}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Completion Rate</p>
            <p className="stat-value stat-value-success">{overviewStats.completionRate.toFixed(1)}%</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Overdue Tasks</p>
            <p className="stat-value stat-value-danger">{overviewStats.overdueTasks}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Avg. Completion Time</p>
            <p className="stat-value stat-value-info">
              {overviewStats.averageCompletionTime.toFixed(1)}h
            </p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="charts-row">
        {/* Tasks by Status */}
        {overviewStats && overviewStats.tasksByStatus.some(s => s.count > 0) && (
          <div className="chart-card">
            <h3 className="chart-title">Tasks by Status</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overviewStats.tasksByStatus.filter(s => s.count > 0)}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={renderPieLabel}
                    labelLine={false}
                  >
                    {overviewStats.tasksByStatus
                      .filter(s => s.count > 0)
                      .map((entry, i) => (
                        <Cell 
                          key={`cell-${i}`} 
                          fill={COLORS[entry.status as StatusKey] || '#6B7280'} 
                        />
                      ))}
                  </Pie>
                  <Tooltip 
                    formatter={formatTooltipValue}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tasks by Priority */}
        {overviewStats && overviewStats.tasksByPriority.some(p => p.count > 0) && (
          <div className="chart-card">
            <h3 className="chart-title">Tasks by Priority</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={overviewStats.tasksByPriority.filter(p => p.count > 0)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip 
                    formatter={formatTooltipValue}
                  />
                  <Bar dataKey="count" name="Tasks">
                    {overviewStats.tasksByPriority
                      .filter(p => p.count > 0)
                      .map((entry, i) => (
                        <Cell 
                          key={`cell-${i}`} 
                          fill={COLORS[entry.priority as StatusKey] || '#6B7280'} 
                        />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Task Trends */}
      {taskTrends.length > 0 && (
        <div className="trends-card">
          <div className="trends-header">
            <h3 className="trends-title">Task Trends</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="trends-select"
              aria-label="Select time range"
            >
              <option value={TimeRange.WEEK}>Last 7 days</option>
              <option value={TimeRange.MONTH}>Last 30 days</option>
              <option value={TimeRange.QUARTER}>Last 90 days</option>
            </select>
          </div>
          <div className="trends-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  name="Total" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10B981" 
                  name="Completed" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="inProgress" 
                  stroke="#F59E0B" 
                  name="In Progress" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* User Performance Table */}
      {userPerformance.length > 0 ? (
        <div className="performance-card">
          <h3 className="performance-title">User Performance</h3>
          <div className="table-container">
            <table className="performance-table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">User</th>
                  <th className="table-header-cell">Completed</th>
                  <th className="table-header-cell">In Progress</th>
                  <th className="table-header-cell">Pending</th>
                  <th className="table-header-cell">Completion Rate</th>
                  <th className="table-header-cell">Avg. Time</th>
                  <th className="table-header-cell">Overdue</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {userPerformance.map((user) => (
                  <tr key={user.userId} className="table-row">
                    <td className="table-cell">
                      <div className="user-info">
                        <div className="user-name">{user.userName}</div>
                        <div className="user-email">{user.userEmail}</div>
                      </div>
                    </td>
                    <td className="table-cell">{user.tasksCompleted}</td>
                    <td className="table-cell">{user.tasksInProgress}</td>
                    <td className="table-cell">{user.tasksPending}</td>
                    <td className="table-cell">
                      <span className={`badge ${getCompletionRateBadge(user.completionRate)}`}>
                        {user.completionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="table-cell">{user.averageCompletionTime.toFixed(1)}h</td>
                    <td className="table-cell">
                      <span className={`badge ${getOverdueBadge(user.overdueTasks)}`}>
                        {user.overdueTasks}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="empty-state-title">No User Performance Data</h3>
          <p className="empty-state-message">
            No users have been assigned to any tasks yet. 
            User performance metrics are calculated based on assigned tasks only.
          </p>
        </div>
      )}
    </div>
  );
};

// Helper functions for badge colors
const getCompletionRateBadge = (rate: number): string => {
  if (rate >= 70) return 'badge-success';
  if (rate >= 40) return 'badge-warning';
  return 'badge-danger';
};

const getOverdueBadge = (count: number): string => {
  if (count === 0) return 'badge-success';
  if (count < 3) return 'badge-warning';
  return 'badge-danger';
};

export default Dashboard;