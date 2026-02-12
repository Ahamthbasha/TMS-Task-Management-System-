import { Types, PipelineStage } from "mongoose";
import {
  Task,
  ITask,
  TaskStatus,
  TaskPriority,
} from "../../../models/taskModel";
import { Comment } from "../../../models/commentModel";
import { File } from "../../../models/fileModel";
import { User } from "../../../models/userModel";
import {
  ITaskOverviewStats,
  IUserPerformanceMetric,
  ITaskTrendPoint,
} from "../../../models/analyticsModel";
import { IAnalyticsRepository } from "./IAnalyticsRepo";

export class AnalyticsRepository implements IAnalyticsRepository {

async getTaskOverviewStats(userId: string): Promise<ITaskOverviewStats> {
  const userObjectId = new Types.ObjectId(userId);

  // Get tasks where user is either creator or assigned
  const matchStage: any = {
    $match: {
      isDeleted: false,
      $or: [{ createdBy: userObjectId }, { assignedTo: userObjectId }],
    },
  };

  // Pipeline for task statistics
  const pipeline: PipelineStage[] = [
    matchStage,
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        tasksByStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              status: "$_id",
              count: 1,
              _id: 0,
            },
          },
        ],
        tasksByPriority: [
        {
            $match: {
              status: { $ne: TaskStatus.COMPLETED } // Exclude completed tasks
            }
          },
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              priority: "$_id",
              count: 1,
              _id: 0,
            },
          },
        ],
        overdueTasks: [
          {
            $match: {
              status: { $ne: TaskStatus.COMPLETED },
              dueDate: { $lt: new Date() },
            },
          },
          { $count: "count" },
        ],
        upcomingTasks: [
          {
            $match: {
              status: { $ne: TaskStatus.COMPLETED },
              dueDate: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
          { $count: "count" },
        ],
        noDueDateTasks: [
          {
            $match: {
              dueDate: { $exists: false },
            },
          },
          { $count: "count" },
        ],
        completedTasks: [
          {
            $match: {
              status: TaskStatus.COMPLETED,
            },
          },
          { $count: "count" },
        ],
        completedTasksWithTime: [
          {
            $match: {
              status: TaskStatus.COMPLETED,
              createdAt: { $exists: true },
              updatedAt: { $exists: true },
            },
          },
          {
            $project: {
              completionTime: {
                $divide: [
                  { $subtract: ["$updatedAt", "$createdAt"] },
                  1000 * 60 * 60, // Convert to hours
                ],
              },
            },
          },
        ],
      },
    },
  ];

  const result = await Task.aggregate(pipeline);
  const stats = result[0];

  const totalTasks = stats.totalTasks[0]?.count || 0;
  const completedTasks = stats.completedTasks[0]?.count || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate average completion time
  let avgCompletionTime = 0;
  if (stats.completedTasksWithTime && stats.completedTasksWithTime.length > 0) {
    const totalTime = stats.completedTasksWithTime.reduce(
      (sum: number, task: any) => sum + (task.completionTime || 0),
      0,
    );
    avgCompletionTime = totalTime / stats.completedTasksWithTime.length;
  }

  // Calculate percentages for status counts
  const tasksByStatus = stats.tasksByStatus.map((item: any) => ({
    status: item.status,
    count: item.count,
    percentage: totalTasks > 0 ? (item.count / totalTasks) * 100 : 0,
  }));

  // Ensure all statuses are present
  const allStatuses = Object.values(TaskStatus);
  const completeStatusCounts = allStatuses.map((status) => {
    const existing = tasksByStatus.find((s: any) => s.status === status);
    return existing || { status, count: 0, percentage: 0 };
  });

  // FIXED: Handle tasksByPriority - use item.priority (from $project) not item._id
  let tasksByPriorityData = [];
  
  if (stats.tasksByPriority && stats.tasksByPriority.length > 0) {
    tasksByPriorityData = stats.tasksByPriority.map((item: any) => ({
      priority: item.priority, // Directly use the priority field from $project
      count: item.count,
      percentage: totalTasks > 0 ? (item.count / totalTasks) * 100 : 0,
    }));
  }

  // Ensure all priorities are present with default values
  const allPriorities = Object.values(TaskPriority);
  const completePriorityCounts = allPriorities.map((priority) => {
    const existing = tasksByPriorityData.find(
      (p: any) => p.priority === priority,
    );
    return existing || { priority, count: 0, percentage: 0 };
  });

  return {
    totalTasks,
    tasksByStatus: completeStatusCounts,
    tasksByPriority: completePriorityCounts,
    overdueTasks: stats.overdueTasks[0]?.count || 0,
    upcomingTasks: stats.upcomingTasks[0]?.count || 0,
    noDueDateTasks: stats.noDueDateTasks[0]?.count || 0,
    completionRate: Math.round(completionRate * 100) / 100,
    averageCompletionTime: Math.round(avgCompletionTime * 100) / 100,
  };
}

  async getUserPerformanceMetrics(
    userId?: string,
  ): Promise<IUserPerformanceMetric[]> {
    // Get all active users or filter by specific user
    const userMatch: any = { isActive: true };
    if (userId) {
      userMatch._id = new Types.ObjectId(userId);
    }

    const users = await User.find(userMatch).select("_id name email").lean();

    const metrics: IUserPerformanceMetric[] = [];

    for (const user of users) {
      const userObjectId = user._id;

      // IMPORTANT: Only count tasks where user is ASSIGNED, not created
      // This ensures we only show performance metrics for assigned tasks
      const taskStats = await Task.aggregate([
        {
          $match: {
            isDeleted: false,
            assignedTo: userObjectId, // Only tasks assigned to this user
          },
        },
        {
          $facet: {
            totalTasks: [{ $count: "count" }],
            completedTasks: [
              { $match: { status: TaskStatus.COMPLETED } },
              { $count: "count" },
            ],
            inProgressTasks: [
              { $match: { status: TaskStatus.IN_PROGRESS } },
              { $count: "count" },
            ],
            pendingTasks: [
              { $match: { status: TaskStatus.TODO } },
              { $count: "count" },
            ],
            overdueTasks: [
              {
                $match: {
                  status: { $ne: TaskStatus.COMPLETED },
                  dueDate: { $lt: new Date() },
                },
              },
              { $count: "count" },
            ],
            completionTimes: [
              {
                $match: {
                  status: TaskStatus.COMPLETED,
                  createdAt: { $exists: true },
                  updatedAt: { $exists: true },
                  assignedTo: userObjectId,
                },
              },
              {
                $project: {
                  completionTime: {
                    $divide: [
                      { $subtract: ["$updatedAt", "$createdAt"] },
                      1000 * 60 * 60, // Hours
                    ],
                  },
                },
              },
            ],
          },
        },
      ]);

      const stats = taskStats[0];
      const totalTasks = stats.totalTasks[0]?.count || 0;
      const completedTasks = stats.completedTasks[0]?.count || 0;
      const inProgressTasks = stats.inProgressTasks[0]?.count || 0;
      const pendingTasks = stats.pendingTasks[0]?.count || 0;
      const overdueTasks = stats.overdueTasks[0]?.count || 0;

      // Calculate average completion time
      let avgCompletionTime = 0;
      if (stats.completionTimes && stats.completionTimes.length > 0) {
        const totalTime = stats.completionTimes.reduce(
          (sum: number, task: any) => sum + (task.completionTime || 0),
          0,
        );
        avgCompletionTime = totalTime / stats.completionTimes.length;
      }

      // Calculate completion rate (only for assigned tasks)
      const completionRate =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      metrics.push({
        userId: user._id.toString(),
        userName: user.name,
        userEmail: user.email,
        tasksCompleted: completedTasks,
        tasksInProgress: inProgressTasks,
        tasksPending: pendingTasks,
        totalTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        averageCompletionTime: Math.round(avgCompletionTime * 100) / 100,
        overdueTasks,
      });
    }

    // Filter out users with zero tasks (no assignments)
    const filteredMetrics = metrics.filter((m) => m.totalTasks > 0);

    // Sort by completion rate descending
    return filteredMetrics.sort((a, b) => b.completionRate - a.completionRate);
  }

  async getTaskTrendsOverTime(
  userId: string,
  startDate: Date,
  endDate: Date,
  groupBy: "day" | "week" | "month" | "day",
): Promise<ITaskTrendPoint[]> {
  const userObjectId = new Types.ObjectId(userId);

  // Helper function to get group stage based on date field
  const getGroupStage = (dateField: string) => {
    switch (groupBy) {
      case "day":
        return {
          year: { $year: dateField },
          month: { $month: dateField },
          day: { $dayOfMonth: dateField },
        };
      case "week":
        return {
          year: { $year: dateField },
          week: { $week: dateField },
        };
      case "month":
        return {
          year: { $year: dateField },
          month: { $month: dateField },
        };
    }
  };

  const pipeline: PipelineStage[] = [
    {
      $match: {
        isDeleted: false,
        $or: [{ createdBy: userObjectId }, { assignedTo: userObjectId }],
      },
    },
    {
      $facet: {
        // 1. TASKS CREATED in date range - for total/created count
        created: [
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: getGroupStage("$createdAt"),
              created: { $sum: 1 },
              todo: {
                $sum: { $cond: [{ $eq: ["$status", TaskStatus.TODO] }, 1, 0] },
              },
              inProgress: {
                $sum: {
                  $cond: [{ $eq: ["$status", TaskStatus.IN_PROGRESS] }, 1, 0],
                },
              },
            }
          }
        ],
        
        // 2. TASKS COMPLETED in date range - for completed count
        completed: [
          {
            $match: {
              status: TaskStatus.COMPLETED,
              updatedAt: { $gte: startDate, $lte: endDate } // Use updatedAt for completion date
            }
          },
          {
            $group: {
              _id: getGroupStage("$updatedAt"),
              completed: { $sum: 1 }
            }
          }
        ],
        
        // 3. TASKS CANCELLED in date range - for cancelled count
        cancelled: [
          {
            $match: {
              status: TaskStatus.CANCELLED,
              updatedAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: getGroupStage("$updatedAt"),
              cancelled: { $sum: 1 }
            }
          }
        ]
      }
    },
    {
      $project: {
        // Combine all date points
        allDates: {
          $setUnion: [
            { $ifNull: ["$created", []] },
            { $ifNull: ["$completed", []] },
            { $ifNull: ["$cancelled", []] }
          ]
        }
      }
    },
    { $unwind: "$allDates" },
    {
      $replaceRoot: { newRoot: "$allDates" }
    },
    {
      $group: {
        _id: "$_id",
        created: { $sum: "$created" },
        todo: { $sum: "$todo" },
        inProgress: { $sum: "$inProgress" },
        completed: { $sum: "$completed" },
        cancelled: { $sum: "$cancelled" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
  ];

  const trends = await Task.aggregate(pipeline);

  // Format the results
  const formattedTrends: ITaskTrendPoint[] = trends.map((item) => {
    let date: string;
    if (groupBy === "day") {
      date = `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`;
    } else if (groupBy === "week") {
      date = `${item._id.year}-W${String(item._id.week).padStart(2, "0")}`;
    } else {
      date = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
    }

    return {
      date,
      count: item.created || 0,
      total: item.created || 0,
      todo: item.todo || 0,
      inProgress: item.inProgress || 0,
      completed: item.completed || 0,
      cancelled: item.cancelled || 0,
    };
  });

  // Fill in missing dates with zero values
  const allDates = this.generateDateRange(startDate, endDate, groupBy);
  const completeTrends = allDates.map(date => {
    const existing = formattedTrends.find(t => t.date === date);
    return existing || {
      date,
      count: 0,
      total: 0,
      todo: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };
  });

  return completeTrends;
}

// Helper method to generate all dates in range
private generateDateRange(startDate: Date, endDate: Date, groupBy: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (groupBy === "day") {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    } else if (groupBy === "week") {
      const year = current.getFullYear();
      const week = this.getWeekNumber(current);
      dates.push(`${year}-W${String(week).padStart(2, "0")}`);
      current.setDate(current.getDate() + 7);
    } else if (groupBy === "month") {
      dates.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`);
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  return dates;
}

// Helper method to get week number
private getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

//   async getTaskTrendsOverTime(
//     userId: string,
//     startDate: Date,
//     endDate: Date,
//     groupBy: "day" | "week" | "month" = "day",
//   ): Promise<ITaskTrendPoint[]> {
//     const userObjectId = new Types.ObjectId(userId);

//     // Determine date grouping format
//     let dateFormat: string;
//     let groupStage: any;

//     switch (groupBy) {
//       case "day":
//         dateFormat = "%Y-%m-%d";
//         groupStage = {
//           year: { $year: "$createdAt" },
//           month: { $month: "$createdAt" },
//           day: { $dayOfMonth: "$createdAt" },
//         };
//         break;
//       case "week":
//         dateFormat = "%Y-W%U";
//         groupStage = {
//           year: { $year: "$createdAt" },
//           week: { $week: "$createdAt" },
//         };
//         break;
//       case "month":
//         dateFormat = "%Y-%m";
//         groupStage = {
//           year: { $year: "$createdAt" },
//           month: { $month: "$createdAt" },
//         };
//         break;
//     }

//     const pipeline: PipelineStage[] = [
//       {
//         $match: {
//           isDeleted: false,
//           createdAt: { $gte: startDate, $lte: endDate },
//           $or: [{ createdBy: userObjectId }, { assignedTo: userObjectId }],
//         },
//       },
//       {
//         $group: {
//           _id: groupStage,
//           total: { $sum: 1 },
//           todo: {
//             $sum: { $cond: [{ $eq: ["$status", TaskStatus.TODO] }, 1, 0] },
//           },
//           inProgress: {
//             $sum: {
//               $cond: [{ $eq: ["$status", TaskStatus.IN_PROGRESS] }, 1, 0],
//             },
//           },
//           completed: {
//             $sum: { $cond: [{ $eq: ["$status", TaskStatus.COMPLETED] }, 1, 0] },
//           },
//           cancelled: {
//             $sum: { $cond: [{ $eq: ["$status", TaskStatus.CANCELLED] }, 1, 0] },
//           },
//         },
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
//     ];

//     const trends = await Task.aggregate(pipeline);

//     // Format the results
//     const formattedTrends: ITaskTrendPoint[] = trends.map((item) => {
//       let date: string;
//       if (groupBy === "day") {
//         date = `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`;
//       } else if (groupBy === "week") {
//         date = `${item._id.year}-W${String(item._id.week).padStart(2, "0")}`;
//       } else {
//         date = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
//       }

//       return {
//         date,
//         count: item.total,
//         total: item.total,
//         todo: item.todo,
//         inProgress: item.inProgress,
//         completed: item.completed,
//         cancelled: item.cancelled,
//       };
//     });

//     return formattedTrends;
//   }

  async getTasksForExport(
    userId: string,
    filters?: any,
    includeComments: boolean = true,
    includeFiles: boolean = true,
  ): Promise<any[]> {
    const userObjectId = new Types.ObjectId(userId);

    // Build query
    const query: any = {
      isDeleted: false,
      $or: [{ createdBy: userObjectId }, { assignedTo: userObjectId }],
    };

    // Apply additional filters
    if (filters) {
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.assignedTo)
        query.assignedTo = new Types.ObjectId(filters.assignedTo);
      if (filters.dueDateFrom || filters.dueDateTo) {
        query.dueDate = {};
        if (filters.dueDateFrom)
          query.dueDate.$gte = new Date(filters.dueDateFrom);
        if (filters.dueDateTo) query.dueDate.$lte = new Date(filters.dueDateTo);
      }
      if (filters.createdAtFrom || filters.createdAtTo) {
        query.createdAt = {};
        if (filters.createdAtFrom)
          query.createdAt.$gte = new Date(filters.createdAtFrom);
        if (filters.createdAtTo)
          query.createdAt.$lte = new Date(filters.createdAtTo);
      }
    }

    // Get tasks with populated fields
    let tasksQuery = Task.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    const tasks = await tasksQuery.lean();

    // If include comments or files, fetch them
    const enrichedTasks = await Promise.all(
      tasks.map(async (task: any) => {
        const enrichedTask = {
          ...task,
          _id: task._id.toString(),
          createdBy: task.createdBy
            ? {
                id: task.createdBy._id.toString(),
                name: task.createdBy.name,
                email: task.createdBy.email,
              }
            : null,
          assignedTo: task.assignedTo
            ? {
                id: task.assignedTo._id.toString(),
                name: task.assignedTo.name,
                email: task.assignedTo.email,
              }
            : null,
        };

        if (includeComments) {
          const comments = await Comment.find({
            taskId: task._id,
            isDeleted: false,
          })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 })
            .lean();

          enrichedTask.comments = comments.map((c: any) => ({
            _id: c._id.toString(),
            content: c.content,
            createdBy: c.createdBy
              ? {
                  id: c.createdBy._id.toString(),
                  name: c.createdBy.name,
                  email: c.createdBy.email,
                }
              : null,
            createdAt: c.createdAt,
          }));
        }

        if (includeFiles) {
          const files = await File.find({
            task: task._id,
            isDeleted: false,
          })
            .populate("uploadedBy", "name email")
            .lean();

          enrichedTask.files = files.map((f: any) => ({
            _id: f._id.toString(),
            filename: f.filename,
            originalName: f.originalName,
            fileType: f.fileType,
            mimeType: f.mimeType,
            size: f.size,
            fileUrl: f.fileUrl,
            uploadedBy: f.uploadedBy
              ? {
                  id: f.uploadedBy._id.toString(),
                  name: f.uploadedBy.name,
                  email: f.uploadedBy.email,
                }
              : null,
            createdAt: f.createdAt,
          }));
        }

        return enrichedTask;
      }),
    );

    return enrichedTasks;
  }

  async getTaskCompletionRate(
    userId: string,
    days: number = 30,
  ): Promise<number> {
    const userObjectId = new Types.ObjectId(userId);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const stats = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          assignedTo: userObjectId, // Only tasks assigned to user
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", TaskStatus.COMPLETED] }, 1, 0] },
          },
        },
      },
    ]);

    if (stats.length === 0 || stats[0].total === 0) {
      return 0;
    }

    return (stats[0].completed / stats[0].total) * 100;
  }

  async getAverageTaskCompletionTime(userId: string): Promise<number> {
    const userObjectId = new Types.ObjectId(userId);

    const stats = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          status: TaskStatus.COMPLETED,
          assignedTo: userObjectId, // Only tasks assigned to user
          createdAt: { $exists: true },
          updatedAt: { $exists: true },
        },
      },
      {
        $project: {
          completionTime: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 60 * 60, // Hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$completionTime" },
        },
      },
    ]);

    return stats.length > 0 ? Math.round(stats[0].avgTime * 100) / 100 : 0;
  }

  async getOverdueTasksCount(userId: string): Promise<number> {
    const userObjectId = new Types.ObjectId(userId);

    return await Task.countDocuments({
      isDeleted: false,
      status: { $ne: TaskStatus.COMPLETED },
      dueDate: { $lt: new Date() },
      assignedTo: userObjectId, // Only tasks assigned to user
    });
  }

  async getTasksByAssignee(userId: string): Promise<any[]> {
    const userObjectId = new Types.ObjectId(userId);

    return await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          $or: [{ createdBy: userObjectId }, { assignedTo: userObjectId }],
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", TaskStatus.COMPLETED] }, 1, 0] },
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ["$status", TaskStatus.IN_PROGRESS] }, 1, 0],
            },
          },
          todo: {
            $sum: { $cond: [{ $eq: ["$status", TaskStatus.TODO] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          userName: "$user.name",
          userEmail: "$user.email",
          totalTasks: "$total",
          completedTasks: "$completed",
          inProgressTasks: "$inProgress",
          pendingTasks: "$todo",
        },
      },
    ]);
  }

  async getActivitySummary(userId: string, days: number = 7): Promise<any> {
    const userObjectId = new Types.ObjectId(userId);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [tasksCreated, tasksCompleted, commentsAdded, filesUploaded] =
      await Promise.all([
        // Tasks created by user
        Task.countDocuments({
          isDeleted: false,
          createdBy: userObjectId,
          createdAt: { $gte: startDate },
        }),

        // Tasks completed by user (where user is assigned)
        Task.countDocuments({
          isDeleted: false,
          status: TaskStatus.COMPLETED,
          assignedTo: userObjectId, // Only count completions of assigned tasks
          updatedAt: { $gte: startDate },
        }),

        // Comments added by user
        Comment.countDocuments({
          isDeleted: false,
          createdBy: userObjectId,
          createdAt: { $gte: startDate },
        }),

        // Files uploaded by user
        File.countDocuments({
          isDeleted: false,
          uploadedBy: userObjectId,
          createdAt: { $gte: startDate },
        }),
      ]);

    return {
      period: `${days} days`,
      startDate,
      tasksCreated,
      tasksCompleted,
      commentsAdded,
      filesUploaded,
      totalActivities:
        tasksCreated + tasksCompleted + commentsAdded + filesUploaded,
    };
  }
}
