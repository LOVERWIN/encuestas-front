// src/hooks/useAutosizeTextarea.js
import { useEffect, useRef } from 'react';

export default function useAutosizeTextarea(value, isActive) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const textarea = ref.current;
      textarea.style.height = 'auto'; // Resetea para que pueda encogerse
      textarea.style.height = `${textarea.scrollHeight}px`; // Ajusta a la altura del contenido
    }
  }, [value, isActive]); // Se ejecuta cuando el valor o el estado de activación cambian

  return ref; // Devuelve la referencia para asignarla al elemento
}