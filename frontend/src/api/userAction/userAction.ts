// api/userAction/userAction.ts

import { API } from "../../service/axios";
import userRouterEndPoints from "../../endpoints/userEndpoint";
import type {
  ICreateTaskDTO,
  IUpdateTaskDTO,
  IGetTasksQueryParams,
  IBulkCreateTasksDTO,
  TaskApiResponse,
  ITask,
  IPaginatedTasks,
} from "../../types/interface/taskInterface";

import type {
  ICreateCommentDTO,
  IUpdateCommentDTO,
  IGetCommentsParams,
  CommentApiResponse,
  IComment,
  IPaginatedComments,
} from "../../types/interface/commentInterface";
import type {
  IDeleteFileResponse,
  IFile,
  IGetFilesResponse,
  IUploadFileDTO,
  IUploadFileResponse,
} from "../../types/interface/fileInterface";


// Helper to create FormData for task creation with files

const createTaskFormData = (data: ICreateTaskDTO, files?: File[]): FormData => {
  const formData = new FormData();
  
  // Append task data
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.status) formData.append('status', data.status);
  if (data.priority) formData.append('priority', data.priority);
  if (data.dueDate) formData.append('dueDate', data.dueDate as string);
  if (data.assignedTo) formData.append('assignedTo', data.assignedTo);
  
  // Append tags as individual items
  if (data.tags && data.tags.length > 0) {
    data.tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);  // ✅ This creates an array
    });
  }
  
  // Append files if any
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  }
  
  return formData;
};

// Create task with optional files
export const createTask = async (
  data: ICreateTaskDTO,
  files?: File[]
): Promise<TaskApiResponse<ITask & { files?: IFile[] }>> => {
  const formData = createTaskFormData(data, files);
  
  const response = await API.post(userRouterEndPoints.userCreateTask, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};



export const getTasks = async (
  params?: IGetTasksQueryParams,
): Promise<TaskApiResponse<IPaginatedTasks>> => {
  const response = await API.get(userRouterEndPoints.userGetTasks, { params });
  return response.data;
};

export const getTaskById = async (
  taskId: string,
): Promise<TaskApiResponse<ITask>> => {
  const response = await API.get(
    `${userRouterEndPoints.userGetTaskById}/${taskId}`,
  );
  return response.data;
};

export const updateTask = async (
  taskId: string,
  data: IUpdateTaskDTO,
): Promise<TaskApiResponse<ITask>> => {
  const response = await API.put(
    `${userRouterEndPoints.userUpdateTask}/${taskId}`,
    data,
  );
  return response.data;
};

export const deleteTask = async (
  taskId: string,
): Promise<TaskApiResponse<void>> => {
  const response = await API.delete(
    `${userRouterEndPoints.userUpdateTask}/${taskId}`,
  );
  return response.data;
};

export const bulkCreateTasks = async (
  data: IBulkCreateTasksDTO,
): Promise<TaskApiResponse<ITask[]>> => {
  const response = await API.post(userRouterEndPoints.userBulkTask, data);
  return response.data;
};

// export const createCommentWithFiles = async (
//   data: ICreateCommentDTO,
//   files?: File[]
// ): Promise<CommentApiResponse<IComment & { files?: IFile[] }>> => {
//   const formData = new FormData();
//   formData.append('content', data.content);
//   formData.append('taskId', data.taskId);
  
//   // Append files if any
//   if (files && files.length > 0) {
//     files.forEach((file) => {
//       formData.append('files', file);
//     });
//   }
  
//   const response = await API.post(
//     userRouterEndPoints.userCreateCommentWithFiles,
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     }
//   );
//   return response.data;
// };

export const createComment = async (
  data: ICreateCommentDTO,
): Promise<CommentApiResponse<IComment>> => {
  console.log("API: createComment called with:", data);
  try {
    const response = await API.post(
      userRouterEndPoints.userCreateComment,
      data,
    );
    console.log("API: createComment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API: createComment error:", error);
    throw error;
  }
};

