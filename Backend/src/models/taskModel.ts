
import mongoose, { Schema, Document } from "mongoose";
import { IFile } from "./fileModel";

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags?: string[];
  files?: IFile[];
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [200, "Title must not exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must not exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: "Cannot have more than 10 tags",
      },
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
taskSchema.index({ createdBy: 1, isDeleted: 1 });
taskSchema.index({ assignedTo: 1, isDeleted: 1 });
taskSchema.index({ status: 1, isDeleted: 1 });
taskSchema.index({ priority: 1, isDeleted: 1 });
taskSchema.index({ dueDate: 1, isDeleted: 1 });
taskSchema.index({ tags: 1, isDeleted: 1 });
taskSchema.index({ createdAt: -1 });

// Compound index for common queries
taskSchema.index({ createdBy: 1, status: 1, isDeleted: 1 });

taskSchema.virtual("files", {
  ref: "File",
  localField: "_id",
  foreignField: "task",
  match: { isDeleted: false },
});

export const Task = mongoose.model<ITask>("Task", taskSchema);
