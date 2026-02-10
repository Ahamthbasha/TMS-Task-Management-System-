// src/models/fileModel.ts - Updated
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
  filename: string; // Actual stored filename (unique name)
  originalName: string; // Original filename from user
  fileUrl: string; // URL/path to access the file
  storagePath: string; // Physical path on server
  fileType: FileType;
  mimeType: string;
  size: number;

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
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    storagePath: { type: String, required: true }, // NEW FIELD
    fileType: {
      type: String,
      enum: FileType,
      required: true,
    },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 1 },

    task: { type: Schema.Types.ObjectId, ref: 'Task' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Enforce task XOR comment (modern async style)
fileSchema.pre('validate', async function () {
  const hasTask = !!this.task;
  const hasComment = !!this.comment;

  if (hasTask === hasComment) {
    if (!hasTask) {
      throw new Error('Either task or comment reference is required');
    }
    throw new Error('Cannot reference both task and comment at the same time');
  }
});

// Indexes
fileSchema.index({ task: 1, isDeleted: 1 });
fileSchema.index({ comment: 1, isDeleted: 1 });
fileSchema.index({ uploadedBy: 1, isDeleted: 1 });
fileSchema.index({ fileType: 1, isDeleted: 1 });
fileSchema.index({ createdAt: -1 });

export const File = mongoose.model<IFile>('File', fileSchema);