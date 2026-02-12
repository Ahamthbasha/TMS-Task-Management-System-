// // src/types/user.types.ts

// import type store from "../../redux/store";

 

// export interface LoginCredentials {
//   email: string;
//   password: string;
//   // role?: string;   ← usually not sent during login
// }

// export interface RegisterCredentials {
//   name: string;
//   email: string;
//   password: string;
//   // confirmPassword is validated on frontend — not sent to backend
// }

// export interface AuthUser {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   isActive: boolean;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface AuthResponse {
//   success: boolean;
//   message: string;
//   data: {
//     user: AuthUser;
//     accessToken: string;
//   };
// }

// export interface LogoutResponse {
//   success: boolean;
//   message: string;
// }

// // store/store.ts
// export type RootState = ReturnType<typeof store.getState>;











export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ResendOTPData {
  email: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    expiresIn: number;
  };
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}