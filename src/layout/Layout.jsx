import { Navigate, Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import useAuth from "../hooks/useAuth";
import useSistemaEncuesta from "../hooks/useSistemaEncuesta";

export default function Layout() {
  const { isSidebarOpen, setIsSidebarOpen } = useSistemaEncuesta();
  const { user, error, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p className="text-center mt-20">Cargando...</p>;
  }

  if (error || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div className="bg-gray-50/50">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} >
      </Sidebar>
      <div className="p-4 lg:ml-80 flex flex-col min-h-screen">
        <NavBar
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}>
        </NavBar>
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
