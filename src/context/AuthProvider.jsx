// src/context/AuthProvider.js
import { createContext, useCallback, useState } from "react";
import {
  register as registerService,
  login as loginService,
  logout as logoutService,
} from "../services/authService";
import apiClient from "../config/axios";
import useSWR from "swr";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  // 1. Usar useState para que el token sea reactivo
  const [token, setToken] = useState(localStorage.getItem("AUTH_TOKEN"));
  //const token = localStorage.getItem("AUTH_TOKEN");
  // Define el "fetcher" que SWR usará para obtener los datos
  const fetcher = (url) =>
    apiClient(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("AUTH_TOKEN")}`,
      },
    }).then((res) => res.data);

  // Hook de SWR con la clave condicional
  const {
    data: user,
    error,
    mutate,
  } = useSWR(
    localStorage.getItem("AUTH_TOKEN") ? "/api/user" : null, // <-- LA CLAVE DE LA OPTIMIZACIÓN
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  const handleLogin = useCallback (async (datos) => {
    try {
      const data = await loginService(datos);
      localStorage.setItem("AUTH_TOKEN", data.token);
      setToken(data.token);
      console.log('desde metodologin: '+localStorage.getItem("AUTH_TOKEN"));
      mutate();
    } catch (error) {
      throw error;
    }
  },[mutate]);

 const handleRegister = async (datos) => {
    try {
      // Llamamos al servicio, pero ya no guardamos token ni hacemos mutate.
      // Solo nos interesa saber si la petición fue exitosa.
      const response = await registerService(datos);
      return response; // Devuelve el mensaje de éxito (ej. "¡Registro exitoso!...")
    } catch (error) {
      // Si hay un error de validación, lo lanzamos para que el formulario lo muestre.
      throw error;
    }
  };

  const handleLogout = useCallback (async () => {
    try {
      await logoutService();
      localStorage.removeItem("AUTH_TOKEN");
      setToken(null);
      mutate(null);
    } catch (error) {
      throw error;
    }
  },[mutate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        mutate,
        handleLogin,
        handleRegister,
        handleLogout,
        setToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext;
