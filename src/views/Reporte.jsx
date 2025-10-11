import { useState } from "react";
import useSWR from "swr";
import apiClient from "../config/axios";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useDebounce from '../hooks/useDebounce'; // Un hook que crearemos

const fetcher = (url) => apiClient.get(url).then((res) => res.data);
export default function Reporte() {
  // --- ESTADOS PARA LOS FILTROS ---
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(""); // Para la fecha de inicio
  const [endDate, setEndDate] = useState(""); // Para la fecha de término
  // 1. Nuevo estado para saber qué enlace se ha copiado
  const [copiedSlug, setCopiedSlug] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);


  const { user } = useAuth();
  if (!user?.is_admin) {
    return 'No tienes los permisos suficientes';
  }

  const swrKey = `/api/encuestas?page=${page}&search=${debouncedSearchTerm}&start_date=${startDate}&end_date=${endDate}`;
  const { data, error, isLoading } = useSWR(swrKey, fetcher);

  
  const handleCopyLink = (slug) => {
    const url = `${window.location.origin}/reportes/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug); // Guarda el slug del enlace copiado
      setTimeout(() => setCopiedSlug(null), 2000); // Resetea el estado después de 2 segundos
    });
  };


  if (isLoading) return <p>Cargando encuestas...</p>;
  if (error) return <p>No se pudieron cargar las encuestas.</p>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Selecciona una Encuesta</h1>
      </div>

      {/* --- CONTENEDOR DE FILTROS --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Buscar por título..."
          className="px-4 py-2 rounded-lg border w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="startDate" className="text-sm text-gray-600">
            Desde:
          </label>
          <input
            id="startDate"
            type="date"
            className="px-4 py-2 rounded-lg border"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="endDate" className="text-sm text-gray-600">
            Hasta:
          </label>
          <input
            id="endDate"
            type="date"
            className="px-4 py-2 rounded-lg border"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map((encuesta) => (
          // El contenedor principal ahora es un div para mayor flexibilidad
          <div
            key={encuesta.id}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 flex flex-col justify-between"
          >

            {/* --- SECCIÓN DE CONTENIDO --- */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-bold text-gray-800 pr-2">{encuesta.titulo}</h2>
                <span
                  className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${encuesta.es_publica
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                  {encuesta.es_publica ? "Pública" : "Privada"}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">
                {encuesta.descripcion}
              </p>
            </div>
            {/* --- SECCIÓN DE METADATOS (con la fecha) --- */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <span>Creada el: </span>
                <strong>{new Date(encuesta.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
            </div>
            {/* --- SECCIÓN DE ACCIONES --- */}
            <div className="mt-6 flex gap-3">
              <Link
                to={`/reportes/${encuesta.slug}`}
                className="flex-1 text-center px-4 py-2 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900 text-sm transition-colors"
              >
                Ver Reporte
              </Link>
              <button
                onClick={() => handleCopyLink(encuesta.slug)}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                title="Copiar enlace al reporte"
              >
                {/* Cambia el ícono y el color si el enlace se acaba de copiar */}
                {copiedSlug === encuesta.slug ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                )}
              </button>
              <Link to={`/print/reportes/${encuesta.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border ...">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>

              </Link >
            </div>

          </div>
        ))}
      </div>

      {/* 3. La paginación ahora usa los datos de la API */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <p className="block text-sm text-slate-500">Página {data?.current_page} de {data?.last_page}</p>
        <div className="flex gap-2">
          <button 
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage(page - 1)} disabled={!data?.prev_page_url}>Anterior</button>
          <button
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage(page + 1)} disabled={!data?.next_page_url}>Siguiente</button>
        </div>
      </div>
    </div>
  );
}
