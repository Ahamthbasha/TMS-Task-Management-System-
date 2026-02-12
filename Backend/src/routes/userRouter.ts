import { Router } from "express";
import { authMiddleware, userAnalyticController, userCommentController, userController, userFileController, userTaskController } from "../config/dependencyInjector/userDI/userDI";
import { loginValidation, registerValidation, validateRequest } from "../validationMiddleware.ts/validationMiddleware";
import { bulkCreateTasksValidation, createTaskValidation, getTasksQueryValidation, updateTaskValidation } from "../validationMiddleware.ts/taskValidators";
import { createCommentValidation, deleteCommentValidation, getCommentsValidation, updateCommentValidation } from "../validationMiddleware.ts/commentValidator";
import { upload } from "../middlewares/uploadMiddleware";
import { commentIdValidation, fileIdValidation, taskIdValidation, uploadFileValidation } from "../validationMiddleware.ts/fileValidator";
import { downloadFileValidation, exportTasksValidation, taskTrendsValidation, userPerformanceValidation } from "../validationMiddleware.ts/analyticsValidator";

const router = Router();

// ==================== USER ROUTES ====================
router.post('/register', registerValidation, validateRequest, userController.register);
router.post('/login', loginValidation, validateRequest, userController.login);
router.post('/logout', authMiddleware.authenticate, userController.logout);
router.get('/profile', authMiddleware.authenticate, userController.getCurrentUser);

// 

router.get('/users/search', 
  authMiddleware.authenticate, 
  userController.searchUsers  // ✅ Controller -> Service -> Repository
);

router.get('/users/all', 
  authMiddleware.authenticate, 
  userController.getAllUsers  // ✅ Controller -> Service -> Repository
);


// ==================== TASK ROUTES ====================
router
  .route("/tasks")
  .post(
    authMiddleware.authenticate,
    upload.array('files'),
    createTaskValidation,
    validateRequest,
    userTaskController.createTask
  )
  .get(
    authMiddleware.authenticate,
    getTasksQueryValidation,
    validateRequest,
    userTaskController.getTasks
  );

router.post(
  '/tasks/bulk',
  authMiddleware.authenticate,
  bulkCreateTasksValidation,
  validateRequest,
  userTaskController.bulkCreateTasks
);

router
  .route('/tasks/:taskId')
  .get(authMiddleware.authenticate, userTaskController.getTaskById)
  .put(
    authMiddleware.authenticate,
    updateTaskValidation,
    validateRequest,
    userTaskController.updateTask
  )
  .delete(authMiddleware.authenticate, userTaskController.deleteTask);

// ==================== COMMENT ROUTES ====================
// Regular comment creation (without files)
router.post(
  '/comments',
  authMiddleware.authenticate,
  createCommentValidation,
  validateRequest,
  userCommentController.createComment
);

// Comment creation with files
router.post(
  '/comments/with-files',
  authMiddleware.authenticate,
  upload.array('files'),
  createCommentValidation,
  validateRequest,
  userCommentController.createCommentWithFiles // Use the new controller method
);

router
  .route('/comments/task/:taskId')
  .get(
    authMiddleware.authenticate,
    getCommentsValidation,
    validateRequest,
    userCommentController.getCommentsByTaskId
  );

router
  .route('/comments/:commentId')
  .get(authMiddleware.authenticate, userCommentController.getCommentById)
  .put(
    authMiddleware.authenticate,
    updateCommentValidation,
    validateRequest,
    userCommentController.updateComment
  )
  .delete(
    authMiddleware.authenticate,
    deleteCommentValidation,
    validateRequest,
    userCommentController.deleteComment
  );

// ==================== FILE ROUTES ====================
// Single file upload (for adding files to existing tasks/comments)
router.post(
  '/files/upload',
  authMiddleware.authenticate,
  upload.single('file'),
  uploadFileValidation,
  validateRequest,
  userFileController.uploadFile
);


// File operations
router.get(
  '/files/:fileId',
  authMiddleware.authenticate,
  fileIdValidation,
  validateRequest,
  userFileController.getFile
);

router.get(
  '/files/:fileId/download',
  authMiddleware.authenticate,
  fileIdValidation,
  validateRequest,
  userFileController.downloadFile
);

// Task file operations
router.get(
  '/tasks/:taskId/files',
  authMiddleware.authenticate,
  taskIdValidation,
  validateRequest,
  userFileController.getTaskFiles
);

router.get(
  '/tasks/:taskId/all-files',
  authMiddleware.authenticate,
  taskIdValidation,
  validateRequest,
  userFileController.getAllTaskFiles
);

// Comment file operations
router.get(
  '/comments/:commentId/files',
  authMiddleware.authenticate,
  commentIdValidation,
  validateRequest,
  userFileController.getCommentFiles
);

// File deletion
router.delete(
  '/files/:fileId',
  authMiddleware.authenticate,
  fileIdValidation,
  validateRequest,
  userFileController.deleteFile
);

/////////////////////////////////////


router.get(
  '/overview',
  authMiddleware.authenticate,
  userAnalyticController.getTaskOverviewStats
);

router.get(
  '/userPerformance',
  authMiddleware.authenticate,
  userPerformanceValidation,
  validateRequest,
  userAnalyticController.getUserPerformanceMetrics
);

router.get(
  '/taskTrends',
  authMiddleware.authenticate,
  taskTrendsValidation,
  validateRequest,
  userAnalyticController.getTaskTrendsOverTime
);

router.get(
  '/export',
  authMiddleware.authenticate,
  exportTasksValidation,
  validateRequest,
  userAnalyticController.exportTasksData
);

router.get(
  '/export/download/:filename',
  authMiddleware.authenticate,
  downloadFileValidation,
  validateRequest,
  userAnalyticController.downloadExportedFile
);

router.get(
  '/dashboard',
  authMiddleware.authenticate,
  userAnalyticController.getDashboardStats
);

export default router;