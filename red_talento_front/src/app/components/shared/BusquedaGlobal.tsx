import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import {
  Search, Award, Building2, BookOpen, Loader2, MapPin, Briefcase,
  CheckCircle, GraduationCap, Users, BookMarked, Clock,
} from "lucide-react";
import { perfilApi, cursosApi, ofertasApi } from "@/api/api";
import { usePerfil } from "@/app/context/PerfilContext";
import { useAuth } from "@/app/context/AuthContext";
import type { EstudiantePerfil, EmpresaResult, DocenteResult, OfertaLaboral } from "@/app/types";

type Categoria = "personas" | "cursos" | "empleos";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// ─── Cards de personas ────────────────────────────────────────────────────────
function EstudianteCard({ e, onClick }: { e: EstudiantePerfil; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 hover:border-slate-400 hover:shadow-sm transition-all">
      {(e.foto_perfil ?? e.foto) ? (
        <img src={e.foto_perfil ?? e.foto} alt={e.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Award className="w-5 h-5 text-slate-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-slate-900 text-sm font-semibold truncate">{e.nombre}</p>
          {e.validado && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5"
              style={{ backgroundColor: "#FFFBF0", color: "#B8962E", border: "1px solid #D4AF37" }}>
              <CheckCircle className="w-2.5 h-2.5" /> Validado
            </span>
          )}
        </div>
        <p className="text-slate-500 text-xs mt-0.5">{e.especialidad}{e.curso ? ` · ${e.curso}` : ""}</p>
        {e.comuna && <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{e.comuna}</p>}
        {e.disponibilidad && (
          <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{e.disponibilidad}</span>
        )}
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold flex-shrink-0">Estudiante</span>
    </button>
  );
}

function EmpresaCard({ e, onClick }: { e: EmpresaResult; onClick: () => void }) {
  const foto = e.foto_url ?? e.foto_perfil;
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 hover:border-slate-400 hover:shadow-sm transition-all">
      {foto ? (
        <img src={foto} alt={e.nombre_empresa} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-amber-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 text-sm font-semibold truncate">{e.nombre_empresa}</p>
        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1"><Briefcase className="w-3 h-3" />{e.industria}</p>
        {e.descripcion && <p className="text-slate-400 text-xs mt-1 line-clamp-1">{e.descripcion}</p>}
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold flex-shrink-0">Empresa</span>
    </button>
  );
}

function DocenteCard({ d, onClick }: { d: DocenteResult; onClick: () => void }) {
  const foto = d.foto_url ?? d.foto_perfil;
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 hover:border-slate-400 hover:shadow-sm transition-all">
      {foto ? (
        <img src={foto} alt={d.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-green-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 text-sm font-semibold truncate">{d.nombre}</p>
        {d.departamento && <p className="text-slate-500 text-xs mt-0.5">{d.departamento}</p>}
        {d.bio && <p className="text-slate-400 text-xs mt-1 line-clamp-1">{d.bio}</p>}
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold flex-shrink-0">Docente</span>
    </button>
  );
}

// ─── Card de curso ────────────────────────────────────────────────────────────
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

  const nivelColors: Record<string, string> = {
    basico: "bg-green-50 text-green-700 border-green-200",
    intermedio: "bg-amber-50 text-amber-700 border-amber-200",
    avanzado: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-lg">
          {curso.plataforma === "youtube" ? "▶️" : curso.plataforma === "udemy" ? "🎓" : "📘"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className="text-slate-900 text-sm font-semibold">{curso.titulo}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${nivelColors[curso.nivel] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
              {curso.nivel}
            </span>
          </div>
          {curso.especialidad && (
            <p className="text-slate-500 text-xs mt-0.5">{curso.especialidad}</p>
          )}
          {curso.descripcion && (
            <p className="text-slate-400 text-xs mt-1 line-clamp-2">{curso.descripcion}</p>
          )}
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {curso.publicado_por_nombre && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {curso.publicado_por_nombre}
                </span>
              )}
              {curso.plataforma && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{curso.plataforma}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {curso.url && (
                <a
                  href={curso.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                >
                  Ver curso
                </a>
              )}
              {esEstudiante && (
                inscrito ? (
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Inscrito
                  </span>
                ) : (
                  <button
                    onClick={handleInscribirse}
                    disabled={inscribiendo}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-300 transition-colors font-medium flex items-center gap-1"
                  >
                    {inscribiendo ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
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

// ─── Card de empleo ───────────────────────────────────────────────────────────
function EmpleoCard({ o }: { o: OfertaLaboral }) {
  const fotoSrc = o.empresa_foto
    ? o.empresa_foto.startsWith("http") ? o.empresa_foto : `${BASE_URL}${o.empresa_foto}`
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        {fotoSrc ? (
          <img src={fotoSrc} alt={o.empresa_nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 text-sm font-semibold">{o.titulo}</p>
          <p className="text-slate-500 text-xs mt-0.5">{o.empresa_nombre}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {o.tipo && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">{o.tipo}</span>}
            {o.modalidad && <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{o.modalidad}</span>}
            {o.ubicacion && <span className="text-xs text-slate-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{o.ubicacion}</span>}
          </div>
          {o.descripcion && <p className="text-slate-400 text-xs mt-2 line-clamp-2">{o.descripcion}</p>}
        </div>
      </div>
    </div>
  );
}

function SeccionResultados({ titulo, count, children }: { titulo: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-slate-700 text-sm font-semibold">{titulo}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function BusquedaGlobal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [categoria, setCategoria] = useState<Categoria>("personas");

  // Personas
  const [estudiantes, setEstudiantes] = useState<EstudiantePerfil[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaResult[]>([]);
  const [docentes, setDocentes] = useState<DocenteResult[]>([]);

  // Cursos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cursos, setCursos] = useState<any[]>([]);

  // Empleos
  const [empleos, setEmpleos] = useState<OfertaLaboral[]>([]);

  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [errorInscripcion, setErrorInscripcion] = useState<string | null>(null);

  const { openPerfil } = usePerfil();
  const { user } = useAuth();
  const esEstudiante = user?.role === "student";

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

  // Sincronizar con URL query param
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setQuery(q);
    buscar(q, categoria);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounce del query
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams(query.trim() ? { q: query.trim() } : {}, { replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [query, setSearchParams]);

  // Re-buscar al cambiar categoría
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
    { id: "personas", label: "Personas", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "cursos", label: "Cursos", icon: <BookMarked className="w-3.5 h-3.5" /> },
    { id: "empleos", label: "Empleos", icon: <Briefcase className="w-3.5 h-3.5" /> },
  ];

  const placeholders: Record<Categoria, string> = {
    personas: "Buscar estudiantes, empresas o docentes...",
    cursos: "Buscar cursos por nombre, especialidad...",
    empleos: "Buscar ofertas laborales...",
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-slate-900 font-bold text-lg">Búsqueda</h1>
          <p className="text-slate-500 text-sm mt-0.5">Encuentra personas, cursos y empleos</p>

          {/* Barra de búsqueda */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholders[categoria]}
              className="w-full bg-slate-100 border border-transparent rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-slate-300 transition-all"
            />
          </div>

          {/* Tabs de categoría */}
          <div className="flex gap-2 mt-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setCategoria(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  categoria === t.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {errorInscripcion && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-xs font-medium">{errorInscripcion}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : buscado && total === 0 && (categoria !== "personas" || query.trim()) ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">
              No se encontraron {categoria === "personas" ? "personas" : categoria === "cursos" ? "cursos" : "empleos"}
              {query.trim() ? <> para <strong>"{query}"</strong></> : null}
            </p>
          </div>
        ) : !buscado || (categoria === "personas" && !query.trim()) ? (
          categoria === "personas" ? (
            <div className="text-center py-16">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Escribe un nombre para buscar personas</p>
            </div>
          ) : null
        ) : (
          <>
            {/* Personas */}
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
                  <div className="text-center py-16">
                    <p className="text-slate-400 text-sm">No se encontraron resultados para <strong>"{query}"</strong></p>
                  </div>
                )}
              </>
            )}

            {/* Cursos */}
            {categoria === "cursos" && (
              <div className="space-y-3">
                {cursos.length === 0 ? (
                  <div className="text-center py-16">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No hay cursos disponibles{query.trim() ? ` para "${query}"` : ""}</p>
                  </div>
                ) : (
                  <>
                    {esEstudiante && (
                      <p className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Al inscribirte, el curso aparecerá en tu perfil como "Por validar" hasta que el docente lo apruebe.
                      </p>
                    )}
                    {cursos.map((c) => (
                      <CursoCard
                        key={c.id}
                        curso={c}
                        esEstudiante={esEstudiante}
                        onInscribirse={handleInscribirse}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Empleos */}
            {categoria === "empleos" && (
              <div className="space-y-3">
                {empleos.length === 0 ? (
                  <div className="text-center py-16">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No hay empleos disponibles{query.trim() ? ` para "${query}"` : ""}</p>
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
