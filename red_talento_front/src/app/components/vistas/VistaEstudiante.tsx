import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  CheckCircle, Award, Wrench, Zap, Clock, ArrowLeft,
  MapPin, Shield, Image as ImageIcon, Loader2,
} from "lucide-react";
import { perfilApi, feedApi } from "@/api/api";
import type { EstudiantePerfil, Habilidad, FeedPost } from "@/app/types";
import { PostList } from "./PostList";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

function nivelColor(nivel: string) {
  if (nivel === "Alto") return "bg-green-50 text-green-700 border-green-200";
  if (nivel === "Medio") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function nivelPct(nivel: string) {
  if (nivel === "Alto") return 88;
  if (nivel === "Medio") return 60;
  return 35;
}

function nivelBar(nivel: string) {
  if (nivel === "Alto") return "#10b981";
  if (nivel === "Medio") return "#f59e0b";
  return "#ef4444";
}

function HabilidadRow({ h }: { h: Habilidad }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-800 text-sm truncate" style={{ fontWeight: 600 }}>{h.nombre}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${nivelColor(h.nivel ?? "")}`} style={{ fontWeight: 600 }}>
            {h.nivel}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${nivelPct(h.nivel ?? "")}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: nivelBar(h.nivel ?? "") }}
          />
        </div>
      </div>
    </div>
  );
}

export function VistaEstudiante() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<EstudiantePerfil | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"publicaciones" | "perfil" | "competencias" | "evidencias">("publicaciones");

  useEffect(() => {
    if (!id) return;
    perfilApi.getEstudiante(Number(id))
      .then((p) => {
        setPerfil(p);
        if (p.usuario_id) {
          feedApi.getPostsDeUsuario(p.usuario_id).then(setPosts).catch(() => {});
        }
      })
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-3">
        <p className="text-slate-500 text-sm">Perfil no encontrado.</p>
        <button onClick={() => navigate(-1)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver
        </button>
      </div>
    );
  }

  const foto = perfil.foto_perfil ?? perfil.foto;
  const fotoSrc = foto ? (foto.startsWith("http") ? foto : `${BASE_URL}${foto}`) : null;
  const techSkills = perfil.habilidades.filter((h) => h.tipo === "tecnica");
  const softSkills = perfil.habilidades.filter((h) => h.tipo === "blanda");

  const tabs = [
    { id: "publicaciones" as const, label: `Publicaciones` },
    { id: "perfil" as const, label: "Perfil" },
    { id: "competencias" as const, label: "Competencias" },
    { id: "evidencias" as const, label: "Evidencias" },
  ];

  const disponibilidadLabel: Record<string, string> = {
    part_time: "Part-time", full_time: "Full-time",
    fines_de_semana: "Fines de semana", practicas: "Práctica laboral",
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-0">
          {/* Volver */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>

          {/* Sello validado */}
          {perfil.validado && (
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4 text-xs"
              style={{ backgroundColor: "#FFFBF0", border: "1px solid #D4AF37", color: "#B8962E", fontWeight: 700 }}>
              <CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
              Perfil Validado Institucionalmente · Liceo Cardenal Caro
            </div>
          )}

          <div className="flex items-start gap-4 mb-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {fotoSrc ? (
                <img src={fotoSrc} alt={perfil.nombre} className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-200 flex items-center justify-center border border-slate-200">
                  <span className="text-slate-500 text-2xl font-bold">{perfil.nombre.charAt(0).toUpperCase()}</span>
                </div>
              )}
              {perfil.validado && (
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-10"
                  style={{ backgroundColor: "#D4AF37" }}>
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-slate-900 truncate" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                {perfil.nombre}
              </h1>
              <p className="text-slate-600 text-sm mt-0.5" style={{ fontWeight: 500 }}>{perfil.especialidad}</p>
              {perfil.curso && (
                <p className="text-slate-500 text-xs mt-0.5">{perfil.curso} · Liceo Cardenal Caro · Lo Espejo</p>
              )}
              {perfil.disponibilidad && (
                <span className="mt-2 inline-flex items-center gap-1 bg-slate-100 rounded-full px-2.5 py-1 text-xs text-slate-600">
                  <Clock className="w-3 h-3" />
                  {disponibilidadLabel[perfil.disponibilidad] ?? perfil.disponibilidad}
                </span>
              )}
            </div>
          </div>

          {/* Insignias */}
          {perfil.insignias.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-3">
              {perfil.insignias.map((b) => (
                <span key={b.id} className="flex-shrink-0 text-xs rounded-full px-3 py-1.5 border"
                  style={{ borderColor: "#D4AF37", color: "#B8962E", backgroundColor: "#FFFBF0", fontWeight: 600 }}>
                  {b.icono} {b.nombre}
                </span>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-slate-200 -mx-4 px-4">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-sm transition-all border-b-2 -mb-px ${
                  tab === t.id ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
                style={{ fontWeight: tab === t.id ? 700 : 500 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* ── PERFIL ── */}
        {tab === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 text-sm font-semibold mb-3">Sobre mí</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {perfil.bio || <span className="text-slate-400 italic">No ha agregado una descripción.</span>}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-900 text-sm font-semibold">Información</h3>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">{perfil.especialidad}</span>
                </div>
                {perfil.curso && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600">{perfil.curso}</span>
                  </div>
                )}
                {perfil.comuna && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600">{perfil.comuna}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className={perfil.validado ? "text-amber-700 font-semibold" : "text-slate-400"}>
                    {perfil.validado ? "Validado institucionalmente" : "Pendiente de validación"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── COMPETENCIAS ── */}
        {tab === "competencias" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {techSkills.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                    <Wrench className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-slate-900 text-sm font-semibold">Habilidades técnicas</h3>
                  <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{techSkills.length}</span>
                </div>
                <div className="space-y-4">
                  {techSkills.map((h) => <HabilidadRow key={h.id} h={h} />)}
                </div>
              </div>
            )}

            {softSkills.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-slate-900 text-sm font-semibold">Habilidades blandas</h3>
                  <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{softSkills.length}</span>
                </div>
                <div className="space-y-4">
                  {softSkills.map((h) => <HabilidadRow key={h.id} h={h} />)}
                </div>
              </div>
            )}

            {techSkills.length === 0 && softSkills.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <p className="text-slate-400 text-sm">No hay competencias registradas.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── PUBLICACIONES ── */}
        {tab === "publicaciones" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <PostList posts={posts} nombre={perfil.nombre} fotoSrc={fotoSrc} />
          </motion.div>
        )}

        {/* ── EVIDENCIAS ── */}
        {tab === "evidencias" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {perfil.evidencias && perfil.evidencias.length > 0 ? (
              perfil.evidencias.map((ev) => (
                <div key={ev.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {ev.imagen && (
                    <img src={ev.imagen} alt={ev.titulo} className="w-full max-h-64 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-900 text-sm font-semibold">{ev.titulo}</p>
                    </div>
                    {ev.descripcion && (
                      <p className="text-slate-500 text-sm leading-relaxed mt-1">{ev.descripcion}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <p className="text-slate-400 text-sm">No hay evidencias registradas.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
