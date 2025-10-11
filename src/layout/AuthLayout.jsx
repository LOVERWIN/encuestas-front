import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function AuthLayout() {
  //Verificamos autentication para validar las rutas
  const { user, error, isLoading } = useAuth();
  const location = useLocation(); // Obtiene la información de la ruta

  // Este useEffect se encargará de redirigir a los usuarios logueados
  // 1. Esperamos a saber si hay usuario o no
  if (isLoading) {
    return <p className="text-center mt-20">Cargando...</p>;
  }

  if (user) {
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
