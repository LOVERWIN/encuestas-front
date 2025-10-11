import { Link } from "react-router-dom";
import AuthGoogle from "../components/AuthGoogle";
import { useState } from "react";
import Alerta from "../components/Alerta";
import useAuth from "../hooks/useAuth";

export default function Register() {
  const { handleRegister } = useAuth();  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPassword_confirmation] = useState("");
  const [errores,setErrores] = useState([]);
  const [registroExitoso, setRegistroExitoso] = useState(false); // Nuevo estado

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await handleRegister({name,email,password,password_confirmation});
      setRegistroExitoso(true);
      setErrores([]);
    } catch (error) {
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

  }

  return (
    <> 
    {registroExitoso ? (
          <div className="text-center text-green-600">
            <h2 className="text-2xl font-bold">¡Registro Completo!</h2>
            <p className="mt-4">Hemos enviado un enlace de verificación a tu correo electrónico. Por favor, haz clic en él para activar tu cuenta.</p>
          </div>
        ) : (
          <>
      <h1 className="text-4xl font-bold">Crea tu cuenta</h1>
      <p className="text-center">Crea tu cuenta llenando el formulario o con Google</p>

      <div className="bg-white shadow-md rounded-md mt-10 px-5 py-10">
        <form
          onSubmit={handleSubmit}
        >
          {errores ? errores.map((error, i) => <Alerta key={i}>{error}</Alerta>) : null}

          <div className="mb-4">
            <label htmlFor="name" className="text-slate-800">
              Nombre:
            </label>
            <input
              type="text"
              placeholder="Tu nombre"
              id="name"
              className="mt-2 w-full p-3 bg-gray-50"
              name="name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password_confirmation" className="text-slate-800">
              Repetir Password:
            </label>
            <input
              type="password"
              placeholder="Repetir password"
              id="password_confirmation"
              className="mt-2 w-full p-3 bg-gray-50"
              name="password_confirmation"
              onChange={(e) => setPassword_confirmation(e.target.value)}
            />
          </div>
          <input
            type="submit"
            value="Crear Cuenta"
            className="bg-indigo-600 hover:bg-indigo-800 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer transition-colors"
          />
        </form>
        <AuthGoogle></AuthGoogle>
      </div>
      </>)}
      <nav className="mt-5">
        <Link to="/auth/login">¿Tienes cuenta? Inicia Sesion</Link>
      </nav>
      
      </>
  )
}
