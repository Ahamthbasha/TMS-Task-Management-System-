import { API } from "../../service/axios";
import userRouterEndPoints from "../../endpoints/userEndpoint"; 
import type { LoginCredentials,RegisterCredentials } from "../../types/interface/userInterface"; 

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