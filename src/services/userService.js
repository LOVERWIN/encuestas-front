// src/services/userService.js
import apiClient from '../config/axios';

// Esta función ahora enviará el token automáticamente
export const getUsers = (page = 1) => {
  return apiClient.get(`/api/users?page=${page}`);
};

export const createUser = (datosUsuario) => {
  return apiClient.post('api/users', datosUsuario);
};

// Modificamos esta función para que acepte el objeto completo
export const updateUser = (userId, datosUsuario) => {
  return apiClient.put(`api/users/${userId}`, datosUsuario);
};

// Y esta también
export const deleteUser = (userId) => {
  return apiClient.delete(`/api/users/${userId}`);
};