import { useState, useEffect } from 'react';
import Alerta from './Alerta';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, userName }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Limpiar el estado cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false);
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError('');
    setSuccessMessage('');
    // La función onConfirm ahora es async y maneja la lógica de la API
    await onConfirm(setError, setSuccessMessage);
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2>
        
        {/* Mensajes de estado */}
        {successMessage && <Alerta tipo="success">{successMessage}</Alerta>}
        {error && <Alerta tipo="error">{error}</Alerta>}

        {!successMessage && (
          <>
            <p className="mb-6 text-gray-700">
              ¿Estás seguro de que quieres eliminar al usuario <strong className="font-bold">{userName}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción no se puede deshacer.
            </p>
          </>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded border border-gray-300 text-gray-700 font-semibold"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          {!successMessage && (
            <button 
              onClick={handleConfirm} 
              className="px-6 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:bg-red-400"
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}