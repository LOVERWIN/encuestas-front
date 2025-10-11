import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import Alerta from "../components/Alerta";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Leemos el token y el email de la URL cuando el componente carga
  useEffect(() => {
    setToken(searchParams.get('token'));
    setEmail(searchParams.get('email'));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    try {
      const res = await resetPassword({ email, token, password, password_confirmation });
      setMessage(res.data.message);
      // Esperamos un momento y redirigimos al login
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || { general: error.response.data.message });
      } else {
        setErrors({ general: "Ocurrió un error inesperado." });
      }
    }
  };

  if (!token || !email) {
    return <Alerta>Enlace no válido.</Alerta>;
  }

  return (
    <>
      <h1 className="text-4xl font-bold text-center">Restablecer Contraseña</h1>
      <p className="text-center">Introduce tu nueva contraseña</p>

      <div className="bg-white shadow-md rounded-md mt-10 px-5 py-10">
        {message && <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg">{message}</div>}
        {errors.general && <Alerta>{errors.general}</Alerta>}

        {!message && ( // Oculta el form si ya hay un mensaje de éxito
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label>Nueva Contraseña:</label>
              <input type="password" onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full p-3 bg-gray-50" placeholder="Tu password"/>
              {errors.password && <Alerta>{errors.password[0]}</Alerta>}
            </div>
            <div className="mb-4">
              <label>Confirmar Contraseña:</label>
              <input type="password" onChange={(e) => setPasswordConfirmation(e.target.value)} className="mt-2 w-full p-3 bg-gray-50" placeholder="Repetir password"/>
            </div>
            <input type="submit" value="Guardar Nueva Contraseña" className="bg-indigo-600 hover:bg-indigo-800 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer"/>
          </form>
        )}
      </div>
    </>
  );
}