import { v4 as uuidv4 } from 'uuid';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TipoPreguntaDropdown from './TipoPreguntaDropdown';
import useAutosizeTextarea from '../hooks/useAutosizeTextarea'; // 1. Importa el hook

import { closestCenter, DndContext } from '@dnd-kit/core';
import SortableOpcion from './SortableOpcion';

export default function PreguntaEditor({ pregunta, onUpdate, onDelete, isActive, setActive, errors = {} }) {
  // 2. Llama al hook para el texto de la pregunta, pasando también isActive
  const preguntaRef = useAutosizeTextarea(pregunta.pregunta, isActive);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: pregunta.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none', // Previene el scroll en toda la tarjeta
  };
  // Función para manejar el cambio en el texto de una opción
  const handleOptionChange = (optionId, nuevoTexto) => {
    const nuevasOpciones = pregunta.opciones.map(opt =>
      opt.id === optionId ? { ...opt, opcion_texto: nuevoTexto } : opt
    );
    onUpdate(pregunta.id, 'opciones', nuevasOpciones);
  };

  // Función para añadir una nueva opción a la pregunta
  const agregarOpcion = () => {
    const nuevasOpciones = [
      ...pregunta.opciones,
      { id: uuidv4(), opcion_texto: `Opción ${pregunta.opciones.length + 1}` }
    ];
    onUpdate(pregunta.id, 'opciones', nuevasOpciones);
  };

  // Función para eliminar una opción
  const eliminarOpcion = (optionId) => {
    const nuevasOpciones = pregunta.opciones.filter(opt => opt.id !== optionId);
    onUpdate(pregunta.id, 'opciones', nuevasOpciones);
  };
  // --- VISTA ACTIVA (EL EDITOR COMPLETO) ---
  // --- VISTA ACTIVA (EL EDITOR COMPLETO) ---
  // --- NUEVA FUNCIÓN para manejar el reordenamiento de opciones ---
  const handleOpcionDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pregunta.opciones.findIndex(opt => opt.id === active.id);
      const newIndex = pregunta.opciones.findIndex(opt => opt.id === over.id);
      const nuevasOpciones = arrayMove(pregunta.opciones, oldIndex, newIndex);
      onUpdate(pregunta.id, 'opciones', nuevasOpciones);
    }
  };


  if (isActive) {
    if (pregunta.tipo === 'seccion') {
      return (
        <div ref={setNodeRef}
          style={style} className="bg-white p-6 rounded-lg shadow-md mt-6 border-l-4 border-blue-500 ">
          <div {...attributes} {...listeners} className="cursor-grab">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab touch-action-none p-2 text-gray-400 hover:text-gray-600 flex justify-center items-center"
              title="Arrastrar para reordenar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </div>

          </div>
          <input
            type="text"
            value={pregunta.titulo_seccion || ''}
            onChange={(e) => onUpdate(pregunta.id, 'titulo_seccion', e.target.value)}
            className="text-xl font-semibold w-full border-b py-2 mt-4 outline-none focus:border-blue-500 "
            placeholder="Título de la sección"
          />
          {errors.titulo_seccion && <p className="text-red-500 text-sm mt-1 uppercase">{errors.titulo_seccion}</p>}
          <textarea
            value={pregunta.descripcion_seccion || ''}
            onChange={(e) => onUpdate(pregunta.id, 'descripcion_seccion', e.target.value)}
            className="text-gray-600 mt-2 w-full border-b py-2 outline-none focus:border-blue-500"
            placeholder="Descripción de la sección (opcional)"
          ></textarea>
          {errors.descripcion_seccion && <p className="text-red-500 text-sm mt-1 uppercase">{errors.descripcion_seccion}</p>}

          <div className="flex justify-end items-center">
            <button type="button" onClick={() => onDelete(pregunta.id)} className="text-gray-500 hover:text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>

        </div>


      );
    }


    return (
      <div ref={setNodeRef} style={style} className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div {...attributes} {...listeners} className="cursor-grab">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab touch-action-none p-2 text-gray-400 hover:text-gray-600 flex justify-center items-center"
            title="Arrastrar para reordenar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
          </div>

        </div>
        {/* -- Cabecera de la Pregunta -- */}
        <div className="flex justify-between items-center mb-5 ">
          <textarea
            ref={preguntaRef}
            className="text-gray-600 mt-4 w-full border-b py-2 outline-none focus:border-blue-600 transition-colors resize-none overflow-hidden"
            value={pregunta.pregunta || ''} // Asegúrate de que el valor nunca sea null
            //onEditorChange={(e) => onUpdate(pregunta.id, 'pregunta', content)}
            onBlur={() => setActive(null)}
            placeholder='Ingresa tu pregunta'
            onChange={(e) => onUpdate(pregunta.id, 'pregunta', e.target.value)}
            rows="1"
          />

          <TipoPreguntaDropdown
            tipoActual={pregunta.tipo}
            onTipoChange={(nuevoTipo) => onUpdate(pregunta.id, 'tipo', nuevoTipo)}
          />
        </div>
        {/* 2. Muestra el mensaje de error si existe */}
        {errors.pregunta && <p className="text-red-500 text-sm mt-1 uppercase">{errors.pregunta}</p>}

        {/* -- Cuerpo de la Pregunta (Contenido dinámico) -- */}
        <div>
          {['opcion_unica', 'opcion_multiple', 'desplegable'].includes(pregunta.tipo) && (<>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleOpcionDragEnd}>
              <SortableContext items={pregunta.opciones} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {pregunta.opciones.map(opcion => (
                    <SortableOpcion
                      key={opcion.id}
                      opcion={opcion}
                      preguntaTipo={pregunta.tipo}
                      onOptionChange={handleOptionChange}
                      onOptionDelete={eliminarOpcion}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {/* --- BOTÓN AÑADIDO AQUÍ --- */}
            <button
              type="button"
              onClick={agregarOpcion}
              className="text-sm text-blue-600 mt-4 hover:underline"
            >
              Añadir opción
            </button>

          </>)}
          {errors.opciones && <p className="text-red-500 text-sm mt-2 uppercase">{errors.opciones}</p>}

          {/* --- VISTAS PARA LOS NUEVOS TIPOS DE PREGUNTA --- */}
          {pregunta.tipo === 'texto_corto' && (<p className="border-b-2 border-dashed w-1/2 text-gray-500 py-2">Respuesta de texto corto</p>)}
          {pregunta.tipo === 'texto_largo' && (<div className="border-2 rounded-md p-2 text-gray-400 text-sm">Respuesta de texto largo (párrafo)</div>)}
          {pregunta.tipo === 'fecha' && (<p className="border-b-2 border-dashed w-1/2 text-gray-500 py-2">DD/MM/AAAA</p>)}
          {pregunta.tipo === 'hora' && (<p className="border-b-2 border-dashed w-1/2 text-gray-500 py-2">hh:mm</p>)}
          {pregunta.tipo === 'archivo' && (<div className="border p-4 rounded-md text-center text-gray-500"><p>El usuario podrá subir un archivo</p></div>)}
          {pregunta.tipo === 'escala' && (
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Escala de 1 a:</label>
                <select value={pregunta.escala_max || 5} onChange={e => onUpdate(pregunta.id, 'escala_max', parseInt(e.target.value))} className="w-full p-2 border rounded-md mt-1">
                  {[...Array(9)].map((_, i) => <option key={i + 2} value={i + 2}>{i + 2}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm">Etiqueta para el valor 1 (Opcional)</label>
                <input type="text" value={pregunta.escala_label_inicio || ''} onChange={e => onUpdate(pregunta.id, 'escala_label_inicio', e.target.value)} className="w-full p-2 border rounded-md mt-1" placeholder="Ej. Nada satisfecho" />
              </div>
              <div>
                <label className="text-sm">Etiqueta para el valor máximo (Opcional)</label>
                <input type="text" value={pregunta.escala_label_fin || ''} onChange={e => onUpdate(pregunta.id, 'escala_label_fin', e.target.value)} className="w-full p-2 border rounded-md mt-1" placeholder="Ej. Muy satisfecho" />
              </div>
            </div>
          )}

        </div>

        {/* -- Pie de la Pregunta (Acciones) -- */}
        <div className="flex justify-end items-center mt-6 pt-4 border-t gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={pregunta.es_requerido}
              onChange={(e) => onUpdate(pregunta.id, 'es_requerido', e.target.checked)}
            />
            Obligatoria
          </label>
          <button type="button" onClick={() => onDelete(pregunta.id)} className="text-gray-500 hover:text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>

      </div>
    );
  }

  // --- VISTA INACTIVA (LA PREVISUALIZACIÓN) ---
  // 1. Comprueba si hay algún error para esta pregunta.
  const hasErrors = Object.values(errors).some(error => !!error);

  return (
    // 2. Añade un borde rojo si hay errores.
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-lg shadow-md mt-6 cursor-pointer border hover:ring-2 hover:ring-blue-200 ${hasErrors ? 'border-red-400 ring-2 ring-red-400' :
     'border-gray-200'}`}      onClick={setActive}
    >
      <div {...attributes} {...listeners} className="cursor-grab touch-action-none p-2 text-gray-400 hover:text-gray-600 flex justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg>
      </div>
      <div className="flex items-start gap-2 ">
        <div className="flex-1 min-w-0">
          {pregunta.tipo === 'seccion' ? (
            <div>
              <h3 className="text-xl font-bold text-black-700 pl-2 break-words">{pregunta.titulo_seccion || 'Sección sin título'}</h3>
              <p className="text-gray-600 mt-1 pl-3 italic break-words">{pregunta.descripcion_seccion}</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start">
                <div className="prose w-full min-w-0 break-words" dangerouslySetInnerHTML={{ __html: pregunta.pregunta || '<p class="text-gray-500">Haz clic para editar la pregunta...</p>' }} />
                <span className="text-sm font-medium text-gray-500 capitalize ml-4 flex-shrink-0">{pregunta.tipo.replace('_', ' ')}</span>
              </div>

              <div className="mt-4 pointer-events-none">
                {pregunta.tipo.includes('opcion') && (
                  <div className="space-y-2 ">
                    {pregunta.opciones.map(opcion => (
                      <div key={opcion.id} id={opcion.id} className="flex items-center gap-2 text-gray-600  ">
                        <input type={pregunta.tipo === 'opcion_unica' ? 'radio' : 'checkbox'} disabled className="cursor-not-allowed " />
                        <span className='min-w-0 break-words'>{opcion.opcion_texto}</span>
                      </div>
                    ))}
                  </div>
                )}
                {pregunta.tipo === 'texto_corto' && (<p className="border-b-2 border-dashed w-1/2 text-gray-500 py-2">Respuesta de texto corto</p>)}
                {pregunta.tipo === 'texto_largo' && (<div className="border-2 rounded-md p-2 text-gray-400 text-sm">Respuesta de texto largo (párrafo)</div>)}
                {pregunta.tipo === 'fecha' && (<p className="border-b-2 border-dashed w-1/2 text-gray-500 py-2">DD/MM/AAAA</p>)}
                {pregunta.tipo === 'hora' && (<p className="border-b-2 border-dashed w-1/2 text-gray-500 py-2">hh:mm</p>)}
                {pregunta.tipo === 'archivo' && (<div className="border p-4 rounded-md text-center text-gray-500"><p>El usuario podrá subir un archivo</p></div>)}
                {pregunta.tipo === 'desplegable' && (<div className="border rounded-md p-2 text-gray-500 mt-2">Opciónes ▼</div>)}

                {pregunta.tipo === 'escala' && (
                  <div className="flex justify-between items-center text-center text-gray-500 mt-2">
                    <span className="text-sm">{pregunta.escala_label_inicio}</span>
                    {[...Array(pregunta.escala_max || 5)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span>{i + 1}</span>
                        <div className="h-5 w-5 border-2 border-gray-400 rounded-full mt-1"></div>
                      </div>
                    ))}
                    <span className="text-sm">{pregunta.escala_label_fin}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Muestra el contenedor de errores si los hay (MOVIDO AQUÍ) */}
          {hasErrors && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              <p className="font-bold mb-1">Esta pregunta tiene errores:</p>
              <ul className="list-disc list-inside">
                {Object.entries(errors).map(([key, value]) =>
                  value ? <li key={key}>{value}</li> : null
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}