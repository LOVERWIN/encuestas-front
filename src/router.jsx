import { createBrowserRouter } from "react-router-dom";
import Inicio from "./views/Inicio";
import Usuario from "./views/Usuario";
import Encuesta from "./views/Encuesta";
import AuthLayout from "./layout/AuthLayout";
import Login from "./views/Login";
import Register from "./views/Register";
import GoogleCallbackPage from "./utils/GoogleCallbackPage";
import ResponderEncuesta from "./views/ResponderEncuesta";
import Reporte from "./views/Reporte";
import ReporteEncuestas from "./views/ReporteEncuestas";
import PrintLayout from "./layout/PrintLayout";
import EncuestaEditor from "./views/EncuestaEditor";
import Layout from "./layout/Layout";
import VerificationPage from "./views/VerificationPage";
import ResetPassword from "./views/ResetPassword";
import ForgotPassword from "./views/ForgotPassword";

const router = createBrowserRouter( [
    {
        path: '/auth',
        element: <AuthLayout></AuthLayout>,
        children: [
            {
                path:'/auth/login',
                element:<Login></Login>
            },
            {
                path:'/auth/crear-cuenta',
                element: <Register></Register>
            },
            {
                path: '/auth/email-verification-failed',
                element: <VerificationPage status="failed" />
            },
            {
                path: '/auth/forgot-password',
                element: <ForgotPassword />
            },
            {
                path: 'reset-password', // Ruta relativa a /auth
                element: <ResetPassword />
            }
            
        ]
    },
    {
        path: '/',
        element: <Layout></Layout>,
        children: 
        [
            {
                index: true,
                element: <Inicio></Inicio>
            },
            {
                path:'/usuarios',
                element: <Usuario></Usuario>
            },
            {
                path:'/encuestas',
                element: <Encuesta></Encuesta>
            },
            {
                path: '/encuestas/crear', // Ruta para crear
                element: <EncuestaEditor />
            },
            {
                path: '/encuestas/:slug/editar', // Ruta para editar
                element: <EncuestaEditor />
            },
            {
                path:'/reportes',
                element: <Reporte></Reporte>
            },
            {
                path: '/reportes/:slug', // Ruta dinámica para cada reporte
                element: <ReporteEncuestas />
            },
            
        ]
    },
    {
        path: '/print', // Un path base para las vistas de impresión
        element: <PrintLayout />,
        children: [
        {
            path: 'reportes/:slug', // La ruta completa será /print/reportes/:slug
            element: <ReporteEncuestas />
        }
        ]
    },    
    {
        path: '/auth/google/callback', // Esta ruta debe coincidir con la de tu backend
        element: <GoogleCallbackPage />
    },
     {
        path: '/encuestas/:slug', // La nueva ruta para responder
        element: <ResponderEncuesta />
    }
])

export default router