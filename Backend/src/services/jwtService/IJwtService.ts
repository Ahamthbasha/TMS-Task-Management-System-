export interface IJwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IJwtService {
  generateAccessToken(payload: IJwtPayload): string;
  generateRefreshToken(payload: IJwtPayload): string;
  generateTokenPair(payload: IJwtPayload): ITokenPair;
  verifyAccessToken(token: string): IJwtPayload;
  verifyRefreshToken(token: string): IJwtPayload;
}
