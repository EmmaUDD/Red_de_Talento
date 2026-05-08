import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import {
  Search, Building2, BookOpen, Loader2, MapPin, Briefcase,
  CheckCircle, GraduationCap, Users, BookMarked, Clock, ExternalLink,
} from "lucide-react";
import { perfilApi, cursosApi, ofertasApi } from "@/api/api";
import { usePerfil } from "@/app/context/PerfilContext";
import { useAuth } from "@/app/context/AuthContext";
import type { EstudiantePerfil, EmpresaResult, DocenteResult, OfertaLaboral } from "@/app/types";

type Categoria = "personas" | "cursos" | "empleos";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const FONT_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const tipoStyle: Record<string, React.CSSProperties> = {
  "Full-time":  { backgroundColor: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" },
  "Part-time":  { backgroundColor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" },
  "Práctica":   { backgroundColor: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" },
};
const modalidadStyle: Record<string, React.CSSProperties> = {
  "Presencial": { backgroundColor: "#F6F5F0", color: "#4A3F35", border: "1px solid #E8E4DC" },
  "Híbrido":    { backgroundColor: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" },
  "Remoto":     { backgroundColor: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" },
};

function EstudianteCard({ e, onClick }: { e: EstudiantePerfil; onClick: () => void }) {
  const foto = e.foto_perfil ?? e.foto;
  const fotoSrc = foto ? (foto.startsWith("http") ? foto : `${BASE_URL}${foto}`) : null;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left",
        backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14,
        padding: "14px 16px",
        display: "flex", alignItems: "flex-start", gap: 12,
        cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      onMouseEnter={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.boxShadow = "0 2px 8px rgba(212,175,55,0.12)"; }}
      onMouseLeave={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", flexShrink: 0, backgroundColor: "#0d1b35", border: "2px solid #F0EDE8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {fotoSrc ? (
          <img src={fotoSrc} alt={e.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#D4AF37" }}>
            {e.nombre.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0d1b35", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.nombre}</p>
          {e.validado && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, backgroundColor: "#FFFBF0", color: "#B8962E", border: "1px solid #D4AF37", display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
              <CheckCircle style={{ width: 10, height: 10 }} /> Validado
            </span>
          )}
        </div>
        <p style={{ fontSize: "0.78rem", color: "#6B5D52", margin: "2px 0 0" }}>{e.especialidad}{e.curso ? ` · ${e.curso}` : ""}</p>
        {e.comuna && (
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 3 }}>
            <MapPin style={{ width: 11, height: 11 }} />{e.comuna}
          </p>
        )}
        {e.disponibilidad && (
          <span style={{ display: "inline-block", marginTop: 5, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, backgroundColor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
            {e.disponibilidad}
          </span>
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, backgroundColor: "#FFFBF0", color: "#B8962E", border: "1px solid #D4AF37", flexShrink: 0, marginTop: 1 }}>
        Estudiante
      </span>
    </button>
  );
}

function EmpresaCard({ e, onClick }: { e: EmpresaResult; onClick: () => void }) {
  const foto = e.foto_url ?? e.foto_perfil;
  const fotoSrc = foto ? (foto.startsWith("http") ? foto : `${BASE_URL}${foto}`) : null;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left",
        backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14,
        padding: "14px 16px",
        display: "flex", alignItems: "flex-start", gap: 12,
        cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      onMouseEnter={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.boxShadow = "0 2px 8px rgba(212,175,55,0.12)"; }}
      onMouseLeave={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", flexShrink: 0, backgroundColor: "#FFFBF0", border: "2px solid #F5E6C0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {fotoSrc ? (
          <img src={fotoSrc} alt={e.nombre_empresa} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <Building2 style={{ width: 20, height: 20, color: "#D4AF37" }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0d1b35", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.nombre_empresa}</p>
        <p style={{ fontSize: "0.78rem", color: "#6B5D52", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 3 }}>
          <Briefcase style={{ width: 11, height: 11 }} />{e.industria}
        </p>
        {e.descripcion && (
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "3px 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
            {e.descripcion}
          </p>
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, backgroundColor: "#F6F5F0", color: "#4A3F35", border: "1px solid #E8E4DC", flexShrink: 0, marginTop: 1 }}>
        Empresa
      </span>
    </button>
  );
}

function DocenteCard({ d, onClick }: { d: DocenteResult; onClick: () => void }) {
  const foto = d.foto_url ?? d.foto_perfil;
  const fotoSrc = foto ? (foto.startsWith("http") ? foto : `${BASE_URL}${foto}`) : null;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left",
        backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14,
        padding: "14px 16px",
        display: "flex", alignItems: "flex-start", gap: 12,
        cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      onMouseEnter={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.boxShadow = "0 2px 8px rgba(212,175,55,0.12)"; }}
      onMouseLeave={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", flexShrink: 0, backgroundColor: "#F0EDE8", border: "2px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {fotoSrc ? (
          <img src={fotoSrc} alt={d.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <BookOpen style={{ width: 20, height: 20, color: "#8C7B6B" }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0d1b35", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Prof. {d.nombre}</p>
        {d.departamento && <p style={{ fontSize: "0.78rem", color: "#6B5D52", margin: "2px 0 0" }}>{d.departamento}</p>}
        {d.bio && (
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "3px 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
            {d.bio}
          </p>
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, backgroundColor: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", flexShrink: 0, marginTop: 1 }}>
        Docente
      </span>
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CursoCard({ curso, esEstudiante, onInscribirse }: { curso: any; esEstudiante: boolean; onInscribirse: (id: number) => void }) {
  const [inscribiendo, setInscribiendo] = useState(false);
  const [inscrito, setInscrito] = useState<boolean>(curso.ya_inscrito ?? false);

  const handleInscribirse = async () => {
    setInscribiendo(true);
    try {
      await onInscribirse(curso.id);
      setInscrito(true);
    } finally {
      setInscribiendo(false);
    }
  };

  const nivelStyle: Record<string, React.CSSProperties> = {
    basico:      { backgroundColor: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" },
    intermedio:  { backgroundColor: "#FFFBF0", color: "#B8962E", border: "1px solid #D4AF37" },
    avanzado:    { backgroundColor: "#FFF1F0", color: "#BE123C", border: "1px solid #FECDD3" },
  };

  const plataformaIcon = curso.plataforma === "youtube" ? "▶" : curso.plataforma === "udemy" ? "🎓" : "📘";

  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: "16px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.2rem" }}>
          {plataformaIcon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>{curso.titulo}</p>
            {curso.nivel && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, flexShrink: 0, ...(nivelStyle[curso.nivel] ?? { backgroundColor: "#F6F5F0", color: "#4A3F35", border: "1px solid #E8E4DC" }) }}>
                {curso.nivel}
              </span>
            )}
          </div>
          {curso.especialidad && <p style={{ fontSize: "0.78rem", color: "#6B5D52", margin: "2px 0 0" }}>{curso.especialidad}</p>}
          {curso.descripcion && (
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "4px 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {curso.descripcion}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {curso.publicado_por_nombre && (
                <span style={{ fontSize: "0.72rem", color: "#8C7B6B", display: "flex", alignItems: "center", gap: 3 }}>
                  <BookOpen style={{ width: 11, height: 11 }} /> {curso.publicado_por_nombre}
                </span>
              )}
              {curso.plataforma && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, backgroundColor: "#F6F5F0", color: "#4A3F35", border: "1px solid #E8E4DC" }}>
                  {curso.plataforma}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {curso.url && (
                <a
                  href={curso.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, padding: "5px 12px", borderRadius: 8, border: "1px solid #E8E4DC", color: "#4A3F35", backgroundColor: "#F6F5F0", textDecoration: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Ver curso <ExternalLink style={{ width: 11, height: 11 }} />
                </a>
              )}
              {esEstudiante && (
                inscrito ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, padding: "5px 12px", borderRadius: 8, backgroundColor: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>
                    <CheckCircle style={{ width: 11, height: 11 }} /> Inscrito
                  </span>
                ) : (
                  <button
                    onClick={handleInscribirse}
                    disabled={inscribiendo}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, padding: "5px 14px", borderRadius: 8, backgroundColor: inscribiendo ? "#E8E4DC" : "#0d1b35", color: inscribiendo ? "#8C7B6B" : "#FFFFFF", border: "none", cursor: inscribiendo ? "default" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background-color 0.15s" }}
                  >
                    {inscribiendo ? <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" /> : null}
                    Inscribirse
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmpleoCard({ o }: { o: OfertaLaboral }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = o as any;
  const fotoRaw = raw.empresa_foto ?? o.logo_empresa;
  const fotoSrc = fotoRaw ? (fotoRaw.startsWith("http") ? fotoRaw : `${BASE_URL}${fotoRaw}`) : null;
  const empresaNombre = raw.empresa_nombre ?? o.empresa;

  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderLeft: `3.5px solid ${tipoStyle[o.tipo]?.color ?? "#D4AF37"}`, borderRadius: 14, padding: "16px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", flexShrink: 0, backgroundColor: "#FFFBF0", border: "1px solid #F5E6C0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {fotoSrc ? (
            <img src={fotoSrc} alt={empresaNombre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <Building2 style={{ width: 20, height: 20, color: "#D4AF37" }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>{o.titulo}</p>
          <p style={{ fontSize: "0.78rem", color: "#6B5D52", margin: "2px 0 0" }}>{empresaNombre}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {o.tipo && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, ...tipoStyle[o.tipo] }}>
                {o.tipo}
              </span>
            )}
            {o.modalidad && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, ...modalidadStyle[o.modalidad] }}>
                {o.modalidad}
              </span>
            )}
            {o.ubicacion && (
              <span style={{ fontSize: 11, color: "#8C7B6B", display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin style={{ width: 11, height: 11 }} />{o.ubicacion}
              </span>
            )}
          </div>
          {o.descripcion && (
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "6px 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {o.descripcion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SeccionResultados({ titulo, count, children }: { titulo: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
          {titulo}
        </p>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 20, backgroundColor: "#F6F5F0", color: "#4A3F35", border: "1px solid #E8E4DC" }}>
          {count}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

export function BusquedaGlobal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [categoria, setCategoria] = useState<Categoria>("personas");

  const [estudiantes, setEstudiantes] = useState<EstudiantePerfil[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaResult[]>([]);
  const [docentes, setDocentes] = useState<DocenteResult[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cursos, setCursos] = useState<any[]>([]);
  const [empleos, setEmpleos] = useState<OfertaLaboral[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [errorInscripcion, setErrorInscripcion] = useState<string | null>(null);

  const { openPerfil } = usePerfil();
  const { user } = useAuth();
  const esEstudiante = user?.role === "student";

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  const buscar = useCallback(async (q: string, cat: Categoria) => {
    setLoading(true);
    setBuscado(true);
    setErrorInscripcion(null);
    try {
      if (cat === "personas") {
        const [est, emp, doc] = await Promise.all([
          q.trim() ? perfilApi.getEstudiantes({ nombre: q }).then((r) => r.results) : Promise.resolve([]),
          q.trim() ? perfilApi.getEmpresas(q) : Promise.resolve([]),
          q.trim() ? perfilApi.getDocentes(q) : Promise.resolve([]),
        ]);
        setEstudiantes(est); setEmpresas(emp); setDocentes(doc);
      } else if (cat === "cursos") {
        const data = await cursosApi.getAll(q.trim() || undefined);
        setCursos(data);
      } else if (cat === "empleos") {
        const res = await ofertasApi.getAll(q.trim() ? { search: q.trim() } : undefined);
        setEmpleos(Array.isArray(res) ? res : (res as { results?: OfertaLaboral[] }).results ?? []);
      }
    } catch {
      setEstudiantes([]); setEmpresas([]); setDocentes([]); setCursos([]); setEmpleos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setQuery(q);
    buscar(q, categoria);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams(query.trim() ? { q: query.trim() } : {}, { replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [query, setSearchParams]);

  useEffect(() => {
    buscar(query, categoria);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria]);

  const handleInscribirse = async (cursoId: number) => {
    try {
      await cursosApi.inscribirse(cursoId);
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      setErrorInscripcion(String(e.error ?? "Error al inscribirse. Intenta de nuevo."));
    }
  };

  const totalPersonas = estudiantes.length + empresas.length + docentes.length;
  const total = categoria === "personas" ? totalPersonas : categoria === "cursos" ? cursos.length : empleos.length;

  const tabs: { id: Categoria; label: string; icon: React.ReactNode }[] = [
    { id: "personas", label: "Personas", icon: <Users style={{ width: 13, height: 13 }} /> },
    { id: "cursos",   label: "Cursos",   icon: <BookMarked style={{ width: 13, height: 13 }} /> },
    { id: "empleos",  label: "Empleos",  icon: <Briefcase style={{ width: 13, height: 13 }} /> },
  ];

  const placeholders: Record<Categoria, string> = {
    personas: "Buscar estudiantes, empresas o docentes...",
    cursos:   "Buscar cursos por nombre o especialidad...",
    empleos:  "Buscar ofertas laborales...",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

<div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DC" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 0" }}>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: "#0d1b35", margin: 0, lineHeight: 1.2 }}>
              Búsqueda
            </h1>
            <p style={{ fontSize: "0.82rem", color: "#8C7B6B", margin: "3px 0 0" }}>
              Encuentra personas, cursos y empleos
            </p>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#8C7B6B" }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholders[categoria]}
              style={{
                width: "100%", boxSizing: "border-box",
                backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC",
                borderRadius: 10, paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                fontSize: "0.88rem", color: "#0d1b35",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                outline: "none", transition: "border-color 0.15s, background-color 0.15s",
              }}
              onFocus={(el) => { el.currentTarget.style.backgroundColor = "#FFFFFF"; el.currentTarget.style.borderColor = "#D4AF37"; }}
              onBlur={(el) => { el.currentTarget.style.backgroundColor = "#F6F5F0"; el.currentTarget.style.borderColor = "#E8E4DC"; }}
            />
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", marginTop: 14, borderBottom: "2px solid #E8E4DC" }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setCategoria(t.id)}
                style={{
                  flex: 1, padding: "10px 4px",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: 600,
                  color: categoria === t.id ? "#0d1b35" : "#94a3b8",
                  borderBottom: categoria === t.id ? "2px solid #D4AF37" : "2px solid transparent",
                  marginBottom: -2,
                  transition: "color 0.15s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {errorInscripcion && (
          <div style={{ backgroundColor: "#FFF1F0", border: "1px solid #FECDD3", borderRadius: 12, padding: "10px 14px" }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#BE123C", margin: 0 }}>{errorInscripcion}</p>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 64, paddingBottom: 64 }}>
            <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: "#D4AF37" }} />
          </div>

        ) : buscado && total === 0 && (categoria !== "personas" || query.trim()) ? (
          <div style={{ textAlign: "center", paddingTop: 64, paddingBottom: 64 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Search style={{ width: 22, height: 22, color: "#8C7B6B" }} />
            </div>
            <p style={{ fontSize: "0.88rem", color: "#6B5D52", margin: 0 }}>
              No se encontraron {categoria === "personas" ? "personas" : categoria === "cursos" ? "cursos" : "empleos"}
              {query.trim() ? <> para <strong style={{ color: "#0d1b35" }}>"{query}"</strong></> : null}
            </p>
          </div>

        ) : !buscado || (categoria === "personas" && !query.trim()) ? (
          categoria === "personas" ? (
            <div style={{ textAlign: "center", paddingTop: 64, paddingBottom: 64 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Search style={{ width: 22, height: 22, color: "#8C7B6B" }} />
              </div>
              <p style={{ fontSize: "0.88rem", color: "#6B5D52", margin: 0 }}>Escribe un nombre para buscar personas</p>
            </div>
          ) : null

        ) : (
          <>
            {categoria === "personas" && (
              <>
                <SeccionResultados titulo="Estudiantes" count={estudiantes.length}>
                  {estudiantes.map((e) => (
                    <EstudianteCard key={e.id} e={e} onClick={() => openPerfil(e.id, "estudiante")} />
                  ))}
                </SeccionResultados>
                <SeccionResultados titulo="Empresas" count={empresas.length}>
                  {empresas.map((e) => (
                    <EmpresaCard key={e.id} e={e} onClick={() => openPerfil(e.id, "empresa")} />
                  ))}
                </SeccionResultados>
                <SeccionResultados titulo="Docentes" count={docentes.length}>
                  {docentes.map((d) => (
                    <DocenteCard key={d.id} d={d} onClick={() => openPerfil(d.id, "docente")} />
                  ))}
                </SeccionResultados>
                {totalPersonas === 0 && query.trim() && (
                  <div style={{ textAlign: "center", paddingTop: 48, paddingBottom: 48 }}>
                    <p style={{ fontSize: "0.88rem", color: "#6B5D52", margin: 0 }}>
                      No se encontraron resultados para <strong style={{ color: "#0d1b35" }}>"{query}"</strong>
                    </p>
                  </div>
                )}
              </>
            )}

            {categoria === "cursos" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cursos.length === 0 ? (
                  <div style={{ textAlign: "center", paddingTop: 64, paddingBottom: 64 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <GraduationCap style={{ width: 22, height: 22, color: "#8C7B6B" }} />
                    </div>
                    <p style={{ fontSize: "0.88rem", color: "#6B5D52", margin: 0 }}>
                      No hay cursos disponibles{query.trim() ? ` para "${query}"` : ""}
                    </p>
                  </div>
                ) : (
                  <>
                    {esEstudiante && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, backgroundColor: "#FFFBF0", border: "1px solid #F5E6C0", borderRadius: 10, padding: "9px 12px", marginBottom: 4 }}>
                        <Clock style={{ width: 13, height: 13, color: "#B8962E", flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: "0.75rem", color: "#8C7B6B", margin: 0, lineHeight: 1.5 }}>
                          Al inscribirte, el curso aparecerá en tu perfil como "Por validar" hasta que el docente lo apruebe.
                        </p>
                      </div>
                    )}
                    {cursos.map((c) => (
                      <CursoCard key={c.id} curso={c} esEstudiante={esEstudiante} onInscribirse={handleInscribirse} />
                    ))}
                  </>
                )}
              </div>
            )}

            {categoria === "empleos" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {empleos.length === 0 ? (
                  <div style={{ textAlign: "center", paddingTop: 64, paddingBottom: 64 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <Briefcase style={{ width: 22, height: 22, color: "#8C7B6B" }} />
                    </div>
                    <p style={{ fontSize: "0.88rem", color: "#6B5D52", margin: 0 }}>
                      No hay empleos disponibles{query.trim() ? ` para "${query}"` : ""}
                    </p>
                  </div>
                ) : (
                  empleos.map((o) => <EmpleoCard key={o.id} o={o} />)
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
