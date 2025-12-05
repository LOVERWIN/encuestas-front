import useSWR from 'swr';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getReporte, exportReporte } from '../services/reporteService';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import RespuestasPaginadas from '../components/RespuestasPaginadas';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useEffect, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels);

const fetcher = (slug) => getReporte(slug).then(res => res.data);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
};

export default function ReporteEncuestas() {
  const { slug } = useParams();
  const { data: reporte, error, isLoading } = useSWR(slug, fetcher);
  const location = useLocation();
  const isPrintRoute = location.pathname.startsWith('/print');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  useEffect(() => {
    if (isPrintRoute && !isLoading && reporte) {
      const printTimeout = setTimeout(() => window.print(), 500);
      return () => clearTimeout(printTimeout);
    }
  }, [isLoading, reporte, location.pathname]);

  const handleExport = async (format) => {
    setIsExportMenuOpen(false);
    try {
      const response = await exportReporte(slug, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${slug}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al exportar el reporte:", error);
    }
  };

  if (isLoading) return <p>Generando reporte completo...</p>;
  if (error) return <p>No se pudo generar el reporte.</p>;

  const isFinished = reporte?.fecha_termino ? new Date(reporte.fecha_termino) < new Date() : false;
  const estado = isFinished ? 'Finalizada' : 'Activa';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Resultados de la Pregunta' },
      datalabels: {
        display: (context) => context.dataset.data[context.dataIndex] > 0,
        anchor: 'end',
        align: 'start',
        color: (context) => context.dataset.data[context.dataIndex] > 0 ? '#FFFFFF' : '#4A5568',
        backgroundColor: (context) => context.dataset.data[context.dataIndex] > 0 ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
        borderRadius: 4,
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((sum, a) => sum + a, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return `${percentage}%`;
        },
        font: { weight: 'bold' }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } },
      x: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } }
    },
  };

  const printChartOptions = { ...chartOptions, animation: false, responsive: true, indexAxis: 'y' };

  return (
    <div id="report-content" className="print:text-black">
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-slate-200 print:shadow-none print:border-none">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <p className='text-slate-500 font-semibold'>Reporte de Encuesta</p>
              <h1 className="text-3xl font-bold text-slate-800">{reporte?.encuesta_titulo}</h1>
            </div>
            <div className="relative print:hidden">
              <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="px-4 py-2 bg-gray-800 text-white rounded-md flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Exportar
              </button>
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  <a href="#" onClick={() => handleExport('xlsx')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Excel (.xlsx)</a>
                  <a href="#" onClick={() => handleExport('csv')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">CSV (.csv)</a>
                  <Link to={`/print/reportes/${slug}`} target="_blank" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Imprimir / PDF</Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 print:grid-cols-1 gap-6 text-center">
            <div className='bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center'>
              <p className='text-sm text-slate-500'>Total Respuestas</p>
              <p className='text-2xl font-bold text-slate-800'>{reporte?.total_respuestas ?? 'N/A'}</p>
            </div>
            <div className='bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center'>
              <p className='text-sm text-slate-500'>Estado</p>
              <span className={`px-3 py-1 text-lg font-semibold rounded-full ${isFinished ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                {estado}
              </span>
            </div>
            <div className='bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center'>
              <p className='text-sm text-slate-500'>Ciclo de Vida</p>
              <p className='text-md font-semibold text-slate-700'>{formatDate(reporte?.fecha_inicio)} - {formatDate(reporte?.fecha_termino)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 max-h-[calc(100vh-22rem)] overflow-y-auto p-2 print:max-h-none print:overflow-visible">
          {reporte?.reporte?.map((item) => {
            const chartData = {
              labels: Object.keys(item.resultados || {}),
              datasets: [{
                label: '# de Votos',
                data: Object.values(item.resultados || {}),
                backgroundColor: [
                  'rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)',
                  'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)',
                  'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)',
                ],
                borderWidth: 1,
              }],
            };

            return (
              <div key={item.pregunta_id} className="bg-white p-6 rounded-lg shadow-md break-inside-avoid print:shadow-none">
                <h2 className="text-xl font-semibold mb-4">{item.pregunta_texto}</h2>
                <p className="text-sm text-gray-500 mb-4">Total de Respuestas: {item.total_respuestas}</p>

                {(item.tipo === 'opcion_unica' || item.tipo === 'desplegable') && item.resultados && (
                  <div className="w-full max-w-[400px] mx-auto aspect-square print:aspect-auto print:max-w-full">
                    <Doughnut data={chartData} options={isPrintRoute ? printChartOptions : chartOptions} />
                  </div>
                )}

                {(item.tipo === 'opcion_multiple' || item.tipo === 'escala') && item.resultados && (
                  <div className="w-full max-w-[750px] mx-auto aspect-[2/1] print:aspect-auto print:max-w-full">
                    <Bar options={isPrintRoute ? printChartOptions : chartOptions} data={chartData} />
                  </div>
                )}

                {['texto_corto', 'texto_largo', 'fecha', 'hora', 'archivo'].includes(item.tipo) && (
                  <RespuestasPaginadas initialData={item.resultados} preguntaId={item.pregunta_id} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}