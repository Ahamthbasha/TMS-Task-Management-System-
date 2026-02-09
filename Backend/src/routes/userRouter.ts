import { Router } from "express";
import { authMiddleware, userCommentController, userController, userTaskController } from "../config/dependencyInjector/userDI/userDI";
import { loginValidation, registerValidation, validateRequest } from "../validationMiddleware.ts/validationMiddleware";
import { bulkCreateTasksValidation, createTaskValidation, getTasksQueryValidation, updateTaskValidation } from "../validationMiddleware.ts/taskValidators";
import { createCommentValidation, deleteCommentValidation, getCommentsValidation, updateCommentValidation } from "../validationMiddleware.ts/commentValidator";


const router = Router()

router.post('/register',registerValidation,validateRequest,userController.register)

router.post('/login',loginValidation,validateRequest,userController.login)

router.post('/logout',authMiddleware.authenticate,userController.logout)

router.get('/profile',authMiddleware.authenticate,userController.getCurrentUser)

router
.route("/task")
.post(authMiddleware.authenticate,createTaskValidation,validateRequest,userTaskController.createTask)
.get(authMiddleware.authenticate,getTasksQueryValidation,validateRequest,userTaskController.getTasks)

router.post('/bulkTask',authMiddleware.authenticate,bulkCreateTasksValidation,validateRequest,userTaskController.bulkCreateTasks)

router
.route('/task/:id')
.get(authMiddleware.authenticate,userTaskController.getTaskById)
.put(authMiddleware.authenticate,updateTaskValidation,validateRequest,userTaskController.updateTask)
.delete(authMiddleware.authenticate,userTaskController.deleteTask)


router
.route('/comments')
.post(authMiddleware.authenticate,createCommentValidation,validateRequest,userCommentController.createComment)

router
  .route('/comments/task/:taskId')
  .get(authMiddleware.authenticate,getCommentsValidation, validateRequest, userCommentController.getCommentsByTaskId)

router
  .route('/comments/:id')
  .get(authMiddleware.authenticate,userCommentController.getCommentById)
  .put(authMiddleware.authenticate, updateCommentValidation, validateRequest, userCommentController.updateComment)
  .delete(authMiddleware.authenticate, deleteCommentValidation, validateRequest, userCommentController.deleteComment)


export default router