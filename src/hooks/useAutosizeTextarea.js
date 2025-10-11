// src/hooks/useAutosizeTextarea.js
import { useEffect, useRef } from 'react';

export default function useAutosizeTextarea(value) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const textarea = ref.current;
      textarea.style.height = 'auto'; // Resetea para que pueda encogerse
      textarea.style.height = `${textarea.scrollHeight}px`; // Ajusta a la altura del contenido
    }
  }, [value]); // Se ejecuta cada vez que el valor del textarea cambia

  return ref; // Devuelve la referencia para asignarla al elemento
}