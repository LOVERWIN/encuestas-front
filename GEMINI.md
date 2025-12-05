# Proyecto: Frontend del Sistema de Encuestas (encuestas-react)

## 1. Stack Tecnológico Principal
* **Framework:** React 18+ (con Vite).
* **Lenguaje:** JavaScript (ES6+) con JSX.
* **Enrutamiento:** `react-router-dom` v6.
* **Estilos:** Tailwind CSS (configurado con `postcss` y `autoprefixer`).
* **Fetching de Datos:** `useSWR` es la librería principal para todas las peticiones de datos al backend.
* **Cliente HTTP:** `axios`, configurado en una instancia centralizada en `src/config/axios.js`.

## 2. Arquitectura y Patrones de Diseño
* **Componentes Funcionales:** El proyecto usa exclusivamente componentes funcionales y hooks.
* **Manejo de Estado Global (Auth):** Se maneja a través de un Contexto (`AuthContext`) y un hook personalizado (`useAuth`) que utiliza `useSWR` para mantener el estado del usuario sincronizado.
* **Manejo de Estado Local:** Se usa `useState` para el estado de los formularios y `useRef` para acceder a elementos del DOM.
* **Hooks Personalizados:** Se prefiere extraer la lógica reutilizable a hooks personalizados:
    * `useAutosizeTextarea`: Para que los `<textarea>` crezcan automáticamente.
    * `useOnClickOutside`: Para cerrar menús desplegables y modales.
    * `useDebounce`: Para optimizar los inputs de búsqueda antes de llamar a la API.
* **Capa de Servicios:** Todas las llamadas a la API están abstraídas en "servicios" (ej. `encuestaService.js`, `authService.js`).
* **Enrutamiento y Guardianes:** El enrutamiento se define en `src/router.jsx` usando `createBrowserRouter`.
    * `Layout.jsx`: Es el guardián para las rutas de administrador (`/`, `/encuestas`, etc.). Redirige a `/auth/login` si no hay usuario.
    * `AuthLayout.jsx`: Es el guardián para las rutas de invitado (`/auth/login`). Redirige a `/` si ya hay un usuario.
    * Las rutas públicas (como `/encuestas/:slug`) no tienen guardián y manejan la lógica de autenticación dentro del propio componente.

## 3. Componentes y Funcionalidades Clave
* **`EncuestaEditor.jsx`:** Es el componente más complejo. Maneja la creación y edición de encuestas.
    * Utiliza `dnd-kit` (`DndContext`, `SortableContext`, `useSortable`) para reordenar las preguntas.
    * Maneja un estado `activeQuestionId` para el modo de edición "en línea" (estilo Google Forms).
* **`PreguntaEditor.jsx`:** Es el componente hijo que renderiza cada pregunta.
    * Tiene una vista "activa" (con inputs) y una "inactiva" (vista previa).
    * Utiliza un `DndContext` anidado para reordenar las opciones de respuesta.
* **`AdminEncuestas.jsx` / `Reporte.jsx` / `Usuario.jsx`:** Vistas de tabla que implementan paginación y búsqueda del lado del servidor (pasando parámetros `?page=` y `?search=` a `useSWR`).
* **`UserEncuestas.jsx`:** Vista para usuarios no-admin. Muestra tarjetas de encuestas disponibles, indicando si ya han sido respondidas (basado en el flag `ha_respondido` de la API).
* **`ResponderEncuesta.jsx`:** Formulario público para responder encuestas.
    * Renderiza dinámicamente todos los tipos de pregunta (`texto_corto`, `escala`, `desplegable`, etc.).
    * Maneja un modo de previsualización (`?preview=true`).
    * Muestra un mensaje de "Iniciar Sesión" si el usuario es un invitado.
* **`ReporteEncuestas.jsx`:** Muestra gráficos (`chart.js`) y respuestas abiertas (`RespuestasAbiertas.jsx`).

## 4. Instrucciones de Código
* **No usar `useEffect` para data-fetching:** Usar siempre `useSWR`.
* **Validación:** Los errores de validación del backend (422) deben capturarse en los `handleSubmit` y guardarse en un estado de `errors` para mostrarlos en línea debajo de cada campo correspondiente.
* **Feedback al Usuario:**
    * Usar un estado `saveStatus` o similar en los formularios para deshabilitar botones y mostrar "Guardando..." durante las peticiones.
    * Para redirecciones con éxito (Crear/Editar), usar `Maps('/ruta', { state: { message: '...' } })` para pasar un "mensaje flash" al componente de destino.