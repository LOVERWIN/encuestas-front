import { useState } from "react";
import { forgotPassword } from "../services/authService";
import Alerta from "../components/Alerta";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await forgotPassword(email);
      setMessage(res.data.message);
    } catch (err) {
      setError('No se encontró un usuario con ese correo.');
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center">Olvidé mi Contraseña</h1>
      <p className="text-center">Ingresa tu email para recibir un enlace de restablecimiento</p>

      <div className="bg-white shadow-md rounded-md mt-10 px-5 py-10">
        {message && <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg">{message}</div>}
        {error && <Alerta>{error}</Alerta>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>Email:</label>
            <input type="email" placeholder="Tu email" onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full p-3 bg-gray-50"/>
          </div>
          <input type="submit" value="Enviar Enlace" className="bg-indigo-600 hover:bg-indigo-800 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer"/>
        </form>
      </div>
    </>
  );
}