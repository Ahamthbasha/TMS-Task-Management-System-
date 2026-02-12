import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../../../services/userService/userAuthService.ts/IAuthService';
import { IUserService } from '../../../services/userService/userService/IUserService'; 
import { AuthRequest } from '../../../middlewares/authMiddleware';
import { IAuthController } from './IUserAuthController';
import { AppError } from '../../../utils/errorUtil/appError';

export class AuthController implements IAuthController {
  constructor(
    private authService: IAuthService,
    private userService: IUserService 
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      await this.authService.register({ name, email, password });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please login to continue.',
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login({ email, password });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 1000, // 15 minutes
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await this.userService.getUserById(req.user.userId); // ✅ Use UserService

      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ NEW: Search users - uses UserService, NOT repository directly
  searchUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        res.json({
          success: true,
          data: []
        });
        return;
      }

      const users = await this.userService.searchUsers(query, req.user.userId); // ✅ Use UserService

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ NEW: Get all active users - uses UserService, NOT repository directly
  getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const users = await this.userService.getAllActiveUsers(req.user.userId); // ✅ Use UserService

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  };
}