import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableOpcion({ opcion, preguntaTipo, onOptionChange, onOptionDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: opcion.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 mb-2">
      {/* Manillar de Arrastre */}
      <div {...attributes} {...listeners} className="cursor-grab touch-action-none text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      </div>
      
      {/* Input de Radio/Checkbox */}
      <input 
        type={preguntaTipo === 'opcion_unica' || preguntaTipo === 'desplegable' ? 'radio' : 'checkbox'}
        className="cursor-not-allowed"
        disabled
      />
      
      {/* Input de Texto de la Opción */}
      <input
        type="text"
        value={opcion.opcion_texto}
        onChange={(e) => onOptionChange(opcion.id, e.target.value)}
        className="w-full py-1 border-b outline-none focus:border-blue-500"
      />
      
      {/* Botón de Eliminar Opción */}
      <button type="button" onClick={() => onOptionDelete(opcion.id)} className="text-red-500 hover:text-red-700 font-bold text-xl">
        &times;
      </button>
    </div>
  );
}