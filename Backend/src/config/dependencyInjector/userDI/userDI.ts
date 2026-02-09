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


const hashService : IHashingService = new HashingService()
const jwtService : IJwtService = new JwtService()

const userRepo : IUserRepository = new UserRepository()
const userService : IAuthService = new AuthService(userRepo,hashService,jwtService)
const userController : IAuthController = new AuthController(userService)

const authMiddleware : IAuthMiddleware = new AuthMiddleware(jwtService,userRepo)

// task

const userTaskRepo : ITaskRepository =  new TaskRepository()
const userTaskService : ITaskService = new TaskService(userTaskRepo,userRepo)

const userTaskController : ITaskController = new TaskController(userTaskService)

// comment

const userCommentRepo : ICommentRepository = new CommentRepository()

const userCommentService : ICommentService = new CommentService(userCommentRepo,userTaskRepo,userRepo)

const userCommentController : ICommentController = new CommentController(userCommentService)



export {
    userController,
    authMiddleware,
    userTaskController,
    userCommentController
}