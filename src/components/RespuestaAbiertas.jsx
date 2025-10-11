import React, { useState } from 'react';
import useSWR from 'swr';
import { getRespuestasAbiertas } from '../services/reporteService';

// Fetcher que recibe un array [preguntaId, page]
const fetcher = ([, preguntaId, page]) => getRespuestasAbiertas(preguntaId, page).then(res => res.data);

export default function RespuestaAbiertas({ preguntaId }) {
  const [page, setPage] = useState(1);
  
  // La clave de SWR ahora incluye la página para que se actualice
  const { data, isLoading } = useSWR([`/api/preguntas/${preguntaId}/respuestas`, preguntaId, page], fetcher);

  if (isLoading) return <p className="text-sm text-gray-500">Cargando respuestas...</p>;
  if (!data || data.data.length === 0) {
    return <p className="text-sm text-gray-500">No hay respuestas de este tipo.</p>;
  }

  return (
    <div>
      <ul className="space-y-3 list-disc list-inside bg-gray-50 p-4 rounded-md">
        {data.data.map(respuesta => (
          <li key={respuesta.id} className="text-gray-700">
            {respuesta.valor_respuesta}
          </li>
        ))}
      </ul>

      {/* Paginación */}
      <div className="flex justify-between mt-4">
        <button onClick={() => setPage(page - 1)} disabled={!data?.prev_page_url} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
>Anterior</button>
        <span className="text-sm text-gray-600">Página {data?.current_page} de {data?.last_page}</span>
        <button onClick={() => setPage(page + 1)} disabled={!data?.next_page_url} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
>Siguiente</button>
      </div>
    </div>
  );
}