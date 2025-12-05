import './App.css'

function App() {
  
  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          ¡Hola Tailwind CSS!
        </h1>
        <p className="text-gray-700">
          Esto es un ejemplo usando clases de Tailwind v3 en React.
        </p>
        <button className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Botón de prueba
        </button>
      </div>
    </div>
    </>
  )
}

export default App
