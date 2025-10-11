import { Link, useSearchParams } from "react-router-dom";
import AuthGoogle from "../components/AuthGoogle";
import useAuth from "../hooks/useAuth";
import { useState } from "react";
import Alerta from "../components/Alerta";

export default function Login() {
  const { handleLogin } = useAuth();

  // 3. Crea estados locales para los campos del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState([]); // Estado para guardar los errores de validación
  const [searchParams] = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores([]);
    try {
      await handleLogin({ email, password });
      // Si tiene éxito, redirige
      //console.log(data);
    } catch (error) {
      console.log(error);
      if (error.response) {
        // CASO 1: Error de Validación de Laravel (422)
        if (error.response.status === 422) {
          // La respuesta contiene un objeto 'errors' con detalles por campo
          console.log('entro al error 422')
          setErrores(Object.values(error.response.data.errors));
        }
        // CASO 2: Error de Credenciales Incorrectas (401)
        else if (error.response.status === 401) {
          console.log('entro error 401')
          // La respuesta contiene un objeto con una clave 'message'
          setErrores(Object.values({error: error.response.data.message}));
        }
        // OTROS CASOS: Errores del servidor (500), etc.
        else {
          setErrores(
            Object.values({
              error: "Ocurrió un error inesperado. Intenta de nuevo.",
            })
          );
        }
      } else {
        // Si no hay 'error.response', fue un problema de red
        setErrores(
          Object.values({ error: "No se pudo conectar con el servidor." })
        );
      }
    }
    setPassword("");
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center">Iniciar Sesion</h1>
      {isVerified && (
        <div className="p-4 my-4 text-sm text-green-700 bg-green-100 rounded-lg">
          ¡Cuenta verificada con éxito! Ya puedes iniciar sesión.
        </div>
      )}
      <p className="text-center">Ingresa tu email y contraseña o con google</p>

      <div className="bg-white shadow-md rounded-md mt-10 px-5 py-10">
        <form noValidate onSubmit={handleSubmit}>
          {errores
            ? errores.map((error, i) => <Alerta key={i}> {error} </Alerta>)
            : null}
          <div className="mb-4">
            <label htmlFor="email" className="text-slate-800">
              Email:
            </label>
            <input
              type="email"
              placeholder="Tu email"
              id="email"
              className="mt-2 w-full p-3 bg-gray-50"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="text-slate-800">
              Password:
            </label>
            <input
              type="password"
              placeholder="Tu password"
              id="password"
              className="mt-2 w-full p-3 bg-gray-50"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <input
            type="submit"
            value="Iniciar Sesion"
            className="bg-indigo-600 hover:bg-indigo-800 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer"
          />
        </form>
        <AuthGoogle></AuthGoogle>
      </div>
      <nav className="mt-5 flex flex-col md:flex-row gap-3">
        <Link to="/auth/crear-cuenta"  className="text-sm text-gray-600 hover:underline mt-2">¿No Tienes cuenta? Crea Una</Link>
        <Link to="/auth/forgot-password"  className= "text-sm text-gray-600 hover:underline mt-2">¿Olvidaste tu contraseña?</Link>
      </nav>
    </>
  );
}
