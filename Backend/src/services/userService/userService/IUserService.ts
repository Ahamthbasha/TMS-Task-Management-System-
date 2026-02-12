// src/services/userService/userAuthService/IUserService.ts

import { IUser } from '../../../models/userModel';

export interface IUserSearchResult {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface IUserService {
  searchUsers(query: string, excludeUserId: string): Promise<IUserSearchResult[]>;
  getAllActiveUsers(excludeUserId: string): Promise<IUserSearchResult[]>;
  getUserById(userId: string): Promise<IUser>;
}