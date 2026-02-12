// src/services/userService/userAuthService/userService.ts

import { IUserRepository } from '../../../repositories/userRepo/userAuthRepo/IuserAuthRepo';
import { IUserService, IUserSearchResult } from './IUserService';
import { IUser } from '../../../models/userModel';
import { AppError } from '../../../utils/errorUtil/appError';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async searchUsers(query: string, excludeUserId: string): Promise<IUserSearchResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const users = await this.userRepository.searchUsers(query, excludeUserId);
    
    return users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }));
  }

  async getAllActiveUsers(excludeUserId: string): Promise<IUserSearchResult[]> {
    const users = await this.userRepository.getAllActiveUsers(excludeUserId);
    
    return users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }));
  }

  async getUserById(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}