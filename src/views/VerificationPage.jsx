import { Link } from "react-router-dom";

export default function VerificationPage({ status }) {
  return (
    <div className="text-center">
      {status === 'failed' ? (
        <>
          <h1 className="text-3xl font-bold text-red-600">Verificación Fallida</h1>
          <p className="mt-4">El enlace de verificación no es válido o ha expirado. Por favor, intenta iniciar sesión para solicitar uno nuevo.</p>
        </>
      ) : (
        // Podrías añadir otros estados aquí si los necesitas
        <p>Procesando...</p>
      )}
      <Link to="/auth/login" className="block mt-6 text-blue-600 hover:underline">Volver a Iniciar Sesión</Link>
    </div>
  );
}