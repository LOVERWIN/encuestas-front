import { Outlet } from "react-router-dom";

// Este layout no tiene estilos, solo muestra el contenido de la ruta hija.
export default function PrintLayout() {
  return <Outlet />;
}