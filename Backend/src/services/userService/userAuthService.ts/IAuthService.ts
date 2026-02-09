import { IUser } from '../../../models/userModel';
import { ITokenPair } from '../../jwtService/IJwtService'; 

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

export interface IAuthService {
  register(data: IRegisterDTO): Promise<void>; // Returns void - no tokens
  login(data: ILoginDTO): Promise<IAuthResponse>; // Returns user + tokens
  refreshToken(refreshToken: string): Promise<ITokenPair>;
  getCurrentUser(userId: string): Promise<IUser>;
}