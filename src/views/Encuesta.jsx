import useAuth from '../hooks/useAuth';
import AdminEncuestas from './AdminEncuestas';
import UserEncuestas from './UserEncuestas';

export default function Encuesta() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  // Si el usuario es admin, muestra la tabla de administración.
  // Si no, muestra la lista de encuestas para responder.
  return user?.is_admin ? <AdminEncuestas /> : <UserEncuestas />;
}