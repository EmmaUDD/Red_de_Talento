// ────────────────────────────────────────────
// Roles
// ────────────────────────────────────────────
export type Role = "student" | "teacher" | "company";

// ────────────────────────────────────────────
// Usuario autenticado (lo que guardamos en contexto)
// ────────────────────────────────────────────
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  // Campos según rol
  especialidad?: string;
  curso?: string;
  validado?: boolean;
  foto_perfil?: string;
  bio?: string;
  video_pitch?: string;
  // Teacher
  departamento?: string;
  es_admin?: boolean;
  // Company
  nombre_empresa?: string;
  industria?: string;
  descripcion?: string;
  ubicacion?: string;
  horario?: string;
  que_buscamos?: string;
}

// ────────────────────────────────────────────
// Tokens JWT
// ────────────────────────────────────────────
export interface TokenPair {
  access: string;
  refresh: string;
}

// ────────────────────────────────────────────
// Habilidades
// ────────────────────────────────────────────
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

// ────────────────────────────────────────────
// Insignias
// ────────────────────────────────────────────
export interface Insignia {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  fecha_obtencion: string;
}

// ────────────────────────────────────────────
// Oferta laboral
// ────────────────────────────────────────────
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

// ────────────────────────────────────────────
// Postulación
// ────────────────────────────────────────────
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

// ────────────────────────────────────────────
// Recomendación
// ────────────────────────────────────────────
export interface Recomendacion {
  oferta: OfertaLaboral;
  score: number;
  razones: string[];
}

// ────────────────────────────────────────────
// Perfil de estudiante (vista pública)
// ────────────────────────────────────────────
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
  foto?: string; // alias de foto_perfil
  bio?: string;
  habilidades: Habilidad[];
  habilidades_pendientes?: Habilidad[];
  insignias: Insignia[];
  evidencias?: Evidencia[];
  score?: number;
}

// ────────────────────────────────────────────
// Feed post
// ────────────────────────────────────────────
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

// ────────────────────────────────────────────
// Búsqueda global
// ────────────────────────────────────────────
export interface EmpresaResult {
  id: number;
  usuario_id?: number;
  nombre_empresa: string;
  industria: string;
  foto_perfil?: string;
  foto_url?: string;
  descripcion?: string;
  sitio_web?: string;
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
}

// ────────────────────────────────────────────
// Reporte / Denuncia
// ────────────────────────────────────────────
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

// ────────────────────────────────────────────
// Curso recomendado
// ────────────────────────────────────────────
export interface Curso {
  id: number;
  titulo: string;
  plataforma: string;
  duracion: string;
  url: string;
  inscrito?: boolean;
  progreso?: number;
}

// ────────────────────────────────────────────
// Solicitud de registro de alumno (para docente)
// ────────────────────────────────────────────
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

// ────────────────────────────────────────────
// Estadísticas (para docente)
// ────────────────────────────────────────────
export interface EstadisticasGenerales {
  total_estudiantes: number;
  estudiantes_validados: number;
  total_empresas: number;
  total_ofertas_activas: number;
  postulaciones_este_mes: number;
  por_especialidad: { especialidad: string; cantidad: number }[];
}

// ────────────────────────────────────────────
// Respuesta paginada genérica
// ────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ────────────────────────────────────────────
// Errores de API
// ────────────────────────────────────────────
export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}
