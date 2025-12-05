import { useState, useEffect } from 'react';
import Alerta from './Alerta'; // Asumiendo que Alerta puede manejar 'error' y 'success'

export default function EditUserModal({ isOpen, onClose, user, onSave }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Estados para feedback
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!user;

  useEffect(() => {
    if (isOpen) {
      if (user) { // Modo Edición
        setName(user.name);
        setEmail(user.email);
        setIsAdmin(user.is_admin);
        setPassword('');
        setPasswordConfirmation('');
      } else { // Modo Creación
        setName('');
        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
        setIsAdmin(false);
      }
      // Limpiar feedback al abrir
      setErrors({});
      setSuccessMessage('');
      setIsSaving(false);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});
    setSuccessMessage('');

    const formData = isEditing 
      ? { name, email, is_admin: isAdmin }
      : { name, email, password, password_confirmation, is_admin: isAdmin };
      
    // onSave ahora es una función async que maneja la API y los estados
    await onSave(user?.id, formData, setErrors, setSuccessMessage);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? `Editar Usuario: ${user.name}` : 'Crear Nuevo Usuario'}
        </h2>

        {successMessage && <Alerta tipo="success">{successMessage}</Alerta>}
        {errors.general && <Alerta tipo="error">{errors.general}</Alerta>}
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" required />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" required />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
          </div>
          
          {!isEditing && (<>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" />
              <p className="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 8 caracteres.</p>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  value={password_confirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
              </div>
              </>
          )}

          <div className="pt-2">
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">¿Es Administrador?</span>
            </label>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border" disabled={isSaving}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={isSaving}>
              {isSaving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}