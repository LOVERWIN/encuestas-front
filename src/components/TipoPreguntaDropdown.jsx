import { useState } from 'react';

const options = [
  { value: 'texto_corto', label: 'Texto Corto' },
  { value: 'texto_largo', label: 'Párrafo' },
  { value: 'opcion_unica', label: 'Opción Única (Radio)' },
  { value: 'opcion_multiple', label: 'Casillas de Verificación' },
  { value: 'escala', label: 'Escala Lineal' },
  { value: 'desplegable', label: 'Menú Desplegable' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'hora', label: 'Hora' },
  { value: 'archivo', label: 'Subir Archivo' },
  { value: 'seccion', label: 'Nueva Seccion' },
];

export default function TipoPreguntaDropdown({ tipoActual, onTipoChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(opt => opt.value === tipoActual)?.label;

  const handleSelect = (value) => {
    onTipoChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-48">
      <div>
        <button
          type="button"
          className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedLabel}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {options.map(option => (
              <a
                key={option.value}
                href="#"
                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={(e) => { e.preventDefault(); handleSelect(option.value); }}
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}