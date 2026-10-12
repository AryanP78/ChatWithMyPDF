import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const register = async (name, email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error has occured" };
  }
};

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email: email,
      password: password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "An unknown error has occured" };
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      profileData,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update profile" };
  }
};

export const changeUserPassword = async (passwordData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwordData,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to change password" };
  }
};

const AuthService = {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
};

export default AuthService;
