import { IUserRepository } from '../../../repositories/userRepo/userAuthRepo/IuserAuthRepo';  
import { IHashingService } from '../../hashService/IHashService';
import { IJwtService, ITokenPair } from '../../jwtService/IJwtService';
import { IUser } from '../../../models/userModel';
import { IAuthService } from './IAuthService';
import { AppError } from '../../../utils/errorUtil/appError';

export interface IRegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  tokens: ITokenPair;
}

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private hashingService: IHashingService,
    private jwtService: IJwtService
  ) {}

  async register(data: IRegisterDTO): Promise<void> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await this.hashingService.hash(data.password);

    // Create user - NO TOKEN GENERATION
    await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    } as IUser);

    // Return nothing - just successful registration
  }

  async login(data: ILoginDTO): Promise<IAuthResponse> {
    // Find user with password
    const user = await this.userRepository.findByEmailWithPassword(data.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await this.hashingService.compare(
      data.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<ITokenPair> {
    // Verify refresh token
    const payload = this.jwtService.verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    // Generate new token pair
    return this.jwtService.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  }

  async getCurrentUser(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}