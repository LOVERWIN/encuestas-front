import { useState } from 'react';
import { getRespuestasAbiertas } from '../services/reporteService';

export default function RespuestasPaginadas({ initialData, preguntaId }) {
  const [respuestas, setRespuestas] = useState(initialData?.data || []);
  const [currentPage, setCurrentPage] = useState(initialData?.current_page || 1);
  const [lastPage, setLastPage] = useState(initialData?.last_page || 1);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    if (currentPage >= lastPage) return;

    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const response = await getRespuestasAbiertas(preguntaId, nextPage);
      const newData = response.data; // Acceder a los datos de la respuesta de Axios
      
      setRespuestas(prev => [...prev, ...newData.data]);
      setCurrentPage(newData.current_page);
      setLastPage(newData.last_page);
    } catch (error) {
      console.error('Error al cargar más respuestas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialData || initialData.data.length === 0) {
    return <p className="text-slate-500 italic">No hay respuestas para esta pregunta.</p>;
  }

  return (
    <div>
      <ul className="space-y-3 list-disc list-inside bg-gray-50 p-4 rounded-md">
        {respuestas.map((respuesta) => (
          <li key={respuesta.id} className="text-gray-700">
            {respuesta.valor_respuesta}
          </li>
        ))}
      </ul>
      {currentPage < lastPage && (
        <div className="text-center mt-4 print:hidden">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'Cargando...' : 'Cargar más respuestas'}
          </button>
        </div>
      )}
    </div>
  );
}
