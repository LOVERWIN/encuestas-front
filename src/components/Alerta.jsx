export default function Alerta({ children, tipo }) {
  const baseClasses = "text-center my-2 text-white font-bold p-3 uppercase";

  // Determina la clase de color basada en el tipo
  const colorClass = tipo === 'success' 
    ? 'bg-green-600' 
    : 'bg-red-600';

  return (
    <div className={`${baseClasses} ${colorClass}`}>
      {children}
    </div>
  );
}
