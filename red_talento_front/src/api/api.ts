import type {
  TokenPair,
  AuthUser,
  OfertaLaboral,
  Postulacion,
  EstudiantePerfil,
  FeedPost,
  Habilidad,
  Insignia,
  Curso,
  SolicitudAlumno,
  EstadisticasGenerales,
  PaginatedResponse,
  EmpresaResult,
  DocenteResult,
  Reporte,
  EstadoReporte,
} from "@/app/types";

// ─── Base URL ────────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token");
}

function saveTokens(pair: TokenPair) {
  localStorage.setItem("access_token", pair.access);
  localStorage.setItem("refresh_token", pair.refresh);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    return data.access as string;
  } catch {
    clearTokens();
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return request<T>(path, options, false);
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }

  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ─── Transforms: backend → frontend types ────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackendHabilidad(h: any): Habilidad {
  return {
    id: h.id,
    nombre: h.nombre ?? "",
    nivel: h.nivel,
    tipo: h.tipo === "blanda" ? "blanda" : "tecnica",
    validado: h.estado === "Aprobado",
    porcentaje: h.nivel === "Alto" ? 90 : h.nivel === "Medio" ? 60 : 30,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackendEstudiante(p: any): EstudiantePerfil {
  const u = p.usuario ?? {};
  const fotoUrl = p.foto_url ?? (p.foto_perfil ? p.foto_perfil : undefined);
  return {
    id: p.id,
    usuario_id: u.id,
    nombre: u.first_name || u.last_name
      ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
      : `Estudiante ${p.id}`,
    especialidad: p.especialidad ?? "",
    curso: p.grado ?? "",
    disponibilidad: p.disponibilidad_perfil?.[0]?.disponibilidad?.replace("_", " ") ?? undefined,
    validado: u.is_active ?? false,
    foto_perfil: fotoUrl,
    foto: fotoUrl,
    bio: p.bio ?? undefined,
    habilidades: (p.habilidades_aprobadas ?? []).map(fromBackendHabilidad),
    habilidades_pendientes: (p.habilidades_pendientes ?? []).map(fromBackendHabilidad),
    insignias: (p.insignias_perfil ?? []).map((i: any) => ({ id: i.id, nombre: i.nombre, icono: i.icono, descripcion: "" })),
    evidencias: (p.evidencias_perfil ?? []).map((e: any) => ({ id: e.id, titulo: e.titulo, descripcion: e.descripcion, imagen: e.imagen ?? undefined })),
    score: p.score,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackendModalidad(m: string): string {
  if (m === "presencial") return "Presencial";
  if (m === "semi_presencial") return "Híbrido";
  if (m === "online") return "Remoto";
  return m;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackendDisponibilidad(d: string): string {
  if (d === "part_time") return "Part-time";
  if (d === "full_time") return "Full-time";
  if (d === "practicas") return "Práctica";
  if (d === "fines_de_semana") return "Part-time";
  return d;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackendOferta(o: any): OfertaLaboral {
  return {
    id: o.id,
    titulo: o.titulo ?? "",
    descripcion: o.descripcion ?? "",
    empresa: o.empresa_nombre ?? (typeof o.empresa === "object" ? o.empresa?.nombre_empresa : null) ?? `Empresa ${o.empresa}`,
    empresa_id: typeof o.empresa === "number" ? o.empresa : (o.empresa?.id ?? 0),
    tipo: fromBackendDisponibilidad(o.disponibilidad_requerida ?? "part_time") as OfertaLaboral["tipo"],
    modalidad: fromBackendModalidad(o.modalidad ?? "presencial") as OfertaLaboral["modalidad"],
    salario: o.remuneracion ?? undefined,
    ubicacion: o.ubicacion ?? "",
    especialidad: o.especialidad_requerida ?? undefined,
    requisitos: (o.habilidades_requeridas ?? []).map((h: { habilidad: string }) => h.habilidad),
    activa: o.activa ?? true,
    fecha_publicacion: o.fecha_publicacion ?? "",
    empresa_verificada: false,
    postulaciones_count: o.postulaciones_count ?? 0,
    ya_postule: o.ya_postule ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackendPost(p: any): FeedPost {
  return {
    id: p.id,
    autor_id: p.autor,
    autor_nombre: p.autor_username ?? `Usuario ${p.autor}`,
    autor_rol: (p.autor_role as FeedPost["autor_rol"]) ?? "student",
    contenido: p.contenido ?? "",
    tipo: (p.tipo as FeedPost["tipo"]) ?? "post",
    fecha: p.fecha ?? "",
    likes: 0,
    comentarios: 0,
    ya_likeado: false,
    imagen_url: p.imagen_url ?? undefined,
    autor_perfil_id: p.autor_perfil_id ?? undefined,
    autor_foto: p.autor_foto_url ?? undefined,
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (username: string, password: string): Promise<TokenPair> => {
    const data = await request<TokenPair>("/api/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    saveTokens(data);
    return data;
  },

  logout: () => {
    clearTokens();
  },

  getMe: (): Promise<AuthUser> => request<AuthUser>("/api/me/"),

  register: async (payload: Record<string, unknown>): Promise<unknown> => {
    const role = payload.role as string;
    const ENDPOINTS: Record<string, string> = {
      student: "/api/registro/estudiante/",
      teacher: "/api/registro/docente/",
      company: "/api/registro/empresa/",
    };
    const url = ENDPOINTS[role] ?? "/api/registro/estudiante/";
    return request<unknown>(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  isLoggedIn: () => !!getToken(),
};

// ─── Perfil de usuario ───────────────────────────────────────────────────────
export const perfilApi = {
  updatePerfil: (data: FormData): Promise<AuthUser> =>
    request<AuthUser>("/api/me/", {
      method: "PATCH",
      body: data,
    }),

  uploadFoto: async (file: File): Promise<AuthUser> => {
    const fd = new FormData();
    fd.append("foto_perfil", file);
    return request<AuthUser>("/api/me/", { method: "PATCH", body: fd });
  },

  getEstudiante: (id: number): Promise<EstudiantePerfil> =>
    request<{ id: number; [k: string]: unknown }>(`/api/perfil/estudiante/${id}/`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((r) => fromBackendEstudiante(r as any)),

  getEstudiantes: async (params?: Record<string, string>): Promise<PaginatedResponse<EstudiantePerfil>> => {
    const mapped: Record<string, string> = {};
    if (params?.nombre) mapped["nombre"] = params.nombre;
    if (params?.search) mapped["nombre"] = params.search; // alias
    if (params?.especialidad) mapped["especialidad"] = params.especialidad;
    if (params?.disponibilidad) mapped["disponibilidad"] = params.disponibilidad;
    const qs = Object.keys(mapped).length ? "?" + new URLSearchParams(mapped).toString() : "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await request<any[]>(`/api/estudiantes/${qs}`);
    const results = Array.isArray(data) ? data.map(fromBackendEstudiante) : [];
    return { count: results.length, next: null, previous: null, results };
  },

  getDocente: async (id: number): Promise<DocenteResult> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = await request<any>(`/api/perfil/docente/${id}/`);
    return {
      id: d.id,
      usuario_id: d.usuario?.id ?? undefined,
      nombre: d.usuario ? `${d.usuario.first_name} ${d.usuario.last_name}`.trim() || d.usuario.username : `Docente ${d.id}`,
      departamento: d.departamento ?? undefined,
      foto_perfil: d.foto_url ?? undefined,
      foto_url: d.foto_url ?? undefined,
      bio: d.bio ?? undefined,
      nivel: d.nivel ?? undefined,
    };
  },

  getEmpresa: async (id: number): Promise<EmpresaResult> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = await request<any>(`/api/perfil/empresa/${id}/`);
    return {
      id: e.id,
      usuario_id: e.usuario?.id ?? undefined,
      nombre_empresa: e.nombre_empresa ?? "",
      industria: e.industria ?? "",
      foto_perfil: e.foto_url ?? undefined,
      foto_url: e.foto_url ?? undefined,
      descripcion: e.descripcion ?? undefined,
      sitio_web: e.sitio_web ?? undefined,
    };
  },

  getEmpresas: async (nombre?: string): Promise<EmpresaResult[]> => {
    const qs = nombre ? `?nombre_empresa=${encodeURIComponent(nombre)}` : "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await request<any[]>(`/api/empresas/${qs}`);
    return Array.isArray(data) ? data.map((e) => ({
      id: e.id,
      nombre_empresa: e.nombre_empresa ?? "",
      industria: e.industria ?? "",
      foto_perfil: e.foto_perfil ?? undefined,
      descripcion: e.descripcion ?? undefined,
      sitio_web: e.sitio_web ?? undefined,
    })) : [];
  },

  getDocentes: async (nombre?: string): Promise<DocenteResult[]> => {
    const qs = nombre ? `?nombre=${encodeURIComponent(nombre)}` : "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await request<any[]>(`/api/docentes/${qs}`);
    return Array.isArray(data) ? data.map((d) => ({
      id: d.id,
      nombre: d.usuario ? `${d.usuario.first_name} ${d.usuario.last_name}`.trim() || d.usuario.username : `Docente ${d.id}`,
      departamento: d.departamento ?? undefined,
      foto_perfil: d.foto_perfil ?? undefined,
      bio: d.bio ?? undefined,
    })) : [];
  },
};

// ─── Habilidades ─────────────────────────────────────────────────────────────
export const habilidadesApi = {
  getMias: async (): Promise<Habilidad[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await request<any[]>("/api/habilidades/");
    return Array.isArray(data) ? data.map(fromBackendHabilidad) : [];
  },

  getDeEstudiante: (estudianteId: number): Promise<Habilidad[]> =>
    request<Habilidad[]>(`/api/habilidades/?estudiante=${estudianteId}`),

  crear: (nombre: string, tipo: "tecnica" | "blanda"): Promise<Habilidad> =>
    request<Habilidad>("/api/habilidades/", {
      method: "POST",
      body: JSON.stringify({ nombre, tipo }),
    }),

  validar: (id: number, nivel: string): Promise<Habilidad> =>
    request<Habilidad>(`/api/habilidades/${id}/validar/`, {
      method: "PATCH",
      body: JSON.stringify({ nivel, estado: "Aprobado" }),
    }),

  rechazar: (id: number): Promise<Habilidad> =>
    request<Habilidad>(`/api/habilidades/${id}/validar/`, {
      method: "PATCH",
      body: JSON.stringify({ estado: "Rechazado" }),
    }),

  solicitarCambio: (id: number, nivel: string): Promise<Habilidad> =>
    request<Habilidad>(`/api/habilidades/${id}/validar/`, {
      method: "PATCH",
      body: JSON.stringify({ nivel }),
    }),
};

// ─── Insignias ───────────────────────────────────────────────────────────────
export const insigniasApi = {
  getMias: async (): Promise<Insignia[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await request<any[]>("/api/mis-insignias/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Array.isArray(data) ? data.map((i: any) => ({
        id: i.id,
        nombre: i.insignia?.nombre ?? "",
        descripcion: i.insignia?.descripcion ?? "",
        icono: i.insignia?.icono ?? "🏆",
        fecha_obtencion: i.fecha_obtenida ?? "",
      })) : [];
    } catch {
      return [];
    }
  },

  getDeEstudiante: (id: number): Promise<Insignia[]> =>
    request<Insignia[]>(`/api/estudiantes/${id}/insignias/`),
};

// ─── Cursos ──────────────────────────────────────────────────────────────────
export const cursosApi = {
  // Cursos publicados por el docente actual
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMisPublicados: (): Promise<any[]> =>
    request<any[]>("/api/cursos/?mios=1"), // eslint-disable-line @typescript-eslint/no-explicit-any

  // Todos los cursos disponibles (con ya_inscrito por el backend)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll: async (q?: string): Promise<any[]> => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    const data = await request<any[]>(`/api/cursos/${qs}`); // eslint-disable-line @typescript-eslint/no-explicit-any
    return Array.isArray(data) ? data : [];
  },

  // Compatibilidad con StudentProfile existente
  getRecomendados: async (): Promise<Curso[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await request<any[]>("/api/cursos/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Array.isArray(data) ? data.map((c: any) => ({
        id: c.id,
        titulo: c.titulo ?? "",
        plataforma: c.plataforma ?? "otro",
        duracion: c.nivel ?? "",
        url: c.url ?? "",
        inscrito: c.ya_inscrito ?? false,
        progreso: 0,
      })) : [];
    } catch {
      return [];
    }
  },

  // Inscribir al estudiante en un curso (crea CursoCompletado con estado=pendiente)
  inscribirse: (cursoId: number): Promise<void> =>
    request<void>("/api/cursos/completar/", {
      method: "POST",
      body: JSON.stringify({ curso_id: cursoId }),
    }),

  // Cursos en los que el estudiante ya está inscrito (con su estado)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMisCursos: (): Promise<any[]> =>
    request<any[]>("/api/cursos/completar/"),

  // Cursos pendientes de validación (para docentes)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPendientesValidacion: (): Promise<any[]> =>
    request<any[]>("/api/cursos/completar/"),

  // Validar o rechazar un curso (docente)
  validar: (id: number, estado: "aprobado" | "rechazado"): Promise<void> =>
    request<void>(`/api/cursos/completar/${id}/validar/`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }),

  crear: (data: {
    titulo: string;
    descripcion: string;
    url: string;
    plataforma?: string;
    especialidad?: string;
    nivel?: string;
  }): Promise<Curso> =>
    request<Curso>("/api/cursos/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Ofertas laborales ───────────────────────────────────────────────────────
export const ofertasApi = {
  getAll: async (params?: Record<string, string>): Promise<PaginatedResponse<OfertaLaboral>> => {
    const mapped: Record<string, string> = {};
    if (params?.especialidad) mapped["especialidad_requerida"] = params.especialidad;
    if (params?.disponibilidad) mapped["disponibilidad_requerida"] = params.disponibilidad;
    if (params?.search) mapped["search"] = params.search;
    const qs = Object.keys(mapped).length ? "?" + new URLSearchParams(mapped).toString() : "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await request<any[]>(`/api/ofertas/${qs}`);
    const results = Array.isArray(data) ? data.map(fromBackendOferta) : [];
    return { count: results.length, next: null, previous: null, results };
  },

  get: async (id: number): Promise<OfertaLaboral> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await request<any>(`/api/ofertas/${id}/`);
    return fromBackendOferta(data);
  },

  crear: (data: Partial<OfertaLaboral>): Promise<unknown> => {
    const payload: Record<string, unknown> = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      especialidad_requerida: data.especialidad ?? "",
      remuneracion: data.salario ?? "",
      ubicacion: data.ubicacion ?? "",
      modalidad: data.modalidad === "Presencial" ? "presencial"
        : data.modalidad === "Híbrido" ? "semi_presencial"
        : data.modalidad === "Remoto" ? "online"
        : "presencial",
      disponibilidad_requerida: data.tipo === "Part-time" ? "part_time"
        : data.tipo === "Full-time" ? "full_time"
        : data.tipo === "Práctica" ? "practicas"
        : "part_time",
    };
    return request<unknown>("/api/ofertas/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  actualizar: (id: number, data: Partial<OfertaLaboral>): Promise<OfertaLaboral> =>
    request<OfertaLaboral>(`/api/ofertas/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  eliminar: (id: number): Promise<void> =>
    request<void>(`/api/ofertas/${id}/`, { method: "DELETE" }),

  getMisOfertas: async (): Promise<OfertaLaboral[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await request<any[]>("/api/ofertas/?mis_ofertas=true");
    return Array.isArray(data) ? data.map(fromBackendOferta) : [];
  },
};

// ─── Postulaciones ───────────────────────────────────────────────────────────
export const postulacionesApi = {
  postular: (ofertaId: number, mensaje?: string): Promise<Postulacion> =>
    request<Postulacion>("/api/postulaciones/", {
      method: "POST",
      body: JSON.stringify({ oferta: ofertaId, mensaje_estudiante: mensaje ?? "" }),
    }),

  getMias: async (): Promise<Postulacion[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await request<any[]>("/api/postulaciones/");
      return Array.isArray(data) ? data.map((p) => ({
        id: p.id,
        oferta: p.oferta,
        oferta_titulo: p.oferta_titulo ?? "",
        oferta_empresa_nombre: p.oferta_empresa_nombre ?? "",
        estudiante: p.estudiante,
        estado: (p.estado?.toLowerCase() ?? "pendiente") as Postulacion["estado"],
        fecha_postulacion: p.fecha ?? "",
        mensaje_estudiante: p.mensaje_estudiante ?? "",
      })) : [];
    } catch {
      return [];
    }
  },

  getDeOferta: (ofertaId: number): Promise<Postulacion[]> =>
    request<Postulacion[]>(`/api/postulaciones/oferta/${ofertaId}/`),

  actualizar: (id: number, estado: string): Promise<Postulacion> =>
    request<Postulacion>(`/api/postulaciones/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }),
};

// ─── Recomendaciones ─────────────────────────────────────────────────────────
export const recomendacionesApi = {
  getParaEmpresa: async (): Promise<EstudiantePerfil[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await request<any[]>("/api/empresa/recomendaciones/");
      return Array.isArray(data) ? data.map(fromBackendEstudiante) : [];
    } catch {
      return [];
    }
  },
};

// ─── Feed ────────────────────────────────────────────────────────────────────
export const feedApi = {
  getPosts: async (): Promise<FeedPost[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await request<any[]>("/api/feed/");
    return Array.isArray(data) ? data.map(fromBackendPost) : [];
  },

  getPostsDeUsuario: async (autorUserId: number): Promise<FeedPost[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await request<any[]>(`/api/feed/?autor_id=${autorUserId}`);
    return Array.isArray(data) ? data.map(fromBackendPost) : [];
  },

  crearPost: (contenido: string, tipo: string, imagen?: File): Promise<unknown> => {
    const form = new FormData();
    form.append("contenido", contenido);
    form.append("tipo", tipo);
    if (imagen) form.append("imagen", imagen);
    return request<unknown>("/api/feed/", { method: "POST", body: form });
  },

  likear: async (_id: number): Promise<void> => {
    // Backend aún no tiene endpoint de likes — stub silencioso
    return Promise.resolve();
  },

  reportar: (usuarioReportadoId: number, motivo: string, descripcion: string, publicacionId?: number): Promise<unknown> =>
    request<unknown>("/api/reporte/", {
      method: "POST",
      body: JSON.stringify({
        usuario_reportado: usuarioReportadoId,
        motivo,
        descripcion,
        ...(publicacionId ? { publicacion: publicacionId } : {}),
      }),
    }),

  eliminarPost: (id: number): Promise<void> =>
    request<void>(`/api/feed/${id}/`, { method: "DELETE" }),

};

// ─── Docente — administración ─────────────────────────────────────────────────
export const docenteApi = {
  getSolicitudes: async (): Promise<SolicitudAlumno[]> => {
    try {
      // Los estudiantes inactivos son los que necesitan aprobación
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await request<any[]>("/api/estudiantes/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (Array.isArray(data) ? data : []).map((p: any) => ({
        id: p.id,
        nombre: p.usuario ? `${p.usuario.first_name} ${p.usuario.last_name}`.trim() : `Estudiante ${p.id}`,
        especialidad: p.especialidad ?? "",
        curso: p.grado ?? "",
        email: p.usuario?.email ?? "",
        fecha_solicitud: p.usuario?.date_joined ?? new Date().toISOString(),
        estado: (p.usuario?.is_active ? "aprobado" : "pendiente") as SolicitudAlumno["estado"],
      }));
    } catch {
      return [];
    }
  },

  aprobarSolicitud: (id: number): Promise<void> =>
    request<void>(`/api/estudiantes/${id}/activar/`, { method: "PATCH" }),

  rechazarSolicitud: async (_id: number): Promise<void> => {
    // No existe endpoint de rechazo — stub
    return Promise.resolve();
  },

  getAlumnosPendientesValidacion: async (): Promise<EstudiantePerfil[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await request<any[]>("/api/estudiantes/");
      return Array.isArray(data) ? data.map(fromBackendEstudiante) : [];
    } catch {
      return [];
    }
  },

  getEstadisticas: (): Promise<EstadisticasGenerales> =>
    request<EstadisticasGenerales>("/api/estadisticas/"),

  getNivelDocente: async (): Promise<{ nivel: string; es_admin: boolean }> => {
    try {
      const me = await request<AuthUser>("/api/me/");
      return { nivel: "Docente", es_admin: me.es_admin ?? false };
    } catch {
      return { nivel: "Docente", es_admin: false };
    }
  },
};

