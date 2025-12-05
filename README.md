# Sistema de Encuestas - Frontend

Este es el repositorio del frontend para el Sistema de Encuestas, una aplicación web construida con React y Vite. Permite a los administradores crear, gestionar y visualizar reportes de encuestas, y a los usuarios responderlas.

## ✨ Características Principales

- **Gestión de Encuestas:** Creación, edición y eliminación de encuestas con diferentes tipos de preguntas.
- **Editor Interactivo:** Interfaz de tipo "Google Forms" con drag-and-drop para reordenar preguntas y opciones.
- **Tipos de Preguntas:** Soporte para texto corto, párrafo, selección múltiple, checkboxes, desplegables y escala lineal.
- **Autenticación de Usuarios:** Sistema de registro, inicio de sesión (con credenciales y Google) y gestión de roles (administrador/usuario).
- **Vistas por Rol:**
    - **Administrador:** Dashboard con todas las encuestas, reportes, gestión de usuarios.
    - **Usuario:** Vista de encuestas disponibles para responder.
- **Reportes y Visualización:** Gráficos y tablas para analizar los resultados de las encuestas.
- **Diseño Responsivo:** Interfaz adaptable a diferentes tamaños de pantalla gracias a Tailwind CSS.
- **Búsqueda y Paginación:** Optimización para navegar por grandes volúmenes de datos en las tablas de administración.

## 🚀 Tecnologías Utilizadas

- **Framework:** [React](https://react.dev/) (v19) con [Vite](https://vitejs.dev/)
- **Lenguaje:** JavaScript (ES6+)
- **Enrutamiento:** [React Router DOM](https://reactrouter.com/) (v6)
- **Estilos CSS:** [Tailwind CSS](https://tailwindcss.com/)
- **Data Fetching:** [SWR](https://swr.vercel.app/)
- **Cliente HTTP:** [Axios](https://axios-http.com/)
- **Gráficos:** [Chart.js](https://www.chartjs.org/) con [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Drag and Drop:** [Dnd Kit](https://dndkit.com/)
- **Editor de Texto Enriquecido:** [TinyMCE](https://www.tiny.cloud/docs/tinymce/latest/react-integration/)
- **Iconos:** [Heroicons](https://heroicons.com/)

## 🏁 Cómo Empezar

Sigue estos pasos para levantar el proyecto en tu entorno local.

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) / [pnpm](https://pnpm.io/) / [yarn](https://yarnpkg.com/)
- Un backend compatible corriendo. La configuración de la URL base de la API se encuentra en `src/config/axios.js`.

### Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/encuestas-react.git
    ```
2.  Navega al directorio del proyecto:
    ```bash
    cd encuestas-react
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```

## 📜 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar los siguientes comandos:

- `npm run dev`: Inicia la aplicación en modo de desarrollo. Abre [http://localhost:5173](http://localhost:5173) para verla en tu navegador. La página se recargará si haces cambios.

- `npm run build`: Compila la aplicación para producción en la carpeta `dist`. Prepara tu aplicación con las mejores prácticas y optimizaciones.

- `npm run lint`: Ejecuta el linter (ESLint) para encontrar y corregir problemas en el código.

- `npm run preview`: Sirve la build de producción localmente para previsualizar cómo se comportará la aplicación desplegada.

## 📁 Estructura del Proyecto

```
encuestas-react/
├── public/                # Archivos estáticos
├── src/
│   ├── assets/            # Imágenes y SVGs
│   ├── components/        # Componentes reutilizables
│   ├── config/            # Configuración (ej. Axios)
│   ├── context/           # React Context Providers
│   ├── hooks/             # Hooks personalizados
│   ├── layout/            # Layouts principales (Admin, Auth)
│   ├── services/          # Lógica de llamadas a la API
│   ├── views/             # Componentes de página (rutas)
│   ├── App.jsx            # Componente raíz
│   ├── main.jsx           # Punto de entrada de la app
│   └── router.jsx         # Definición de rutas
├── .env.production        # Variables de entorno para producción
├── .eslintrc.cjs          # Configuración de ESLint
├── tailwind.config.js     # Configuración de Tailwind CSS
├── vite.config.js         # Configuración de Vite
└── package.json           # Dependencias y scripts
```