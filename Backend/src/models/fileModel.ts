// src/models/fileModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  PDF = 'pdf',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

export interface IFile extends Document {
  filename: string;
  originalName: string;
  fileUrl: string;
  fileType: FileType;
  mimeType: string;
  size: number;

  // Polymorphic references — at most one should be set
  task?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;

  uploadedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: Object.values(FileType),
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },

    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },

    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
  }
);

// Mutual exclusivity check (task XOR comment)
fileSchema.pre('validate', function (next) {
  // Use type assertion so TypeScript knows this is a Document with invalidate()
  const doc = this as IFile & { invalidate: (path: string, message: string) => void };

  const hasTask    = !!doc.task;
  const hasComment = !!doc.comment;

  if (hasTask === hasComment) { // both missing OR both present
    if (!hasTask) {
      doc.invalidate('task', 'Either task or comment reference is required');
    } else {
      doc.invalidate('task', 'Cannot reference both task and comment at the same time');
      // You can also invalidate('comment', '...') if you prefer
    }
  }

  next();
});

// Indexes for better query performance
fileSchema.index({ task: 1, isDeleted: 1 });
fileSchema.index({ comment: 1, isDeleted: 1 });
fileSchema.index({ uploadedBy: 1, isDeleted: 1 });
fileSchema.index({ fileType: 1, isDeleted: 1 });
fileSchema.index({ createdAt: -1 });

export const File = mongoose.model<IFile>('File', fileSchema);