export const getCommentsByTaskId = async (
  taskId: string,
  params?: IGetCommentsParams,
): Promise<CommentApiResponse<IPaginatedComments>> => {
  console.log("API: getCommentsByTaskId called with:", { taskId, params });
  try {
    const response = await API.get(
      `${userRouterEndPoints.userGetComments}/${taskId}`,
      { params },
    );
    return response.data;
  } catch (error) {
    console.error("API: getCommentsByTaskId error:", error);
    throw error;
  }
};

export const getCommentById = async (
  commentId: string,
): Promise<CommentApiResponse<IComment>> => {
  console.log("API: getCommentById called with:", commentId);
  try {
    const response = await API.get(
      `${userRouterEndPoints.userGetCommentById}/${commentId}`,
    );
    return response.data;
  } catch (error) {
    console.error("API: getCommentById error:", error);
    throw error;
  }
};

export const updateComment = async (
  commentId: string,
  data: IUpdateCommentDTO,
): Promise<CommentApiResponse<IComment>> => {
  console.log("API: updateComment called with:", { commentId, data });
  try {
    const response = await API.put(
      `${userRouterEndPoints.userUpdateComment}/${commentId}`,
      data,
    );
    console.log("API: updateComment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API: updateComment error:", error);
    throw error;
  }
};

export const deleteComment = async (
  commentId: string,
): Promise<CommentApiResponse<void>> => {
  console.log("API: deleteComment called with:", commentId);
  try {
    const response = await API.delete(
      `${userRouterEndPoints.userDeleteComment}/${commentId}`,
    );
    return response.data;
  } catch (error) {
    console.error("API: deleteComment error:", error);
    throw error;
  }
};

const createFormData = (data: IUploadFileDTO): FormData => {
  const formData = new FormData();
  formData.append("file", data.file);

  if (data.taskId) {
    formData.append("taskId", data.taskId);
  }

  if (data.commentId) {
    formData.append("commentId", data.commentId);
  }

  return formData;
};

