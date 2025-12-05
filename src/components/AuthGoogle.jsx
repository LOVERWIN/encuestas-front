export default function AuthGoogle() {
    const handleGoogleRegister = () => {
      
    // Redirige al backend de Laravel
    window.location.href = import.meta.env.VITE_API_URL+'/auth/google/redirect';
   };
   
  return (
    <>
    {/* Separador */}
        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <button
          onClick={handleGoogleRegister}
          className="bg-slate-100 hover:bg-slate-50 text-slate-700 w-full p-3 uppercase  cursor-pointer transition-colors flex items-center justify-center space-x-2 rounded-md"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M44.5 20H24V28.8H35.1C34.3 32.7 32.1 35.3 28.6 37.7V44H37C42 39.5 44.5 33.1 44.5 26.2V20Z" fill="#4285F4"/>
            <path d="M24 44C30.4 44 35.7 41.9 39.7 38.3L31.7 32C29.6 33.4 27 34.2 24 34.2C18.6 34.2 13.9 30.6 12.3 25.8H4.2V32C6.9 37.6 14.8 42 24 42C28.2 42 32 40.9 35 38.9L39.7 44H24V44Z" fill="#34A853"/>
            <path d="M12.3 25.8C11.8 24.3 11.5 22.7 11.5 21C11.5 19.3 11.8 17.7 12.3 16.2V10H4.2C2.8 12.6 2 15.6 2 18.8C2 22 2.8 25 4.2 27.6L12.3 25.8Z" fill="#FBBC05"/>
            <path d="M24 9.8C26.9 9.8 29.5 10.9 31.5 12.7L39.1 5.1C35.7 2.1 30.2 0 24 0C14.8 0 6.9 4.4 4.2 10L12.3 16.2C13.9 11.4 18.6 7.8 24 7.8V9.8Z" fill="#EA4335"/>
          </svg>
          <span>Continuar con Google</span>
        </button>
    </>
  )
}
