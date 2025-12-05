import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useRef } from "react";

export default function AuthLayout() {
  //Verificamos autentication para validar las rutas
  const { user, isLoading } = useAuth();
  const location = useLocation(); // Obtiene la información de la ruta
  const redirectHandled = useRef(false);

  // Este useEffect se encargará de redirigir a los usuarios logueados
  // 1. Esperamos a saber si hay usuario o no
  if (isLoading) {
    return <p className="text-center mt-20">Cargando...</p>;
  }

  if (user) {
    const loggedOutFlag = localStorage.getItem('logged_out_flag');
    if (loggedOutFlag && !redirectHandled.current) {
      localStorage.removeItem('logged_out_flag');
      redirectHandled.current = true;
      return <Navigate to="/" replace />;
    }
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  

  return (
    <main className="md:max-w-4xl m-auto mt-10 md:mt-28 flex flex-col md:flex-row items-center">
      <img
        src="../img/SistemaEncuestaLogo.png"
        alt="imagen auth"
        className="max-w-xs md:max-w-sm lg:max-w-md"
      />
      <div className="p-10 w-full">
        <Outlet></Outlet>
      </div>
    </main>
  );
}
