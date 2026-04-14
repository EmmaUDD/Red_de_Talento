import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { HomeFeed } from "./components/shared/HomeFeed";
import { StudentProfile } from "./components/student/StudentProfile";
import { StudentEmpleos } from "./components/student/StudentEmpleos";
import { TeacherValidacion } from "./components/teacher/TeacherValidacion";
import { TeacherEstadisticas } from "./components/teacher/TeacherEstadisticas";
import { TeacherProfile } from "./components/teacher/TeacherProfile";
import { CompanyPublicar } from "./components/company/CompanyPublicar";
import { CompanyBuscar } from "./components/company/CompanyBuscar";
import { CompanyRecomendaciones } from "./components/company/CompanyRecomendaciones";
import { CompanyProfile } from "./components/company/CompanyProfile";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomeFeed },
      { path: "inicio", Component: HomeFeed },
      // Student
      { path: "perfil", Component: StudentProfile },
      { path: "empleos", Component: StudentEmpleos },
      // Teacher
      { path: "validacion", Component: TeacherValidacion },
      { path: "estadisticas", Component: TeacherEstadisticas },
      { path: "perfil-docente", Component: TeacherProfile },
      // Company
      { path: "publicar", Component: CompanyPublicar },
      { path: "buscar", Component: CompanyBuscar },
      { path: "recomendaciones", Component: CompanyRecomendaciones },
      { path: "perfil-empresa", Component: CompanyProfile },
      { path: "*", Component: NotFound },
    ],
  },
]);