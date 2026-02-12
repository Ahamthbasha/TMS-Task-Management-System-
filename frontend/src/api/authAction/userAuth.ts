import { API } from "../../service/axios";
import userRouterEndPoints from "../../endpoints/userEndpoint"; 
import type { LoginCredentials, RegisterCredentials } from "../../types/interface/userInterface"; 
export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UserSearchResponse {
  success: boolean;
  data: UserSearchResult[];
}
export const login = async (credentials: LoginCredentials) => {
  const response = await API.post(userRouterEndPoints.userLogin, credentials);
  return response.data;
};

export const registerUser = async (data: RegisterCredentials) => {
  const response = await API.post(userRouterEndPoints.userRegister, data);
  return response.data;
};

export const logout = async () => {
  const response = await API.post(userRouterEndPoints.userLogout, {});
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await API.get(userRouterEndPoints.userProfile);
  return response.data; 
};

export const searchUsers = async (query: string): Promise<UserSearchResponse> => {
  if (!query || query.length < 2) {
    return { success: true, data: [] };
  }
  
  const response = await API.get(userRouterEndPoints.userSearch, {
    params: { query }
  });
  return response.data;
};

export const getAllUsers = async (): Promise<UserSearchResponse> => {
  const response = await API.get(userRouterEndPoints.userAll);
  return response.data;
};