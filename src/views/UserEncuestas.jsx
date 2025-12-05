import useSWR from 'swr';
import apiClient from '../config/axios';
import { Link } from 'react-router-dom';
import useDebounce from '../hooks/useDebounce'; 
import { useState } from 'react';

const fetcher = (url) => apiClient.get(url).then(res => res.data);

export default function UserEncuestas() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

 // La clave de SWR ahora incluye la paginación y la búsqueda
  const swrKey = `/encuestas-disponibles?page=${page}&search=${debouncedSearchTerm}`;
  const { data, error, isLoading } = useSWR(swrKey, fetcher);


  if (isLoading) return <p>Cargando encuestas disponibles...</p>;
  if (error) return <p>No se pudieron cargar las encuestas.</p>;

  return (
    <div className="max-w-7xl my-4 mx-auto p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <h1 className="text-3xl font-bold">Encuestas Disponibles</h1>
        <input
          type="text"
          placeholder="Buscar encuesta por título..."
          className="px-4 py-2 rounded-lg border w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {data?.data.length === 0 && <p>No tienes encuestas para responder por el momento.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.map(encuesta => (
          <div key={encuesta.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{encuesta.titulo}</h2>
              <p className="text-gray-500 mt-2 truncate">{encuesta.descripcion}</p>
            </div>
             {/* --- LÓGICA CONDICIONAL AQUÍ --- */}
            {encuesta.ha_respondido ? (
              <div className="mt-4 text-center font-semibold text-green-600 bg-green-100 p-2 rounded-md">
                ✓ Gracias por responder
              </div>
            ) : (
              <Link 
                to={`/encuestas/${encuesta.slug}`} 
                className="block mt-4 text-center w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Responder Encuesta
              </Link>
            )}
          </div>
        ))}
      </div>
      {data?.total > 0 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button onClick={() => setPage(page - 1)} disabled={!data?.prev_page_url} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
          <span>Página {data?.current_page} de {data?.last_page}</span>
          <button onClick={() => setPage(page + 1)} disabled={!data?.next_page_url} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
        </div>
      )}
    </div>
  );
}