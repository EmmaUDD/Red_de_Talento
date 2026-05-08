export type Role = "student" | "teacher" | "company";

export interface AuthUser {
  id: number;
  profile_id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  especialidad?: string;
  curso?: string;
  validado?: boolean;
  foto_perfil?: string;
  bio?: string;
  video_pitch?: string;
  departamento?: string;
  es_admin?: boolean;
  nombre_empresa?: string;
  industria?: string;
  descripcion?: string;
  ubicacion?: string;
  horario?: string;
  que_buscamos?: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export type SkillLevel = "Alto" | "Medio" | "Bajo";

export interface Habilidad {
  id: number;
  nombre: string;
  nivel: SkillLevel;
  tipo: "tecnica" | "blanda";
  validado: boolean;
  fecha_validacion?: string;
  porcentaje?: number;
}

export interface Insignia {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  fecha_obtencion: string;
}

export type TipoOferta = "Part-time" | "Full-time" | "Práctica";
export type ModalidadOferta = "Presencial" | "Híbrido" | "Remoto";

export interface OfertaLaboral {
  id: number;
  titulo: string;
  descripcion: string;
  empresa: string;
  empresa_id: number;
  logo_empresa?: string;
  tipo: TipoOferta;
  modalidad: ModalidadOferta;
  salario?: string;
  ubicacion: string;
  especialidad?: string;
  requisitos: string[];
  activa: boolean;
  fecha_publicacion: string;
  empresa_verificada: boolean;
  postulaciones_count?: number;
  ya_postule?: boolean;
}

export type EstadoPostulacion = "pendiente" | "revisado" | "aceptado" | "rechazado";

export interface Postulacion {
  id: number;
  oferta: number;
  oferta_titulo?: string;
  oferta_empresa_nombre?: string;
  estudiante: number;
  estado: EstadoPostulacion;
  fecha_postulacion: string;
  mensaje_estudiante?: string;
}

export interface Recomendacion {
  oferta: OfertaLaboral;
  score: number;
  razones: string[];
}

export interface Evidencia {
  id: number;
  titulo: string;
  descripcion: string;
  imagen?: string;
}

export interface EstudiantePerfil {
  id: number;
  usuario_id?: number;
  nombre: string;
  especialidad: string;
  curso: string;
  comuna?: string;
  disponibilidad?: string;
  validado: boolean;
  foto_perfil?: string;
  foto?: string;
  bio?: string;
  video_pitch?: string;
  email?: string;
  habilidades: Habilidad[];
  habilidades_pendientes?: Habilidad[];
  insignias: Insignia[];
  evidencias?: Evidencia[];
  score?: number;
}

export type TipoPost = "post" | "oferta" | "evento" | "anuncio";

export interface FeedPost {
  id: number;
  autor_id?: number;
  autor_perfil_id?: number;
  autor_nombre: string;
  autor_rol: Role;
  autor_foto?: string;
  contenido: string;
  tipo: TipoPost;
  fecha: string;
  likes: number;
  comentarios: number;
  ya_likeado?: boolean;
  imagen_url?: string;
}

export interface EmpresaResult {
  id: number;
  usuario_id?: number;
  nombre_empresa: string;
  industria: string;
  foto_perfil?: string;
  foto_url?: string;
  descripcion?: string;
  sitio_web?: string;
  email?: string;
}

export interface DocenteResult {
  id: number;
  usuario_id?: number;
  nombre: string;
  departamento?: string;
  foto_perfil?: string;
  foto_url?: string;
  bio?: string;
  nivel?: string;
  email?: string;
}

export type EstadoReporte = "pendiente" | "en_revision" | "resuelto";

export interface PublicacionData {
  id: number;
  contenido: string;
  imagen_url?: string;
  autor_nombre: string;
  fecha?: string;
}

export interface Reporte {
  id: number;
  reportado_por: number;
  reportado_por_nombre: string;
  usuario_reportado: number;
  usuario_reportado_nombre: string;
  publicacion?: number | null;
  publicacion_data?: PublicacionData | null;
  motivo: string;
  descripcion: string;
  fecha: string;
  estado: EstadoReporte;
}

export interface Curso {
  id: number;
  titulo: string;
  plataforma: string;
  duracion: string;
  url: string;
  inscrito?: boolean;
  progreso?: number;
}

export type EstadoSolicitud = "pendiente" | "aprobado" | "rechazado";

export interface SolicitudAlumno {
  id: number;
  nombre: string;
  especialidad: string;
  curso: string;
  email: string;
  fecha_solicitud: string;
  estado: EstadoSolicitud;
}

export interface EstadisticasGenerales {
  total_estudiantes: number;
  total_empresas: number;
  total_ofertas_activas: number;
  postulaciones_este_mes: number;
  total_habilidades: number;
  por_especialidad: { especialidad: string; cantidad: number }[];
  contratados_por_mes: { mes: string; contratados: number; tasa: number }[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}
