import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const { handleLogout,user } = useAuth();
  // Función para cerrar el sidebar en móvil al hacer clic en un enlace
  const closeSidebar = () => {
    if (window.innerWidth < 1024) { // 1024px es el breakpoint 'lg' de Tailwind
      setIsSidebarOpen(false);
    }
  };
  const isAdmin = user?.is_admin;
  return (
    <>
      <aside className={`bg-gradient-to-br from-gray-800 to-gray-900 fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl 
                   transition-transform duration-300 
                   lg:translate-x-0  // En PC siempre está visible
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} // En móvil, se muestra o esconde
                  `}>
        <div className="relative border-b border-white/20">
          <Link className="flex items-center gap-4 py-6 px-8 " to="/">
            <h6 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-white">Sistema de Encuestas</h6>
          </Link>
          <button 
            className="lg:hidden absolute top-4 right-4 text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="m-4">
          <ul className="mb-4 flex flex-col gap-1">
            <li>

              <NavLink to="/" onClick={closeSidebar}
                className={({ isActive }) => `middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg  text-white w-full flex items-center gap-4 px-4 capitalize ${isActive ? "bg-gradient-to-tr from-blue-600 to-blue-400  shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85]" : "hover:bg-white/10 active:bg-white/30"}`} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"></path>
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"></path>
                </svg>
                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">dashboard</p>
              </NavLink>

            </li>
            {isAdmin &&(<>
            <li>
              <NavLink to="/usuarios" onClick={closeSidebar}
                className={({ isActive }) => `middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg  text-white w-full flex items-center gap-4 px-4 capitalize ${isActive ? "bg-gradient-to-tr from-blue-600 to-blue-400  shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85]" : "hover:bg-white/10 active:bg-white/30"}`} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                  <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">Usuarios</p>
              </NavLink>
            </li>
            </>)}
            <li>
              <NavLink to="/encuestas" onClick={closeSidebar}
                className={({ isActive }) => `middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg  text-white w-full flex items-center gap-4 px-4 capitalize ${isActive ? "bg-gradient-to-tr from-blue-600 to-blue-400  shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85]" : "hover:bg-white/10 active:bg-white/30"}`} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
                  <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">Encuestas</p>
              </NavLink>
            </li>
            {isAdmin &&(<>
            <li>
              <NavLink to="/reportes" onClick={closeSidebar}
                className={({ isActive }) => `middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg  text-white w-full flex items-center gap-4 px-4 capitalize ${isActive ? "bg-gradient-to-tr from-blue-600 to-blue-400  shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85]" : "hover:bg-white/10 active:bg-white/30"}`} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                </svg>
                  <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">Reportes</p>
              </NavLink>
            </li>
            </>)}
          </ul>
          <ul className="mb-4 flex flex-col gap-1">
            <li className="mx-3.5 mt-4 mb-2">
              <p className="block antialiased font-sans text-sm leading-normal text-white font-black uppercase opacity-75">auth pages</p>
            </li>
            <li>
                <button onClick={handleLogout} className="middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                  <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">Logout</p>
                </button>
            </li>
          </ul>
        </div>
      </aside>
      {/* MEJORA: Overlay para cerrar el menú al hacer clic fuera */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  )
}
