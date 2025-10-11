import useSWR from 'swr';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getReporte, exportReporte } from '../services/reporteService';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import RespuestasAbiertas from '../components/RespuestaAbiertas'; // Un nuevo componente que crearemos
import { Bar, Doughnut } from 'react-chartjs-2';
import { useEffect, useState } from 'react';

// 2. Registra el nuevo elemento para los gráficos de dona/pastel
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels);

const fetcher = (slug) => getReporte(slug).then(res => res.data);
// Fetcher para las respuestas abiertas

export default function ReporteEncuestas() {

  const { slug } = useParams(); // Asumiremos que la ruta será /reportes/:slug
  const { data: reporte, error, isLoading } = useSWR(slug, fetcher);
  const location = useLocation(); // Hook para obtener la ruta actual
  const isPrintRoute = location.pathname.startsWith('/print');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);


  // --- LÓGICA PARA LA IMPRESIÓN ---
  // Efecto para imprimir
  useEffect(() => {
    const isPrintRoute = location.pathname.startsWith('/print');
    // 4. Esperamos a que TODO esté cargado
    if (isPrintRoute && !isLoading && reporte) {
      const printTimeout = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(printTimeout);
    }
  }, [isLoading, reporte]);

  const handleExport = async (format) => {
    setIsExportMenuOpen(false);
    try {
      const response = await exportReporte(slug, format);
      // Lógica para descargar el archivo que viene de la API
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

  // Opciones para los gráficos
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Resultados de la Pregunta' },

      // --- NUEVA CONFIGURACIÓN DEL PLUGIN ---
      datalabels: {
        display: function (context) {
          // Solo muestra la etiqueta si el valor de la barra es mayor a 0
          return context.dataset.data[context.dataIndex] > 0;
        },
        anchor: 'end',  // ancla la etiqueta al final de la barra
        align: 'start', // alinea la etiqueta arriba de la barra 
        color: (context) => {
          // Si el valor es 0, mostramos el color de texto normal, si no, lo hacemos blanco para que se vea dentro de la barra
          return context.dataset.data[context.dataIndex] > 0 ? '#FFFFFF' : '#4A5568';
        },
        backgroundColor: (context) => {
          // Fondo oscuro para que el texto blanco se vea bien dentro de la barra
          return context.dataset.data[context.dataIndex] > 0 ? 'rgba(0, 0, 0, 0.4)' : 'transparent';
        },
        borderRadius: 4, // Bordes redondeados para el fondo

        formatter: (value, context) => {
          // 'value' es el conteo de la barra actual (ej. 100)
          // 'context.chart.data.datasets[0].data' es el array con todos los conteos (ej. [100, 40, 10])
          const total = context.chart.data.datasets[0].data.reduce((sum, a) => sum + a, 0);
          const percentage = ((value / total) * 100).toFixed(1); // Calcula el porcentaje con 1 decimal

          // Devuelve el texto que se mostrará
          return `${percentage}%`;
        },
        font: {
          weight: 'bold'
        }
      }
    },
    // --- AÑADE ESTA SECCIÓN ---
    scales: {
      // Para un gráfico de barras vertical, el eje de valores es el 'y'
      y: {
        beginAtZero: true, // Asegura que el eje empiece en 0
        ticks: {
          precision: 0, // No muestra decimales
          stepSize: 1   // El incremento mínimo entre cada línea de la escala es 1
        }
      },
      // Para un gráfico de barras horizontal, el eje de valores es el 'x'
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1
        }
      }
    },

  };

  // Opciones optimizadas para la impresión (sin animaciones)
  const printChartOptions = {
    ...chartOptions, // Copia las opciones base
    animation: false,      // <-- Desactiva la animación
    responsive: true,
    indexAxis: 'y',
    //maintainAspectRatio: false,


    //responsive: false,     // <-- Fija el tamaño para la impresión
  };


  return (
    <div id="report-content">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 print:mb-4">Reporte: {reporte?.encuesta_titulo}</h1>
        {/* --- MENÚ DE EXPORTACIÓN --- */}
        <div className="relative">
          <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="px-4 py-2 bg-gray-800 text-white rounded-md flex items-center">
            Exportar ▼
          </button>
          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <a href="#" onClick={() => handleExport('xlsx')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Excel (.xlsx)
              </a>
              <a href="#" onClick={() => handleExport('csv')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                CSV (.csv)
              </a>
              <Link to={`/print/reportes/${slug}`} target="_blank" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Imprimir / PDF
              </Link>
            </div>
          )}
          </div>
          <div className="space-y-8 max-h-[calc(100vh-10rem)] overflow-y-auto p-2 print:max-h-none print:overflow-visible">
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
                <div key={item.pregunta_id} className="bg-white p-6 rounded-lg shadow-md break-inside-avoid">
                  <h2 className="text-xl font-semibold mb-4">{item.pregunta_texto}</h2>
                  <p className="text-sm text-gray-500 mb-4">Total de Respuestas: {item.total_respuestas}</p>

                  {/* --- 3. LÓGICA DE RENDERIZADO MEJORADA --- */}

                  {(item.tipo === 'opcion_unica' || item.tipo === 'desplegable') && item.resultados && (
                    <div className="max-w-[400px] mx-auto">
                      <Doughnut data={chartData} options={isPrintRoute ? printChartOptions : chartOptions} />
                    </div>
                  )}

                  {(item.tipo === 'opcion_multiple' || item.tipo === 'escala') && item.resultados && (
                    <div className="w-full max-w-[750px] mx-auto aspect-[2/1]">
                      <Bar options={isPrintRoute ? printChartOptions : chartOptions} data={chartData} />
                    </div>
                  )}

                  {['texto_corto', 'texto_largo', 'fecha', 'hora', 'archivo'].includes(item.tipo) && (
                    <RespuestasAbiertas preguntaId={item.pregunta_id} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      );
}