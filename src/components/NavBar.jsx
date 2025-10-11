import useAuth from "../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import UserDropdown from './UserDropdown'; // Importa el nuevo componente
import { useRef, useState } from "react";
import useOnClickOutside from '../hooks/useOnClickOutside'; // 2. Importa el hook aquí


export default function NavBar({ isSidebarOpen, setIsSidebarOpen }) {
  const { user } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Estado para el menú

  const location = useLocation();
  const firstName = user?.name.split(' ')[0];

  // 3. Crea una referencia para el contenedor del menú
  const menuWrapperRef = useRef(null);
  useOnClickOutside(menuWrapperRef, () => setIsUserMenuOpen(false));

  // Dividimos la ruta y quitamos los elementos vacíos (por el '/' inicial)
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <>
      <nav className="block w-full max-w-full bg-transparent text-white shadow-none rounded-xl transition-all px-0 py-1">
        <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
          <div className="capitalize">
            <nav aria-label="breadcrumb" className="w-max">
              <ol className="flex flex-wrap items-center w-full bg-opacity-60 rounded-md bg-transparent p-0 transition-all">
                {/* Enlace estático a la raíz de la sección */}
                <li className=" ...">
                  <Link to="/">
                    <p className="...  opacity-50 text-gray-700 hover:text-blue-500">
                      dashboard
                    </p>
                  </Link>
                </li>

                {/* Generación dinámica de los siguientes enlaces */}
                {pathnames.length > 0 && (
                  <span className="text-gray-500 ... mx-2">/</span>
                )}

                {pathnames.map((name, index) => {
                  const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                  const isLast = index === pathnames.length - 1;

                  return (
                    <li
                      key={routeTo}
                      className="flex items-center text-blue-900 ..."
                    >
                      {isLast ? (
                        // El último elemento es texto plano porque es la página actual
                        <p className="block ... font-normal">{name}</p>
                      ) : (
                        // Los elementos intermedios son enlaces
                        <Link to={routeTo}>
                          <p className="block ... opacity-50 ...">{name}</p>
                        </Link>
                      )}
                      {!isLast && (
                        <span className="text-gray-500 ... mx-2">/</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          <div className="flex items-center" ref={menuWrapperRef}>
            {/* este boton es el menu amburgueza que sale cuando la pantalla es pequeña */}
            <button
              className="relative middle none font-sans font-medium text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-10 max-w-[40px] h-10 max-h-[40px] rounded-lg text-xs text-gray-500 hover:bg-blue-gray-500/10 active:bg-blue-gray-500/30 grid xl:hidden lg:hidden"
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <span className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  strokeWidth="3"
                  className="h-6 w-6 text-blue-gray-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>
            </button>

            {/* boton de usuario con nombre cuando la pantalla es grande o pequeña*/}
              <button
                
                className="flex items-center gap-1 text-gray-500 hover:bg-gray-500/10 active:bg-gray-500/30 p-2 rounded-lg"
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-5 w-5 text-blue-gray-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                {/* Nombre del usuario, solo visible en pantallas grandes */}
                <span className="font-bold hidden xl:inline">{firstName}</span>
              </button>

            {/* boton de configuracion  */}
            {/* <button
              className="relative middle none font-sans font-medium text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-10 max-w-[40px] h-10 max-h-[40px] rounded-lg text-xs text-gray-500 hover:bg-blue-gray-500/10 active:bg-blue-gray-500/30"
              type="button"
            >
              <span className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-5 w-5 text-blue-gray-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>
            </button> */}
            {/* El menú desplegable que se muestra condicionalmente */}
            {isUserMenuOpen && <UserDropdown user={user} />}
            {/* boton de notificaciones */}
            {/*Futuras actualizaciones se puede implementar notificaciones para los admins */}
          </div>
        </div>
      </nav>
    </>
  );
}
