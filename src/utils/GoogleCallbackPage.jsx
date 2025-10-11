import { useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation(); // Para recordar a dónde volver
  const { mutate,setToken } = useAuth(); // Obtenemos la función para revalidar de SWR
  const redirectTo = localStorage.getItem('redirect_after_login') || '/';
  useEffect(() => {
    // Creamos una función asíncrona dentro del useEffect
    const processToken = async () => {
      const token = searchParams.get("token");

      if (token) {
        localStorage.setItem("AUTH_TOKEN", token);
        setToken(token);
        // ¡LA CLAVE ESTÁ AQUÍ!
        // ESPERAMOS a que la caché de SWR se actualice con los nuevos datos del usuario.
        mutate();
      // --- CAMBIO CLAVE ---
        // Lee la URL guardada. Si no existe, usa '/' como fallback.

        // Limpia la URL guardada para que no afecte futuros logins
        localStorage.removeItem('redirect_after_login');

        // Redirige al usuario a la página correcta
        navigate(redirectTo, { replace: true });

      } else {
        navigate("/auth/login");
      }
    };

    processToken();
  }, []); // El useEffect en sí no puede ser async, por eso creamos una función interna.

  // Mientras se procesa todo, mostramos un mensaje de carga
  return <p>Autenticando, por favor espera...</p>;
}
