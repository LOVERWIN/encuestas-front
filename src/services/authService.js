// src/services/authService.js
import apiClient from "../config/axios";

export const register = (datos) => {
  return apiClient.post("/register", datos);
};

export const login = (datos) => {
  return apiClient.post("/login", datos);
};

export const logout = async () => {
  // Ya no necesitas las cabeceras aquí, el interceptor lo hace por ti.
  return apiClient.post("/logout");
};

export const forgotPassword = (email) => {
  return apiClient.post('/forgot-password', { email });
};

export const resetPassword = (datos) => {
  return apiClient.post('/reset-password', datos);
};

