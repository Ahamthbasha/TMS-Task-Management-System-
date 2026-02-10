// types/interface/fileInterface.ts

// FileType constants object
export const FileType = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  PDF: 'pdf',
  SPREADSHEET: 'spreadsheet',
  PRESENTATION: 'presentation',
  ARCHIVE: 'archive',
  OTHER: 'other',
} as const;

// FileType type - extract the values from the FileType object
export type FileType = typeof FileType[keyof typeof FileType];

export interface IPopulatedFileUser {
  _id: string;
  name: string;
  email: string;
}

export interface IFile {
  _id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  task?: string;
  comment?: string;
  uploadedBy: IPopulatedFileUser;
  isDeleted: boolean;
  deletedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IUploadFileDTO {
  file: File;
  taskId?: string;
  commentId?: string;
}

export interface IUploadFileResponse {
  success: boolean;
  message: string;
  data: IFile;
}

export interface IGetFilesResponse {
  success: boolean;
  message: string;
  data: IFile[];
}

export interface IDeleteFileResponse {
  success: boolean;
  message: string;
  data: null;
}

// File type detection helpers
export const getFileTypeFromMime = (mimeType: string): FileType => {
  if (mimeType.startsWith('image/')) return FileType.IMAGE;
  if (mimeType === 'application/pdf') return FileType.PDF;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileType.SPREADSHEET;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return FileType.PRESENTATION;
  if (mimeType.includes('document') || mimeType.includes('word')) return FileType.DOCUMENT;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return FileType.ARCHIVE;
  return FileType.OTHER;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType: FileType): string => {
  switch (fileType) {
    case FileType.IMAGE:
      return '🖼️';
    case FileType.PDF:
      return '📄';
    case FileType.DOCUMENT:
      return '📝';
    case FileType.SPREADSHEET:
      return '📊';
    case FileType.PRESENTATION:
      return '📽️';
    case FileType.ARCHIVE:
      return '📦';
    default:
      return '📎';
  }
};