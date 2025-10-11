import { Navigate, Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import useAuth from "../hooks/useAuth";
import { useState } from "react";
import ChatAgent from "../components/ChatAgent";

export default function Layout() {
    // 2. Crea el estado para la visibilidad del sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, error, isLoading } = useAuth();
   const location = useLocation();
   
   // 1. Manejar el estado de carga primero
   if (isLoading) {
     return <p className="text-center mt-20">Cargando...</p>;
   }

    if (error || !user) {
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
    
  // 2. Si la carga terminó y NO hay usuario, redirigir DIRECTAMENTE
// y le pasamos la ubicación actual para que sepa a dónde volver.
  
  // 3. Si llegamos aquí, la carga terminó y SÍ hay un usuario.
  //    Mostramos la página protegida.
 

  return (
    <div className="max-h-screen bg-gray-50/50 overscroll-none">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} >
      </Sidebar>
      <div className="p-4 lg:ml-80">
        <NavBar
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}>
        </NavBar>
        <Outlet></Outlet>
        <Footer></Footer>
        {user?.is_admin && <ChatAgent />}
      </div>
    </div>
  )
}
