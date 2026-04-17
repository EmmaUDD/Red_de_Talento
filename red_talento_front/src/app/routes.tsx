import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "@/app/components/Layout";
import { Login } from "@/app/components/auth/Login";
import { Register } from "@/app/components/auth/Register";
import { HomeFeed } from "@/app/components/shared/HomeFeed";
import { BusquedaGlobal } from "@/app/components/shared/BusquedaGlobal";
import { StudentProfile } from "@/app/components/student/StudentProfile";
import { StudentEmpleos } from "@/app/components/student/StudentEmpleos";
import { TeacherValidacion } from "@/app/components/teacher/TeacherValidacion";
import { TeacherEstadisticas } from "@/app/components/teacher/TeacherEstadisticas";
import { TeacherProfile } from "@/app/components/teacher/TeacherProfile";
import { TeacherPublicarEvento } from "@/app/components/teacher/TeacherPublicarEvento";
import { CompanyPublicar } from "@/app/components/company/CompanyPublicar";
import { CompanyBuscar } from "@/app/components/company/CompanyBuscar";
import { CompanyRecomendaciones } from "@/app/components/company/CompanyRecomendaciones";
import { CompanyProfile } from "@/app/components/company/CompanyProfile";
import { VistaEstudiante } from "@/app/components/vistas/VistaEstudiante";
import { VistaEmpresa } from "@/app/components/vistas/VistaEmpresa";
import { VistaDocente } from "@/app/components/vistas/VistaDocente";
import { NotFound } from "@/app/components/NotFound";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

export const router = createBrowserRouter([
  // Rutas públicas
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  // Rutas protegidas (dentro del Layout)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // Redirect de raíz a inicio
      { index: true, element: <Navigate to="/inicio" replace /> },

      // Compartido
      { path: "inicio", element: <HomeFeed /> },
      { path: "busqueda", element: <BusquedaGlobal /> },

      // Vistas de perfil (solo lectura, accesibles por todos los roles)
      { path: "ver/estudiante/:id", element: <VistaEstudiante /> },
      { path: "ver/empresa/:id", element: <VistaEmpresa /> },
      { path: "ver/docente/:id", element: <VistaDocente /> },

      // Estudiante
      {
        path: "perfil",
        element: (
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "empleos",
        element: (
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentEmpleos />
          </ProtectedRoute>
        ),
      },

      // Docente
      {
        path: "validacion",
        element: (
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherValidacion />
          </ProtectedRoute>
        ),
      },
      {
        path: "estadisticas",
        element: (
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherEstadisticas />
          </ProtectedRoute>
        ),
      },
      {
        path: "perfil-docente",
        element: (
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "publicar-evento",
        element: (
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherPublicarEvento />
          </ProtectedRoute>
        ),
      },

      // Empresa
      {
        path: "publicar",
        element: (
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyPublicar />
          </ProtectedRoute>
        ),
      },
      {
        path: "buscar",
        element: (
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyBuscar />
          </ProtectedRoute>
        ),
      },
      {
        path: "recomendaciones",
        element: (
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyRecomendaciones />
          </ProtectedRoute>
        ),
      },
      {
        path: "perfil-empresa",
        element: (
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyProfile />
          </ProtectedRoute>
        ),
      },

      // 404
      { path: "*", element: <NotFound /> },
    ],
  },
]);