// ─── Evidencias ──────────────────────────────────────────────────────────────
export const evidenciasApi = {
  getMias: async (profileId: number): Promise<{ id: number; titulo: string; descripcion: string; imagen: string; fecha_subida: string }[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await request<any[]>(`/api/evidencias/estudiante/${profileId}/`);
      return Array.isArray(data) ? data.map((e) => ({
        ...e,
        imagen: e.imagen?.startsWith("http") ? e.imagen : `${BASE}${e.imagen}`,
      })) : [];
    } catch {
      return [];
    }
  },

  crear: (titulo: string, descripcion: string, imagen: File): Promise<unknown> => {
    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descripcion", descripcion);
    fd.append("imagen", imagen);
    return request("/api/evidencias/", { method: "POST", body: fd });
  },
};

// ─── QR ─────────────────────────────────────────────────────────────────────
export const qrApi = {
  getUrlPerfil: (userId: number): string =>
    `${window.location.origin}/perfil/${userId}`,
};

// ─── Disponibilidad ──────────────────────────────────────────────────────────
export const adminApi = {
  suspenderUsuario: (usuarioId: number, dias: number): Promise<{ mensaje: string }> =>
    request<{ mensaje: string }>(`/api/usuarios/${usuarioId}/gestion/`, {
      method: "PATCH",
      body: JSON.stringify({ accion: "suspender", dias }),
    }),

  bloquearUsuario: (usuarioId: number): Promise<{ mensaje: string }> =>
    request<{ mensaje: string }>(`/api/usuarios/${usuarioId}/gestion/`, {
      method: "PATCH",
      body: JSON.stringify({ accion: "bloquear" }),
    }),

  reactivarUsuario: (usuarioId: number): Promise<{ mensaje: string }> =>
    request<{ mensaje: string }>(`/api/usuarios/${usuarioId}/gestion/`, {
      method: "PATCH",
      body: JSON.stringify({ accion: "reactivar" }),
    }),
};

export const reportesApi = {
  getAll: (): Promise<Reporte[]> =>
    request<Reporte[]>("/api/reporte/"),

  updateEstado: (id: number, estado: EstadoReporte): Promise<Reporte> =>
    request<Reporte>(`/api/reporte/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }),
};

export const disponibilidadApi = {
  get: async (): Promise<{ id: number; disponibilidad: string }[]> => {
    try {
      return await request<{ id: number; disponibilidad: string }[]>("/api/disponibilidad/");
    } catch {
      return [];
    }
  },

  set: async (disponibilidad: string): Promise<void> => {
    // Borra todas las anteriores y crea la nueva
    const actuales = await disponibilidadApi.get();
    await Promise.all(actuales.map((d) =>
      request(`/api/disponibilidad/${d.id}/`, { method: "DELETE" }).catch(() => {})
    ));
    if (disponibilidad) {
      await request("/api/disponibilidad/", {
        method: "POST",
        body: JSON.stringify({ disponibilidad }),
      });
    }
  },
};
