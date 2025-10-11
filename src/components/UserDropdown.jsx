
import useAuth from '../hooks/useAuth';

export default function UserDropdown({ user }) {
  const { handleLogout } = useAuth();


  return (
    <div 
      className="absolute top-0 right-0 mt-14 mr-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
    >
      <div className="py-1">
        <div className="px-4 py-2 border-b">
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="truncate text-sm text-gray-500">{user.email}</p>
        </div>
        <button type='button' onClick={handleLogout} className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}