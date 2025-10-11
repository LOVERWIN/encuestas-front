import { useState } from 'react';
import useSWR from 'swr';
import { useParams, useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { getSurveyBySlug, submitSurveyResponse } from '../services/encuestaService';
import useAuth from '../hooks/useAuth';
import Alerta from '../components/Alerta'; // Asumo que tienes este componente

const fetcher = (slug) => getSurveyBySlug(slug).then(res => res.data);

export default function ResponderEncuesta() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { slug } = useParams(); // Obtenemos el slug de la URL
  const location = useLocation(); // Para recordar a dónde volver
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const navigate = useNavigate();
  const { data: encuesta, error, isLoading: isSurveyLoading } = useSWR(slug, fetcher);
  const [respuestas, setRespuestas] = useState({});
  const [errores, setErrores] = useState({}); // Estado para errores de validación
  const [enviadoConExito, setEnviadoConExito] = useState(false); // Estado para mensaje de éxito
  const isLoading = isAuthLoading || isSurveyLoading;


  const handleRespuestaChange = (preguntaId, valor, tipo) => {
    setRespuestas(prev => {
      const newState = { ...prev };
      if (tipo === 'opcion_multiple') {
        const currentAnswers = newState[preguntaId] || [];
        if (currentAnswers.includes(valor)) {
          // Si ya está, lo quitamos (desmarcar checkbox)
          newState[preguntaId] = currentAnswers.filter(item => item !== valor);
        } else {
          // Si no está, lo añadimos (marcar checkbox)
          newState[preguntaId] = [...currentAnswers, valor];
        }
      } else {
        // Para todos los demás tipos (texto, opcion_unica, archivo)
        newState[preguntaId] = valor;
      }
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores({});
    try {
      await submitSurveyResponse(slug, respuestas);
      setEnviadoConExito(true); // Activa la vista de "Gracias"
      //navigate('/'); // Redirige al dashboard
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setErrores(err.response.data.errors);
      } else {
        setErrores({ general: err.response?.data?.message || 'Hubo un error al enviar tus respuestas.' });
      }
    }
  };

  if (!isLoading && !user) {
    // Antes de redirigir, guardamos la página a la que quería ir el usuario.
    localStorage.setItem('redirect_after_login', location.pathname);

  }

  if (isLoading) return <p>Cargando encuesta...</p>;

  // Si hay un error (ej. 401 o 403 por ser privada), muestra el enlace al login
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
        <p className="mb-4">Esta encuesta no se pudo cargar. Puede que sea privada o ya no esté disponible.</p>
        <p>Por favor, <Link to="/auth/login" state={{ from: location }} className="text-blue-600 font-bold hover:underline">inicia sesión</Link> para continuar.</p>
      </div>
    );
  }
  if (enviadoConExito || (encuesta.ha_respondido && !isPreview)) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{encuesta.titulo}</h1>
        <div className="mt-8 p-6 bg-green-100 text-green-800 rounded-lg">
          <h2 className="text-2xl font-bold">✓ ¡Gracias!</h2>
          <p className="mt-2">Tus respuestas han sido guardadas correctamente.</p>
          <Link to="/" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-8 border-blue-600">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">{encuesta.titulo}</h1>
          <p className="text-gray-600">{encuesta.descripcion}</p>
        </div>


        <form onSubmit={handleSubmit}>
          {errores.general && <Alerta>{errores.general}</Alerta>}
          {encuesta.preguntas.map(pregunta => {
            // No renderizamos nada si el tipo es 'seccion', solo el título y descripción
            if (pregunta.tipo === 'seccion') {
              return (
                <div key={pregunta.id} className="pt-8 pb-4 border-t mt-4 break-words">
                  <h2 className="text-2xl font-bold text-gray-800">{pregunta.titulo_seccion}</h2>
                  <p className="text-gray-600 mt-1">{pregunta.descripcion_seccion}</p>
                </div>
              );
            }

            // Si no es una sección, renderizamos la tarjeta de pregunta
            return (
              <div key={pregunta.id} className="bg-white p-6 rounded-lg shadow-md mb-6 break-words">
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  {/* Renderiza el texto enriquecido de forma segura */}
                  <div dangerouslySetInnerHTML={{ __html: pregunta.pregunta }} />
                  {pregunta.es_requerido ? (
                    <span className="text-red-500 text-sm"> * Obligatorio</span>
                  ) : (
                    <span className="text-gray-400 text-sm"> (Opcional)</span>
                  )}
                </label>

                {/* --- RENDERIZADO CONDICIONAL CORREGIDO --- */}
                {pregunta.tipo === 'texto_corto' && (<input type="text" className="w-full p-2 border rounded-md" onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value, pregunta.tipo)} required={pregunta.es_requerido} />)}
                {pregunta.tipo === 'texto_largo' && (<textarea className="w-full p-2 border rounded-md" rows="5" onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value, pregunta.tipo)} required={pregunta.es_requerido}></textarea>)}
                {pregunta.tipo === 'opcion_unica' && pregunta.opciones.map(opcion => (<div key={opcion.id} className="flex items-center mb-2 "><input type="radio" name={`pregunta_${pregunta.id}`} value={opcion.id} onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value, pregunta.tipo)} required={pregunta.es_requerido} className="mr-2 h-4 w-4 mt-1 flex-shrink-0" /> <label className='min-w-0 break-words'>{opcion.opcion_texto}</label></div>))}
                {pregunta.tipo === 'opcion_multiple' && pregunta.opciones.map(opcion => (<div key={opcion.id} className="flex items-center mb-2 "><input type="checkbox" value={opcion.id} onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value, pregunta.tipo)} className="mr-2 h-4 w-4 mt-1 flex-shrink-0" /> <label className=" min-w-0 break-words">{opcion.opcion_texto}</label></div>))}
                {pregunta.tipo === 'fecha' && (<input type="date" className="p-2 border rounded-md" onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value, pregunta.tipo)} required={pregunta.es_requerido} />)}
                {pregunta.tipo === 'hora' && (<input type="time" className="p-2 border rounded-md" onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value, pregunta.tipo)} required={pregunta.es_requerido} />)}
                {pregunta.tipo === 'desplegable' && (<select className="w-full p-2 border rounded-md bg-white" onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value, pregunta.tipo)} required={pregunta.es_requerido} defaultValue="">
                  <option value="" disabled>Selecciona una opción</option>
                  {pregunta.opciones.map(opcion => (
                    <option key={opcion.id} value={opcion.id}>
                      {opcion.opcion_texto}
                    </option>
                  ))}
                </select>
                )}
                {pregunta.tipo === 'escala' && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center px-2 text-sm text-gray-600">
                      <span>{pregunta.escala_label_inicio}</span>
                      <span>{pregunta.escala_label_fin}</span>
                    </div>
                    <div className="flex justify-around items-center mt-2 border rounded-lg p-2">
                      {[...Array(pregunta.escala_max)].map((_, i) => {
                        const value = i + 1;
                        return (<label key={value} className="flex flex-col items-center cursor-pointer p-2 rounded-md hover:bg-gray-100">
                          <span className="font-bold text-lg">{value}</span>
                          <input type="radio" name={`pregunta_${pregunta.id}`} value={value} onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value, pregunta.tipo)} required={pregunta.es_requerido} className="mt-1 h-5 w-5 text-blue-600" />
                        </label>);
                      })}
                    </div>
                  </div>
                )}
                {pregunta.tipo === 'archivo' && (<input type="file" className="w-full" onChange={(e) => handleRespuestaChange(pregunta.id, e.target.files[0], pregunta.tipo)} required={pregunta.es_requerido} />)}
                {/* Muestra el error de validación específico para esta pregunta */}
                {errores[`respuestas.${pregunta.id}`] && (
                  <div className="mt-2">
                    <Alerta>{errores[`respuestas.${pregunta.id}`][0]}</Alerta>
                  </div>
                )}
              </div>
            );
          })}

          {/* --- LÓGICA CONDICIONAL PARA EL BOTÓN DE ENVÍO --- */}

          {isPreview ? (
            <div className="p-4 text-center bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
              Estás en modo de previsualización. Las respuestas no se guardarán.
            </div>
          )
            : user ? (
              // Si hay un usuario, mostramos el botón para enviar
              <button type="submit" className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-900 transition-colors">
                Enviar Encuesta
              </button>
            ) : (
              // Si no hay usuario, mostramos un mensaje y un enlace al login
              <div className="mt-8 p-4 text-center bg-gray-100 rounded-lg">
                <p className="font-semibold">Debes iniciar sesión para poder responder a esta encuesta.</p>
                <Link to={`/auth/login`} state={{ from: location }} className="text-blue-600 hover:underline">
                  Iniciar Sesión o Crear Cuenta
                </Link>
              </div>
            )}
        </form>
      </div>
    </div>
  );
}