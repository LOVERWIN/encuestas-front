import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Para generar IDs temporales únicos
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import PreguntaEditor from "../components/PreguntaEditor";
import useAutosizeTextarea from "../hooks/useAutosizeTextarea";
import useOnClickOutside from "../hooks/useOnClickOutside";

import {
  getEncuestaForEditor,
  searchUsers,
  syncInvitados,
  createEncuesta,
  updateEncuesta,
} from "../services/encuestaService";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";

import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import AsyncSelect from "react-select/async";
import useAuth from "../hooks/useAuth";

// El fetcher ahora usa la nueva función del servicio
const fetcher = (slug) => getEncuestaForEditor(slug).then((res) => res.data);

const getFutureDateString = (daysToAdd) => {
  const today = new Date();
  today.setDate(today.getDate() + daysToAdd);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const questionTypes = [
    { type: 'opcion_unica', label: 'Opción Múltiple', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { type: 'texto_corto', label: 'Respuesta Corta', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg> },
    { type: 'texto_largo', label: 'Párrafo', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg> },
    { type: 'escala', label: 'Escala Lineal', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg> },
    { type: 'seccion', label: 'Añadir Sección', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg> },
  ];

export default function EncuestaEditor() {
    const { user } = useAuth();

  if (!user?.is_admin) {
    return 'No tienes los permisos suficientes';
  }

  const [errors, setErrors] = useState({});
  const { slug } = useParams();
  const isEditing = !!slug;
  const navigate = useNavigate();

  const { data: encuestaData, isLoading, error, mutate } = useSWR(isEditing ? slug : null, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  const [titulo, setTitulo] = useState("Encuesta Sin Título");
  const [descripcion, setDescripcion] = useState("");
  const [saveStatus, setSaveStatus] = useState({ loading: false, message: '' });
  const [preguntas, setPreguntas] = useState([]);
  const [esPublica, setEsPublica] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(isEditing ? '' : getFutureDateString(2));
  const [fechaTermino, setFechaTermino] = useState(isEditing ? '' : getFutureDateString(4));
  const [invitados, setInvitados] = useState([]);
  const [emailList, setEmailList] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isAddMenuOpen, setAddMenuOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const addMenuRef = useRef(null);
  useOnClickOutside(addMenuRef, () => setAddMenuOpen(false));

  const tituloRef = useAutosizeTextarea(titulo);
  const descripcionRef = useAutosizeTextarea(descripcion);
  const formRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 1000, tolerance: 20 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPreguntas((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        return newArray.map((pregunta, index) => ({ ...pregunta, orden: index + 1 }));
      });
    }
  };

  useEffect(() => {
    if (encuestaData) {
      setTitulo(encuestaData.titulo);
      setDescripcion(encuestaData.descripcion || "");
      setEsPublica(encuestaData.es_publica);
      setPreguntas(encuestaData.preguntas || []);
      setFechaInicio(encuestaData.fecha_inicio || '');
      setFechaTermino(encuestaData.fecha_termino || '');
      const invitadosData = encuestaData.usuarios_invitados || [];
      setInvitados(invitadosData.map((user) => ({ value: user.id, label: `${user.name} (${user.email})` })));
      const emailsPendientes = encuestaData.invitaciones || [];
      setEmailList(emailsPendientes.map((inv) => inv.email).join("\n"));
    }
  }, [encuestaData, isEditing]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const loadOptions = (inputValue, callback) => {
    if (inputValue.length < 2) {
      callback([]);
      return;
    }
    searchUsers(inputValue).then((res) => {
      const options = res.data.map((user) => ({ value: user.id, label: `${user.name} (${user.email})` }));
      callback(options);
    });
  };

  const agregarPregunta = (tipo) => {
    const nuevoId = uuidv4();
    const necesitaOpciones = ['opcion_unica', 'opcion_multiple', 'desplegable'].includes(tipo);
    const nuevaPregunta = {
      id: nuevoId,
      tipo: tipo,
      orden: preguntas.length + 1,
      es_requerido: false,
      pregunta: tipo !== 'seccion' ? '' : null,
      opciones: necesitaOpciones ? [{ id: uuidv4(), opcion_texto: "Opción 1", orden: 1 }] : [],
      escala_max: tipo === 'escala' ? 5 : null,
      escala_label_inicio: tipo === 'escala' ? '' : null,
      escala_label_fin: tipo === 'escala' ? '' : null,
      titulo_seccion: tipo === 'seccion' ? '' : null,
      descripcion_seccion: tipo === 'seccion' ? '' : null,
    };
    setPreguntas(prevPreguntas => [...prevPreguntas, nuevaPregunta]);
    setActiveQuestionId(nuevoId);
    setAddMenuOpen(false);
  };

  const actualizarPregunta = (id, campo, valor) => {
    setPreguntas(preguntas.map(p => {
      if (p.id === id) {
        const preguntaActualizada = { ...p, [campo]: valor };
        if (campo === 'tipo') {
          const tiposConOpciones = ['opcion_unica', 'opcion_multiple', 'desplegable'];
          const nuevoTipoNecesitaOpciones = tiposConOpciones.includes(valor);
          const tipoAnteriorTeníaOpciones = tiposConOpciones.includes(p.tipo);
          if (tipoAnteriorTeníaOpciones && !nuevoTipoNecesitaOpciones) {
            preguntaActualizada.opciones = [];
          }
          if (nuevoTipoNecesitaOpciones && p.opciones.length === 0) {
            preguntaActualizada.opciones = [{ id: uuidv4(), opcion_texto: "Opción 1", orden: 1 }];
          }
          if (valor === 'escala') {
            preguntaActualizada.escala_max = p.escala_max || 5;
          }
        }
        return preguntaActualizada;
      }
      return p;
    }));
  };

  const handleSaveClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const eliminarPregunta = (id) => {
    setPreguntas(preguntas.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus({ loading: true, message: "" });
    const payload = {
      titulo,
      descripcion,
      es_publica: esPublica,
      fecha_inicio: fechaInicio || null,
      fecha_termino: fechaTermino || null,
      preguntas: preguntas.map((p) => ({
        ...(!isNaN(p.id) && { id: p.id }),
        pregunta: p.pregunta,
        tipo: p.tipo,
        es_requerido: p.es_requerido,
        escala_max: p.escala_max || null,
        escala_label_inicio: p.escala_label_inicio || null,
        escala_label_fin: p.escala_label_fin || null,
        titulo_seccion: p.titulo_seccion || null,
        descripcion_seccion: p.descripcion_seccion || null,
        orden: p.orden,
        opciones: p.opciones.map((opt) => ({ ...(!isNaN(opt.id) && { id: opt.id }), opcion_texto: opt.opcion_texto })),
      })),
    };

    try {
      let encuestaGuardada;
      let successMessage = '';
      if (slug) {
        const response = await updateEncuesta(slug, payload);
        encuestaGuardada = response.data;
        successMessage = '¡Encuesta actualizada con éxito!';
        mutate(); // Revalida los datos de SWR
      } else {
        const response = await createEncuesta(payload);
        encuestaGuardada = response.data;
        successMessage = '¡Encuesta creada con éxito!';
      }

      const encuestaId = encuestaGuardada.id;
      if (!esPublica) {
        const invitadosIds = invitados.map((inv) => inv.value);
        await syncInvitados(encuestaId, invitadosIds, emailList);
      } else {
        await syncInvitados(encuestaId, [], "");
      }

      setSaveStatus({ loading: false, message: successMessage });
      showToast(successMessage, 'success');

      if (!isEditing) {
        navigate(`/encuestas/${encuestaGuardada.slug}/editar`, { replace: true });
      }

    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
        showToast('Hay errores de validación en el formulario.', 'error');
      } else {
        showToast('Ocurrió un error inesperado al guardar.', 'error');
      }
      console.error("Error al guardar la encuesta:", error);
      setSaveStatus({ loading: false, message: "No se pudo guardar." });
    }
  };


  if (isLoading) return <p>Cargando editor...</p>;
  if (error) return <p>No se puede cargar la encuesta o no tienes permiso para realizar esta accion...</p>;

  const sePuedenEditarPreguntas = !isEditing || (encuestaData?.respuestas_count === 0);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 min-h-screen">
        {toast.show && (
            <div
                className={`fixed top-24 right-5 p-4 rounded-lg shadow-lg text-white transition-all duration-300 z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {toast.message}
            </div>
        )}

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {slug ? "Editar Encuesta" : "Crear Nueva Encuesta"}
      </h1>

      <form ref={formRef} onSubmit={handleSubmit} className="pb-1"> {/* Aumentado el padding inferior */}
        {/* --- TARJETA DE DETALLES PRINCIPALES --- */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-8 border-blue-600">
          <textarea
            ref={tituloRef}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="text-3xl font-bold w-full border-b py-2 outline-none focus:border-blue-500 transition-colors resize-none overflow-hidden"
            placeholder="Título de la Encuesta"
            required
          />
          <textarea
            ref={descripcionRef}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="text-gray-600 mt-4 w-full border-b py-2 outline-none focus:border-blue-600 transition-colors resize-none overflow-hidden"
            placeholder="Descripción de la encuesta"
            rows="1"
          />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input
                type="date"
                id="fecha_inicio"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="fecha_termino" className="block text-sm font-medium text-gray-700">Fecha de Término</label>
              <input
                type="date"
                id="fecha_termino"
                value={fechaTermino}
                onChange={e => setFechaTermino(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          {errors.fecha_inicio && <p className="text-red-500 text-sm mt-2 uppercase">{errors.fecha_inicio}</p>}
          <div className="mt-6 flex items-center justify-end">
            <span className={`mr-3 font-semibold ${!esPublica ? "text-blue-600" : "text-gray-400"}`}>
              Privada
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={esPublica} onChange={() => setEsPublica(!esPublica)} />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className={`ml-3 font-semibold ${esPublica ? "text-blue-600" : "text-gray-400"}`}>
              Pública
            </span>
          </div>
        </div>
        {!esPublica && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Invitar Usuarios
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Busca usuarios por nombre o correo para permitirles responder
                esta encuesta.
              </p>
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                value={invitados}
                onChange={setInvitados}
                placeholder="Buscar y seleccionar usuarios..."
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                menuPortalTarget={document.body}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                O pegar una lista de correos:
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Separa los correos por comas, espacios o saltos de línea.
              </p>
              <textarea
                className="w-full p-2 border rounded-md"
                rows="5"
                placeholder="ejemplo1@correo.com, ejemplo2@correo.com..."
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
              ></textarea>
            </div>
          </div>
        )}

        {/* ... (resto del formulario) ... */}
        
      {sePuedenEditarPreguntas ? (
        <>
          {preguntas.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
              <SortableContext items={preguntas} strategy={verticalListSortingStrategy}>
                {preguntas.map((pregunta, index) => {
                  const preguntaErrors = {
                    pregunta: errors[`preguntas.${index}.pregunta`]?.[0],
                    opciones: errors[`preguntas.${index}.opciones`]?.[0],
                    escala_max: errors[`preguntas.${index}.escala_max`]?.[0],
                    titulo_seccion: errors[`preguntas.${index}.titulo_seccion`]?.[0],
                    descripcion_seccion: errors[`preguntas.${index}.descripcion_seccion`]?.[0],
                  };
                  return (
                    <PreguntaEditor
                      key={pregunta.id}
                      pregunta={pregunta}
                      onUpdate={actualizarPregunta}
                      onDelete={eliminarPregunta}
                      errors={preguntaErrors}
                      isActive={pregunta.id === activeQuestionId}
                      setActive={() => setActiveQuestionId(pregunta.id)}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md mt-6 border-2 border-dashed">
              <h3 className="text-xl font-semibold text-gray-700">Aún no hay preguntas</h3>
              <p className="text-gray-500 mt-2">¡Usa el botón `+` para empezar a construir tu encuesta!</p>
            </div>
          )}
        </>
      ) : (
        isEditing && (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mt-6">
                <strong>Atención:</strong> Esta encuesta ya tiene respuestas. Solo puedes editar el título, la descripción y las fechas. La estructura de preguntas está bloqueada.
            </div>
        )
      )}
      </form>

      {/* --- BARRA DE HERRAMIENTAS INFERIOR --- */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md flex justify-between items-center sticky bottom-4">
   
          {/* Lado Izquierdo: Menú para Añadir Pregunta */}
          {sePuedenEditarPreguntas ? (
            <div ref={addMenuRef} className="relative">
              {/* Menú desplegable hacia arriba */}
              <div className={`absolute bottom-full mb-2 w-64 rounded-lg shadow-xl bg-white border border-gray-200 transition-all duration-300 origin-bottom-left ${isAddMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                <div className="p-2 space-y-1">
                  {questionTypes.map(({ type, label, icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => agregarPregunta(type)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {icon}
                      <span className="font-medium text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón principal para abrir/cerrar menú */}
              <button
                type="button"
                onClick={() => setAddMenuOpen(prev => !prev)}
                className={`w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-300 transform ${isAddMenuOpen ? 'rotate-45' : ''}`}
                aria-label="Añadir nueva pregunta"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          ) : <div/> /* Espaciador para mantener el botón de guardar a la derecha */}

          {/* Lado Derecho: Botón de Guardar */}
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={saveStatus.loading || preguntas.length === 0}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saveStatus.loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Encuesta')}
          </button>
        
      </div>
    </div>
  );
}
