import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Para generar IDs temporales únicos
// Importa un nuevo componente que crearemos
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import AsyncSelect from "react-select/async";
import PreguntaEditor from "../components/PreguntaEditor";
import useAutosizeTextarea from "../hooks/useAutosizeTextarea";

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
  restrictToVerticalAxis, // 1. Importa el modificador
} from '@dnd-kit/modifiers';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// El fetcher ahora usa la nueva función del servicio
const fetcher = (slug) => getEncuestaForEditor(slug).then((res) => res.data);
// Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export default function EncuestaEditor() {

  const [errors, setErrors] = useState({});

  const { slug } = useParams(); // Obtenemos el slug si estamos editando

  const isEditing = !!slug;
  const navigate = useNavigate();
  // Si hay un slug, carga los datos de la encuesta existente
  const {
    data: encuestaData,
    isLoading,
    error,
  } = useSWR(isEditing ? slug : null, fetcher, {
    // --- AÑADE ESTAS OPCIONES ---
    shouldRetryOnError: false, // No reintentar si la petición falla
    revalidateOnFocus: false, // No volver a pedir los datos al cambiar de pestaña
  });

  const [titulo, setTitulo] = useState("Encuesta Sin Título");
  const [descripcion, setDescripcion] = useState("");
  const [saveStatus, setSaveStatus] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [esPublica, setEsPublica] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(getTodayString());
  const [fechaTermino, setFechaTermino] = useState('');
  const [invitados, setInvitados] = useState([]);
  const [emailList, setEmailList] = useState(""); // Nuevo estado para el textarea
  // 1. Nuevo estado para guardar el ID de la pregunta activa
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  // 2. Usa el hook para cada campo. ¡La lógica de useEffect desaparece de aquí!
  const tituloRef = useAutosizeTextarea(titulo);
  const descripcionRef = useAutosizeTextarea(descripcion);
  const formRef = useRef(null);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      // Presiona y mantén por 100ms (más rápido que el default)
      // y permite un pequeño movimiento del dedo (5px) antes de cancelar.
      activationConstraint: {
        delay: 1000,
        tolerance: 20,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPreguntas((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // 1. Reordena el array
        const newArray = arrayMove(items, oldIndex, newIndex);

        // 2. Actualiza el campo 'orden' para cada pregunta
        return newArray.map((pregunta, index) => ({
          ...pregunta,
          orden: index + 1,
        }));
      });
    }
  };
  // useEffect que se activa cuando el array de preguntas cambia


  // useEffect para poblar el formulario cuando los datos de la encuesta se cargan (en modo edición)
  useEffect(() => {
    if (encuestaData) {
      setTitulo(encuestaData.titulo);
      setDescripcion(encuestaData.descripcion || "");
      setEsPublica(encuestaData.es_publica);
      setPreguntas(encuestaData.preguntas || []);
      setFechaInicio(encuestaData.fecha_inicio || '');
      setFechaTermino(encuestaData.fecha_termino || '');
      const invitadosData = encuestaData.usuarios_invitados || [];
      setInvitados(
        invitadosData.map((user) => ({
          value: user.id,
          label: `${user.name} (${user.email})`,
        }))
      );
      // Poblar el textarea con los correos de invitaciones pendientes
      const emailsPendientes = encuestaData.invitaciones || [];
      setEmailList(emailsPendientes.map((inv) => inv.email).join("\n"));
    }
  }, [encuestaData, isEditing]);

  // Función para buscar usuarios para el selector
  const loadOptions = (inputValue, callback) => {
    if (inputValue.length < 2) {
      callback([]);
      return;
    }
    searchUsers(inputValue).then((res) => {
      const options = res.data.map((user) => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
      }));
      callback(options);
    });
  };

  const agregarPregunta = (tipo) => {
  const nuevoId = uuidv4();
  
  // Determinamos si el tipo de pregunta necesita opciones
  const necesitaOpciones = ['opcion_unica', 'opcion_multiple', 'desplegable'].includes(tipo);

  const nuevaPregunta = {
    id: nuevoId,
    tipo: tipo,
    orden: preguntas.length + 1,
    es_requerido: false,

    // --- LÓGICA CORREGIDA Y UNIFICADA ---
    
    // Si el tipo es 'seccion', 'pregunta' es null. Si no, es un string vacío.
    pregunta: tipo !== 'seccion' ? '' : null,
    
    // Solo crea el array de opciones si el tipo lo necesita
    opciones: necesitaOpciones ? [{ id: uuidv4(), opcion_texto: "Opción 1", orden: 1 }] : [],
    
    
    
    // Valores por defecto para escala
    escala_max: tipo === 'escala' ? 5 : null,
    escala_label_inicio: tipo === 'escala' ? '' : null,
    escala_label_fin: tipo === 'escala' ? '' : null,

    // Valores por defecto para sección
    titulo_seccion: tipo === 'seccion' ? '' : null,
    descripcion_seccion: tipo === 'seccion' ? '' : null,
  };

  setPreguntas(prevPreguntas => [...prevPreguntas, nuevaPregunta]);
  console.log(preguntas);
  setActiveQuestionId(nuevoId);
};

  const actualizarPregunta = (id, campo, valor) => {
  setPreguntas(preguntas.map(p => {
    if (p.id === id) {
      const preguntaActualizada = { ...p, [campo]: valor };

      // Si el campo que se está cambiando es el 'tipo'...
      if (campo === 'tipo') {
        const tiposConOpciones = ['opcion_unica', 'opcion_multiple', 'desplegable'];
        const nuevoTipoNecesitaOpciones = tiposConOpciones.includes(valor);
        const tipoAnteriorTeníaOpciones = tiposConOpciones.includes(p.tipo);

        // --- LÓGICA DE LIMPIEZA ---
        // Si el tipo anterior tenía opciones Y el nuevo tipo NO las necesita,
        // entonces limpiamos el array de opciones.
        if (tipoAnteriorTeníaOpciones && !nuevoTipoNecesitaOpciones) {
          preguntaActualizada.opciones = [];
        }
        
        // Si el nuevo tipo necesita opciones y no las tiene, se las añadimos.
        if (nuevoTipoNecesitaOpciones && p.opciones.length === 0) {
          preguntaActualizada.opciones = [{ id: uuidv4(), opcion_texto: "Opción 1", orden: 1 }];
        }
        
        // Si el nuevo tipo es 'escala', le ponemos el default.
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
    // 3. Simula un envío del formulario
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const eliminarPregunta = (id) => {
    setPreguntas(preguntas.filter((p) => p.id !== id));
  };

  // Faltarían funciones para manejar opciones...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus({ loading: true, message: "" }); // Inicia el estado de carga

    // Preparamos los datos para enviar a la API
    const payload = {
      titulo,
      descripcion,
      es_publica: esPublica, // Puedes añadir un campo en el form para esto
      fecha_inicio: fechaInicio || null, // Envía null si está vacío
      fecha_termino: fechaTermino || null,
      preguntas: preguntas.map((p) => ({
        // Omitimos los IDs temporales que no son números (los de UUID)
        ...(!isNaN(p.id) && { id: p.id }),
        pregunta: p.pregunta,
        tipo: p.tipo,
        es_requerido: p.es_requerido,
        // --- AÑADIMOS LOS CAMPOS FALTANTES DE LA ESCALA ---
        escala_max: p.escala_max || null,
        escala_label_inicio: p.escala_label_inicio || null,
        escala_label_fin: p.escala_label_fin || null,
        titulo_seccion: p.titulo_seccion || null,
        descripcion_seccion: p.descripcion_seccion || null,
        orden: p.orden,
        opciones: p.opciones.map((opt) => ({
          ...(!isNaN(opt.id) && { id: opt.id }),
          opcion_texto: opt.opcion_texto,
        })),
      })),
    };

    try {
      let encuestaGuardada;
      let successMessage = '';

      // Tu lógica para guardar o actualizar la encuesta principal (esto está perfecto)
      if (slug) {
        const response = await updateEncuesta(slug, payload);
        encuestaGuardada = response.data;
        successMessage = '¡Encuesta actualizada con éxito!';
      } else {
        const response = await createEncuesta(payload);
        encuestaGuardada = response.data;
        successMessage = '¡Encuesta creada con éxito!';
      }

      const encuestaId = encuestaGuardada.id;

      // --- LÓGICA DE INVITADOS UNIFICADA ---
      if (!esPublica) {
        // 2. Prepara los datos de ambas fuentes
        const invitadosIds = invitados.map((inv) => inv.value);

        // 3. Llama a UNA SOLA función de servicio que envía todo
        await syncInvitados(encuestaId, invitadosIds, emailList);

      } else {
        // 4. Si la encuesta se cambia a pública, limpiamos la lista de invitados
        await syncInvitados(encuestaId, [], "");
      }
      // --- NAVEGACIÓN CON MENSAJE ---
    // Redirigimos a la lista de encuestas y le pasamos el mensaje
    navigate("/encuestas", { state: { message: successMessage } });
    } catch (error) {
      if (error.response && error.response.status === 422) {
        // 2. Guardamos el objeto de errores de Laravel en el estado
        setErrors(error.response.data.errors);
      }
      console.error("Error al guardar la encuesta:", error);
      // 6. Mostramos un mensaje de error en la UI
      setSaveStatus({
        loading: false,
        message: "No se pudo guardar. Revisa los errores en los campos.",
      });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };
  if (isLoading) return <p>Cargando editor...</p>;
  if (error)
    return (
      <p>
        No se puede cargar la encuesta o no tienes permiso para realizar esta
        accion...
      </p>
    );

  // En src/views/EncuestaEditor.jsx
  const sePuedenEditarPreguntas = !isEditing || (encuestaData?.respuestas_count === 0);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {slug ? "Editar Encuesta" : "Crear Nueva Encuesta"}
      </h1>

      <form ref={formRef} onSubmit={handleSubmit}>
        {/* --- TARJETA DE DETALLES PRINCIPALES --- */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-8 border-blue-600">
          <textarea
            ref={tituloRef}
            value={titulo}
            onFocus={() => showToolbar("titulo", tituloRef)}
            onKeyDown={handleTitleKeyDown}
            onChange={(e) => setTitulo(e.target.value)}
            className="text-3xl font-bold w-full border-b py-2 outline-none focus:border-blue-500 transition-colors resize-none overflow-hidden"
            placeholder="Título de la Encuesta"
            required
          />

          <textarea
            ref={descripcionRef} // 4. Asigna la referencia al elemento
            value={descripcion}
            onFocus={() => showToolbar("descripcion", descripcionRef)}
            onChange={(e) => setDescripcion(e.target.value)}
            className="text-gray-600 mt-4 w-full border-b py-2 outline-none focus:border-blue-600 transition-colors resize-none overflow-hidden"
            placeholder="Descripción de la encuesta"
            rows="1" // Le decimos que empiece con una sola fila de altura
          />
          {/* --- NUEVOS CAMPOS DE FECHA --- */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700">Fecha de Inicio (Opcional)</label>
              <input
                type="date"
                id="fecha_inicio"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="fecha_termino" className="block text-sm font-medium text-gray-700">Fecha de Término (Opcional)</label>
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

          {/* --- INTERRUPTOR PÚBLICA/PRIVADA --- */}
          <div className="mt-6 flex items-center justify-end">
            <span
              className={`mr-3 font-semibold ${!esPublica ? "text-blue-600" : "text-gray-400"
                }`}
            >
              Privada
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={esPublica}
                onChange={() => setEsPublica(!esPublica)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span
              className={`ml-3 font-semibold ${esPublica ? "text-blue-600" : "text-gray-400"
                }`}
            >
              Pública
            </span>
          </div>
        </div>

        {/* --- SECCIÓN PARA AÑADIR INVITADOS (SI ES PRIVADA) --- */}
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
        {isEditing && !sePuedenEditarPreguntas && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mt-6">
            <strong>Atención:</strong> Esta encuesta ya tiene respuestas. Solo puedes editar el título, la descripción y las fechas. La estructura de preguntas está bloqueada.
          </div>
        )}
      {sePuedenEditarPreguntas && (
        <>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={preguntas}
            strategy={verticalListSortingStrategy}
          >
            {/* Mapeo de las preguntas ahora usa el componente Sortable */}
            {preguntas.map((pregunta, index) => {
              // 1. Construimos un objeto con todos los errores de esta pregunta
              const preguntaErrors = {
                pregunta: errors[`preguntas.${index}.pregunta`]?.[0],
                opciones: errors[`preguntas.${index}.opciones`]?.[0],
                escala_max: errors[`preguntas.${index}.escala_max`]?.[0],
                // ... puedes añadir más aquí si es necesario
              };

              return (
                <PreguntaEditor
                  key={pregunta.id}
                  pregunta={pregunta}
                  onUpdate={actualizarPregunta}
                  onDelete={eliminarPregunta}
                  // 2. Pasamos el objeto de errores completo
                  errors={preguntaErrors}
                  isActive={pregunta.id === activeQuestionId}
                  setActive={() => setActiveQuestionId(pregunta.id)}
                />
              );
            })}
          </SortableContext>
        </DndContext>

        
        </>
      )}
      </form>
      {/* --- BARRA DE HERRAMIENTAS RESPONSIVA --- */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md flex justify-between items-center sticky bottom-4 ">
          {sePuedenEditarPreguntas && (
          <div className=" lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => agregarPregunta("opcion_unica")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>

          </div>
          )}
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={saveStatus.loading} // Deshabilita el botón si está cargando
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700"
          >
            {/* {isEditing ? "Guardar Cambios" : "Crear Encuesta"} */}
              {saveStatus.loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Encuesta')}
          </button>
        </div>
    </div>
  );
}