// Upload file
export const uploadFile = async (
  data: IUploadFileDTO,
): Promise<IUploadFileResponse> => {
  const formData = createFormData(data);

  const response = await API.post(
    userRouterEndPoints.userUploadFile,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

// Get single file info
export const getFile = async (fileId: string): Promise<IUploadFileResponse> => {
  const response = await API.get(
    `${userRouterEndPoints.userGetFile}/${fileId}`,
  );
  return response.data;
};


// export const downloadFile = async (fileId: string): Promise<{ blob: Blob; filename: string }> => {
//   const response = await API.get(
//     `${userRouterEndPoints.userDownloadFile}/${fileId}/download`,
//     {
//       responseType: "blob",
//     },
//   );
  
//   // Extract filename from content-disposition header
//   let filename = `file-${fileId}`;
//   const contentDisposition = response.headers['content-disposition'];
  
//   if (contentDisposition) {
//     const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
//     if (filenameMatch && filenameMatch[1]) {
//       // Remove quotes if present
//       filename = filenameMatch[1].replace(/['"]/g, '');
//       // Decode URI encoded filename
//       try {
//         filename = decodeURIComponent(filename);
//       } catch (e) {
//         console.warn('Failed to decode filename:', e);
//       }
//     }
//   }
  
//   return {
//     blob: response.data,
//     filename
//   };
// };



// Get task files (task-level files only)

// api/userAction/userAction.ts - Updated downloadFile function
export const downloadFile = async (fileId: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await API.get(
    `${userRouterEndPoints.userDownloadFile}/${fileId}/download`,
    {
      responseType: "blob",
    },
  );
  
  console.log('Download response headers:', response.headers);
  
  // Extract filename from content-disposition header
  let filename = `file-${fileId}`;
  const contentDisposition = response.headers['content-disposition'];
  
  console.log('Content-Disposition header:', contentDisposition);
  
  if (contentDisposition) {
    // Try multiple patterns to extract filename
    let extractedFilename: string | null = null;
    
    // Pattern 1: filename="something"
    const pattern1 = /filename="([^"]+)"/i;
    const match1 = contentDisposition.match(pattern1);
    
    // Pattern 2: filename*=UTF-8''something
    const pattern2 = /filename\*=UTF-8''([^;]+)/i;
    const match2 = contentDisposition.match(pattern2);
    
    // Pattern 3: filename=something (without quotes)
    const pattern3 = /filename=([^;]+)/i;
    const match3 = contentDisposition.match(pattern3);
    
    if (match1 && match1[1]) {
      extractedFilename = match1[1];
    } else if (match2 && match2[1]) {
      extractedFilename = decodeURIComponent(match2[1]);
    } else if (match3 && match3[1]) {
      extractedFilename = match3[1].replace(/['"]/g, '');
    }
    
    if (extractedFilename) {
      filename = extractedFilename;
      console.log('Extracted filename:', filename);
    } else {
      console.warn('Could not extract filename from header:', contentDisposition);
    }
  } else {
    console.warn('No Content-Disposition header found');
  }
  
  // Fallback: If still using file-ID format, try to get file info
  if (filename.startsWith('file-')) {
    console.log('Filename still using ID format, trying to get file info...');
    try {
      const fileInfo = await getFile(fileId);
      if (fileInfo.data?.originalName) {
        filename = fileInfo.data.originalName;
        console.log('Got filename from file info API:', filename);
      }
    } catch (error) {
      console.error('Failed to get file info:', error);
    }
  }
  
  return {
    blob: response.data,
    filename
  };
};



export const getTaskFiles = async (
  taskId: string,
): Promise<IGetFilesResponse> => {
  const response = await API.get(
    `${userRouterEndPoints.userGetTaskFiles}/${taskId}/files`,
  );
  return response.data;
};

// Get all task files (including comment files)
export const getAllTaskFiles = async (
  taskId: string,
): Promise<IGetFilesResponse> => {
  const response = await API.get(
    `${userRouterEndPoints.userGetAllTaskFiles}/${taskId}/all-files`,
  );
  return response.data;
};

// Get comment files
export const getCommentFiles = async (
  commentId: string,
): Promise<IGetFilesResponse> => {
  const response = await API.get(
    `${userRouterEndPoints.userGetCommentFiles}/${commentId}/files`,
  );
  return response.data;
};

// Delete file
export const deleteFile = async (
  fileId: string,
): Promise<IDeleteFileResponse> => {
  const response = await API.delete(
    `${userRouterEndPoints.userDeleteFile}/${fileId}`,
  );
  return response.data;
};

// Helper to get file preview URL
export const getFilePreviewUrl = (file: IFile): string => {
  // In production, this would be a signed URL from cloud storage
  // For now, use the fileUrl from backend
  return file.fileUrl;
};

// Upload multiple files
export const uploadMultipleFiles = async (
  files: IUploadFileDTO[],
): Promise<IUploadFileResponse[]> => {
  const uploadPromises = files.map((file) => uploadFile(file));
  return Promise.all(uploadPromises);
};


// api/userAction/userAction.ts (CORRECTED)
export const createCommentWithFiles = async (
  data: ICreateCommentDTO,
  files: File[]
): Promise<CommentApiResponse<IComment & { files?: IFile[] }>> => {
  const formData = new FormData();
  formData.append('content', data.content);
  formData.append('taskId', data.taskId);
  
  // Append files if any
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  }
  
  console.log('Sending comment with files:', {
    content: data.content,
    taskId: data.taskId,
    fileCount: files.length
  });
  
  const response = await API.post(
    userRouterEndPoints.userCreateCommentWithFiles,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  
  console.log('Response:', response.data);
  return response.data;
};