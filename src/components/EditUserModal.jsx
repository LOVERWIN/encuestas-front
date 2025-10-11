import { useState, useEffect } from 'react';

export default function EditUserModal({ isOpen, onClose, user, onSave }) {
    // 1. Estados para todos los campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const isEditing = !!user; // true si estamos editando, false si estamos creando

  // Cada vez que el modal se abre con un nuevo usuario, actualizamos el estado del checkbox
  // 2. useEffect para poblar el formulario en modo edición o limpiarlo en modo creación
  useEffect(() => {
    if (isOpen) {
      if (user) { // Modo Edición
        setName(user.name);
        setEmail(user.email);
        setIsAdmin(user.is_admin);
        setPassword(''); // No mostramos la contraseña al editar
        setPasswordConfirmation(''); // No mostramos la contraseña al editar
      } else { // Modo Creación
        setName('');
        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
        setIsAdmin(false);
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // 3. El handleSubmit ahora envía un objeto completo
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = isEditing 
      ? { name, email, is_admin: isAdmin } // Al editar, no enviamos la contraseña
      : { name, email, password, password_confirmation, is_admin: isAdmin };
    onSave(user?.id, formData);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? `Editar Usuario: ${user.name}` : 'Crear Nuevo Usuario'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 4. Campos que se muestran siempre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" required />
          </div>
          
          {/* 5. Campos de contraseña solo para la creación */}
          {!isEditing && (<>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" placeholder="(Opcional, se generará una si se deja en blanco)"/>
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

          {/* Checkbox de Administrador */}
          <div className="pt-2">
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">¿Es Administrador?</span>
            </label>
          </div>
          
          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border ...">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}