import { Request, Response, NextFunction } from 'express';
import { IJwtService } from '../services/jwtService/IJwtService';
import { IUserRepository } from '../repositories/userRepo/userAuthRepo/IuserAuthRepo'; 
import { AppError } from '../utils/errorUtil/appError';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
   multerFilenames?: Array<{
    originalName: string;
    filename: string;
    timestamp: number;
  }>;
}

export interface IAuthMiddleware {
  authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  authorizeRoles(...roles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
}

export class AuthMiddleware implements IAuthMiddleware {
  constructor(
    private jwtService: IJwtService,
    private userRepository: IUserRepository
  ) {}

  authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Read access token from cookie instead of Authorization header
      const accessToken = req.cookies?.accessToken;

      if (!accessToken) {
        throw new AppError('No token provided', 401);
      }

      try {
        // Try to verify the access token
        const payload = this.jwtService.verifyAccessToken(accessToken);

        // Verify user still exists and is active
        const user = await this.userRepository.findById(payload.userId);
        if (!user || !user.isActive) {
          throw new AppError('User not found or inactive', 401);
        }

        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        };

        next();
      } catch (accessTokenError) {
        // Access token is invalid or expired, try to refresh using refresh token from cookie
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
          throw new AppError('Access token expired and no refresh token provided', 401);
        }

        try {
          // Verify refresh token
          const refreshPayload = this.jwtService.verifyRefreshToken(refreshToken);

          // Verify user still exists and is active
          const user = await this.userRepository.findById(refreshPayload.userId);
          if (!user || !user.isActive) {
            throw new AppError('User not found or inactive', 401);
          }

          // Generate new access token
          const newAccessToken = this.jwtService.generateAccessToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
          });

          // Set new access token in cookie
          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
          });

          // Attach user to request
          req.user = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
          };

          next();
        } catch (refreshTokenError) {
          // Both tokens are invalid - clear all cookies
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
          throw new AppError('Invalid or expired tokens. Please login again.', 401);
        }
      }
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Authentication failed',
        });
      }
    }
  };

  authorizeRoles = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: Insufficient permissions',
        });
        return;
      }

      next();
    };
  };
}