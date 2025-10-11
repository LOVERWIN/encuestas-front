import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../config/axios";
import useSWR from "swr";
import useDebounce from '../hooks/useDebounce'; // Reutilizamos el hook
import { deleteEncuesta } from "../services/encuestaService";
import ConfirmationModal from '../components/ConfirmationModal'; // Importa el modal

// 1. Este fetcher está diseñado para trabajar con nuestro servicio
//    Recibe el array de la clave, ignora el primer elemento (nombre) y pasa el segundo (página) a la función.
const fetcher = (url) => apiClient.get(url).then((res) => res.data);

export default function AdminEncuestas() {
  // --- ESTADO Y DATOS ---
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null); // Estado para feedback al copiar
  const location = useLocation(); // Hook para leer el estado de la navegación
  const [successMessage, setSuccessMessage] = useState('');
  // const { data, error, isLoading, mutate } = useSWR(['/api/encuestas', page], fetcher);
  // 1. Usamos el debounce para evitar peticiones en cada tecla
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [surveyToDelete, setSurveyToDelete] = useState(null); // Estado para saber qué encuesta borrar

  // 2. La clave de SWR ahora es dinámica y envía los filtros al backend
  const swrKey = `/api/encuestas?page=${page}&search=${debouncedSearchTerm}`;
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    shouldRetryOnError: false
  });

  // 1. useEffect para leer el mensaje que llega desde el editor
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Limpia el estado de la ubicación para que el mensaje no reaparezca si se refresca la página
      window.history.replaceState({}, document.title);
      // Oculta el mensaje después de 3 segundos
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // --- MANEJADORES DE EVENTOS ---
  const handleDelete = async () => {
    if (!surveyToDelete) return;
    try {
      await deleteEncuesta(surveyToDelete.slug);
      mutate();
      setSurveyToDelete(null); // Cierra el modal y limpia el estado
    } catch (err) {
      console.error("Error al eliminar la encuesta", err);
      alert('No se pudo eliminar la encuesta.');
      setSurveyToDelete(null);
    }
  };

  const handleCopyLink = (slug) => {
    // Construye la URL completa para que un usuario responda la encuesta
    const url = `${window.location.origin}/encuestas/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug); // Guarda el slug para mostrar feedback
      setTimeout(() => setCopiedSlug(null), 2000); // Limpia el feedback después de 2 segundos
    });
  };

  // --- RENDERIZADO CONDICIONAL ---
  if (isLoading) return <p className="text-center mt-10">Cargando encuestas...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">No se pudieron cargar las encuestas.</p>;

  return (
    <div className="max-w-[1920px] mx-auto">



      <div className="relative flex flex-col w-full h-full text-slate-700 bg-white shadow-md rounded-xl bg-clip-border">
        {/* --- 3. CONTENEDOR PARA MOSTRAR EL MENSAJE --- */}
        {successMessage && (
          <div className="m-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
            {successMessage}
          </div>
        )}
        <div className="relative mx-4 mt-4 overflow-hidden text-slate-700 bg-white rounded-none bg-clip-border">
          <div className="flex flex-col sm:flex-row items-center justify-between ">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Listado de Encuestas</h3>
              <p className="text-slate-500">Revisa a cada encuesta antes de editar</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">

              <button onClick={() => navigate('/encuestas/crear')}
                className="flex select-none items-center gap-2 rounded bg-gray-800 py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:shadow-lg hover:shadow-slate-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Agregar Encuesta
              </button>
            </div>

          </div>
          <div className="flex justify-between sm:justify-end mt-5 mb-5 mr-1  ">
            <input
              type="text"
              placeholder="Buscar encuesta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-1/3 w-full"
            />
          </div>

        </div>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full mt-4 text-left table-auto min-w-max">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr>
                <th
                  className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                  <p
                    className="flex items-center justify-between gap-2 text-sm text-slate-500">
                    Titulo
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                      stroke="currentColor" aria-hidden="true" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                    </svg>
                  </p>
                </th>

                <th
                  className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                  <p
                    className="flex items-center justify-between gap-2 text-sm text-slate-500">
                    Fecha Creacion
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                      stroke="currentColor" aria-hidden="true" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                    </svg>
                  </p>
                </th>
                <th
                  className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                  <p
                    className="flex items-center justify-between gap-2 text-sm text-slate-500">
                    Estado
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                      stroke="currentColor" aria-hidden="true" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                    </svg>
                  </p>
                </th>

                <th
                  className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                  <p
                    className="flex items-center justify-between gap-2 text-sm text-slate-500">Acciones
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* --- MAPEADO DE DATOS EN LA TABLA --- */}
              {data?.data.map(encuesta => {
                const sePuedeEditar = encuesta.respuestas_count === 0; return (

                  <tr key={encuesta.id}>
                    <td className="p-4 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold text-slate-700">
                            {encuesta.titulo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-slate-200">
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-700">
                          {new Date(encuesta.created_at).toLocaleDateString()}
                        </p>

                      </div>
                    </td>

                    <td className="p-4 border-b border-slate-200">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${encuesta.es_publica ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {encuesta.es_publica ? 'Pública' : 'Privada'}
                      </span>
                    </td>
                    <td className="p-4 border-b border-slate-200 flex">
                      <button onClick={() => navigate(`/encuestas/${encuesta.slug}/editar`)}
                        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        //disabled={!sePuedeEditar}
                        //title={sePuedeEditar ? 'Editar Encuesta' : 'No se puede editar, ya tiene respuestas'}
                        type="button">
                        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                            className="w-4 h-4">
                            <path
                              d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z">
                            </path>
                          </svg>
                        </span>
                      </button>
                      <button onClick={() => setSurveyToDelete(encuesta)}
                        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button">
                        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>

                        </span>
                      </button>
                      <Link
                        to={`/encuestas/${encuesta.slug}?preview=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Previsualizar Encuesta"
                        className="relative  h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                      >
                        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </span>
                      </Link>
                      <button onClick={() => handleCopyLink(encuesta.slug)} className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle  text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        title="Copiar enlace para responder">
                        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          {copiedSlug === encuesta.slug ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                            </svg>
                          )}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Renderiza el Modal de Confirmación */}
          <ConfirmationModal
            isOpen={!!surveyToDelete}
            onClose={() => setSurveyToDelete(null)}
            onConfirm={handleDelete}
            title="Confirmar Eliminación"
          >
            <p>¿Estás seguro de que quieres eliminar la encuesta "<strong>{surveyToDelete?.titulo}</strong>"? Esta acción no se puede deshacer.</p>
          </ConfirmationModal>
        </div>
        <div className="flex items-center justify-between p-3">
          <p className="block text-sm text-slate-500">
            Página {data?.current_page} de {data?.last_page}
          </p>
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
  )
}
