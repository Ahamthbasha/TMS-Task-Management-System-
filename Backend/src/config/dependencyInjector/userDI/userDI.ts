import { IUserRepository } from "../../../repositories/userRepo/userAuthRepo/IuserAuthRepo";
import { UserRepository } from "../../../repositories/userRepo/userAuthRepo/userAuthRepo";

import { IHashingService } from "../../../services/hashService/IHashService";
import { HashingService } from "../../../services/hashService/hashService";

import { IJwtService } from "../../../services/jwtService/IJwtService";
import { JwtService } from "../../../services/jwtService/jwtService";

import { IAuthService } from "../../../services/userService/userAuthService.ts/IAuthService"; 
import { AuthService } from "../../../services/userService/userAuthService.ts/authService"; 

import { IAuthController } from "../../../controllers/userController/userAuthController/IUserAuthController";
import { AuthController } from "../../../controllers/userController/userAuthController/userAuthController";

import { IAuthMiddleware } from "../../../middlewares/authMiddleware";
import { AuthMiddleware } from "../../../middlewares/authMiddleware";

import { ITaskRepository } from "../../../repositories/userRepo/taskRepo/IUserTaskRepo";
import { TaskRepository } from "../../../repositories/userRepo/taskRepo/userTaskRepo";
import { ITaskService } from "../../../services/userService/taskService/IUserTaskService";
import { TaskService } from "../../../services/userService/taskService/usertTaskService";
import { ITaskController } from "../../../controllers/userController/taskController/IUserTaskController";
import { TaskController } from "../../../controllers/userController/taskController/userTaskController";

import { ICommentRepository } from "../../../repositories/userRepo/commentRepo/ICommentRepo";
import { CommentRepository } from "../../../repositories/userRepo/commentRepo/commentRepo";
import { ICommentService } from "../../../services/userService/commentService/ICommentService";
import { CommentService } from "../../../services/userService/commentService/commentService";
import { ICommentController } from "../../../controllers/userController/commentController/ICommentController";
import { CommentController } from "../../../controllers/userController/commentController/commentController";

import { IFileRepository } from "../../../repositories/userRepo/fileRepo/IFileRepo";
import { FileRepository } from "../../../repositories/userRepo/fileRepo/fileRepo";
import { IFileService } from "../../../services/userService/FileService/IFileService";
import { FileService } from "../../../services/userService/FileService/fileService";
import { IFileController } from "../../../controllers/userController/fileController/IFileController";
import { FileController } from "../../../controllers/userController/fileController/fileController";

import { IAnalyticsRepository } from "../../../repositories/userRepo/analyticsRepo/IAnalyticsRepo";
import { AnalyticsRepository } from "../../../repositories/userRepo/analyticsRepo/analyticsRepo";
import { IAnalyticsService } from "../../../services/userService/analyticService/IAnalyticService";
import { AnalyticsService } from "../../../services/userService/analyticService/analyticService";
import { IAnalyticsController } from "../../../controllers/userController/analyticController/IAnalyticController";
import { AnalyticsController } from "../../../controllers/userController/analyticController/analyticController";
import { IUserService } from "../../../services/userService/userService/IUserService";
import { UserService } from "../../../services/userService/userService/userService";


const hashService : IHashingService = new HashingService()
const jwtService : IJwtService = new JwtService()

const userRepo : IUserRepository = new UserRepository()
const userService : IAuthService = new AuthService(userRepo,hashService,jwtService)
const userAssignService : IUserService = new UserService(userRepo)
const userController : IAuthController = new AuthController(userService,userAssignService)

const authMiddleware : IAuthMiddleware = new AuthMiddleware(jwtService,userRepo)

// task

const userTaskRepo : ITaskRepository =  new TaskRepository()
const userTaskService : ITaskService = new TaskService(userTaskRepo,userRepo)



// comment

const userCommentRepo : ICommentRepository = new CommentRepository()

const userCommentService : ICommentService = new CommentService(userCommentRepo,userTaskRepo,userRepo)



// file controller

const userFileRepo : IFileRepository = new FileRepository()
const userFileService : IFileService = new FileService(userFileRepo,userTaskRepo,userCommentRepo)
const userFileController : IFileController = new FileController(userFileService)


const userTaskController : ITaskController = new TaskController(userTaskService,userFileService)

const userCommentController : ICommentController = new CommentController(userCommentService,userFileService)

// analytics

const userAnalyticRepo : IAnalyticsRepository = new AnalyticsRepository()
const userAnalyticService : IAnalyticsService = new AnalyticsService(userAnalyticRepo)
const userAnalyticController : IAnalyticsController = new AnalyticsController(userAnalyticService)

export {
    userController,
    authMiddleware,
    userTaskController,
    userCommentController,
    userFileController,
    userAnalyticController
}