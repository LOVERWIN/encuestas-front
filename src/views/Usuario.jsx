import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { updateUser, deleteUser,createUser } from "../services/userService";
import EditUserModal from "../components/EditUserModal"; // Importa el modal
import apiClient from "../config/axios";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import useDebounce from '../hooks/useDebounce'; // Reutiliza el hook

// El "fetcher" ahora recibe la URL completa desde SWR
const fetcher = (url) => apiClient.get(url).then(res => res.data);

export default function Usuario() {
  // --- LÓGICA DE DATOS Y ESTADO ---
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // Estado para el filtro de rol
  const [sortBy, setSortBy] = useState('name'); // Columna de ordenamiento por defecto
  const [sortDirection, setSortDirection] = useState('asc'); // Dirección por defecto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // SWR Key ahora incluye el filtro de is_admin
  const swrKey = `/users?page=${page}&search=${debouncedSearchTerm}&is_admin=${roleFilter}`;
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher);

  // --- EFECTOS ---
  // Resetear la página a 1 cuando los filtros cambian
  useEffect(() => {
    setPage(1);
  }, [roleFilter, debouncedSearchTerm]);


  // --- LÓGICA DE ORDENAMIENTO (FRONTEND) ---
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const sortedUsers = useMemo(() => {
    if (!data?.data) return [];
    
    const sorted = [...data.data].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });

    if (sortDirection === 'desc') {
      return sorted.reverse();
    }

    return sorted;
  }, [data, sortBy, sortDirection]);


  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
    // Tu función para abrir el modal, que ya tienes
  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (setError, setSuccessMessage) => {
    if (deletingUser) {
      try {
        await deleteUser(deletingUser.id);
        setSuccessMessage('Usuario eliminado correctamente.');
        mutate(); // Refresca los datos

        setTimeout(() => {
          setIsDeleteModalOpen(false);
          setDeletingUser(null);
        }, 2000);

      } catch (err) {
        console.error("Error al eliminar el usuario", err);
        setError('No se pudo eliminar el usuario. Es posible que tenga encuestas asociadas.');
      }
    }
  };

 const handleSave = async (userId, formData, setErrors, setSuccessMessage) => {
    try {
      let successMsg = '';
      if (userId) {
        await updateUser(userId, formData);
        successMsg = 'Usuario actualizado correctamente.';
      } else {
        await createUser(formData);
        successMsg = 'Usuario creado correctamente.';
      }
      
      // Éxito
      setSuccessMessage(successMsg);
      mutate(); // Refresca la tabla

      // Cierra el modal después de un par de segundos para que el usuario vea el mensaje
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingUser(null);
      }, 2000);

    } catch (err) {
      if (err.response && err.response.status === 422) {
        // Errores de validación
        setErrors(err.response.data.errors);
      } else {
        // Otros errores
        console.error("Error al guardar el usuario", err);
        setErrors({ general: 'No se pudo guardar el usuario. Inténtalo de nuevo.' });
      }
    }
  };
  // --- FIN DE LA LÓGICA ---

  // --- MANEJO DE ESTADOS DE CARGA Y ERROR ---
  if (isLoading)
    return <p className="text-center mt-10">Cargando usuarios...</p>;
  if (error) {
    if (error.response?.status === 403) {
      return (
        <p className="text-center mt-10 text-red-600">
          No tienes permiso para ver esta sección.
        </p>
      );
    }
    return (
      <p className="text-center mt-10 text-red-600">
        Error al cargar los usuarios.
      </p>
    );
  }

  // --- RENDERIZADO DEL COMPONENTE CON TU DISEÑO ---
  return (
    <>
      <div className="max-w-[1920px] mx-auto">
        <div className="relative flex flex-col w-full h-full text-slate-700 bg-white shadow-md rounded-xl bg-clip-border">
          <div className="relative mx-4 mt-4 overflow-hidden text-slate-700 bg-white rounded-none bg-clip-border">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Lista de Usuarios
                </h3>
                <p className="text-slate-500">
                  Revisa a cada persona antes de editar
                </p>
              </div>

              <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
               
                <button
                  onClick={() => handleOpenModal()}
                  className="flex select-none items-center gap-2 rounded bg-slate-800 py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:shadow-lg hover:shadow-slate-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
                  </svg>
                  Add member
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:justify-end mt-5 mb-5 mr-1 gap-4">
                {/* Filtro de Rol */}
                <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="">Todos los Roles</option>
                    <option value="1">Administradores</option>
                    <option value="0">Usuarios</option>
                </select>
                {/* Barra de Búsqueda */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-1/3 w-full"
                />
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full mt-4 text-left table-auto min-w-max">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr>
                  <th onClick={() => handleSort('name')} className="p-4 border-y border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <p className="flex items-center justify-between gap-2 text-sm text-slate-500">
                      Nombre
                      {sortBy === 'name' && (
                        <span className={sortDirection === 'asc' ? 'rotate-180' : ''}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </span>
                      )}
                    </p>
                  </th>
                  <th onClick={() => handleSort('email')} className="p-4 border-y border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <p className="flex items-center justify-between gap-2 text-sm text-slate-500">
                      Email
                      {sortBy === 'email' && (
                        <span className={sortDirection === 'asc' ? 'rotate-180' : ''}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </span>
                      )}
                    </p>
                  </th>
                  <th onClick={() => handleSort('is_admin')} className="p-4 border-y border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <p className="flex items-center justify-between gap-2 text-sm text-slate-500">
                      Type
                      {sortBy === 'is_admin' && (
                        <span className={sortDirection === 'asc' ? 'rotate-180' : ''}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </span>
                      )}
                    </p>
                  </th>
                  <th className="p-4 border-y border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <p className="flex items-center justify-between gap-2 text-sm text-slate-500">
                      Acciones
                    </p>
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedUsers.map(user => (

                <tr key={user.id}>
                  <td className="p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-700">
                          {user.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-slate-700">
                        {user.email}
                      </p>
                      <p className="text-sm text-slate-500">Organization</p>
                    </div>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <div className="w-max">
                      <div className="grid items-center px-2 py-1 text-xs font-bold text-green-900 uppercase rounded-md bg-blue-500/20">
                        <span>{user.is_admin ? 'Admin' : 'User'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <button onClick={() => handleEditClick(user)} className="h-10 w-10 rounded-lg hover:bg-slate-900/10 active:bg-slate-900/20">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    
                    <button onClick={() => handleDeleteClick(user)} className="h-10 w-10 rounded-lg hover:bg-slate-900/10 active:bg-slate-900/20">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-3">
            <p className="block text-sm text-slate-500">
              Página {data?.current_page} de {data?.last_page}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(page - 1)} disabled={!data?.prev_page_url} 
              className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              type="button">
                Previous
              </button>
              <button onClick={() => setPage(page + 1)} disabled={!data?.next_page_url} 
              className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
               type="button">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
       <EditUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        onSave={handleSave}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        userName={deletingUser?.name}
      />
    </>
  );
}

