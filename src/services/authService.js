// src/services/authService.js
import apiClient from "../config/axios";

export const register = async (datos) => {
  try {
    const response = await apiClient.post("/api/register", datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (datos) => {
  try {
    const response = await apiClient.post("/api/login", datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    // Ya no necesitas las cabeceras aquí, el interceptor lo hace por ti.
    const response = await apiClient.post("/api/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = (email) => {
  return apiClient.post('/api/forgot-password', { email });
};

export const resetPassword = (datos) => {
  return apiClient.post('/api/reset-password', datos);
};

