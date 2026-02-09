import mongoose, { Schema, Document, Types } from "mongoose";
import { IFile } from "./fileModel";

export interface IComment extends Document {
  content: string;
  taskId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  files?: IFile[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment must be at least 1 character long"],
      maxlength: [2000, "Comment must not exceed 2000 characters"],
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
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
commentSchema.index({ taskId: 1, isDeleted: 1 });
commentSchema.index({ createdBy: 1, isDeleted: 1 });
commentSchema.index({ createdAt: -1 });

// Compound index for common queries
commentSchema.index({ taskId: 1, createdAt: -1, isDeleted: 1 });

commentSchema.virtual("files", {
  ref: "File",
  localField: "_id",
  foreignField: "comment",
  match: { isDeleted: false },
});

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
