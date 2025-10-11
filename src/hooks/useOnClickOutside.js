import { useEffect } from 'react';

export default function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // No hacer nada si el clic es dentro del elemento referenciado o sus hijos
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      // Si el clic es fuera, ejecuta la función handler
      handler(event);
    };

    // Añade los event listeners al documento
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Limpieza: elimina los event listeners cuando el componente se desmonte
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Vuelve a ejecutar si la ref o el handler cambian
}