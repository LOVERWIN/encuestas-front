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
  const [, setToken] = useState(localStorage.getItem("AUTH_TOKEN"));
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
    localStorage.getItem("AUTH_TOKEN") ? "/user" : null, // <-- LA CLAVE DE LA OPTIMIZACIÓN
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  const handleLogin = useCallback (async (datos) => {
    const response = await loginService(datos);
    localStorage.setItem("AUTH_TOKEN", response.data.token);
    setToken(response.data.token);
    console.log('desde metodologin: '+localStorage.getItem("AUTH_TOKEN"));
    mutate();
  },[mutate]);

 const handleRegister = async (datos) => {
    const response = await registerService(datos);
    return response.data;
  };

  const handleLogout = useCallback (async () => {
    await logoutService();
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem('redirect_after_login');
    localStorage.setItem('logged_out_flag', 'true');
    setToken(null);
    sessionStorage.removeItem('chatSessionId');
    sessionStorage.removeItem('chatMessages');
    mutate(null);
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
