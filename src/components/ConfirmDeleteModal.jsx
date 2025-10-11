import React from 'react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, userName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2>
        <p className="mb-6 text-gray-700">
          ¿Estás seguro de que quieres eliminar al usuario <strong className="font-bold">{userName}</strong>?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded border border-gray-300 text-gray-700 font-semibold">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-6 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}