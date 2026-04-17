import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  BookOpen, Award, MapPin, ArrowLeft, Loader2,
  ShieldCheck, Mail, Clock, GraduationCap,
} from "lucide-react";
import { perfilApi, feedApi } from "@/api/api";
import type { DocenteResult, FeedPost } from "@/app/types";
import { PostList } from "./PostList";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export function VistaDocente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<DocenteResult | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"publicaciones" | "perfil" | "info">("publicaciones");

  useEffect(() => {
    if (!id) return;
    perfilApi.getDocente(Number(id))
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

  const foto = perfil.foto_url ?? perfil.foto_perfil;
  const fotoSrc = foto ? (foto.startsWith("http") ? foto : `${BASE_URL}${foto}`) : null;

  const nivelLabel: Record<string, string> = {
    junior: "Junior",
    intermedio: "Intermedio",
    senior: "Senior",
    experto: "Experto",
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200">
        {/* Cover */}
        <div className="relative h-36 md:h-44 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1758685734511-4f49ce9a382b?w=1200&h=300&fit=crop&auto=format"
            className="w-full h-full object-cover"
            alt="cover docente"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/60" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-3 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-slate-700 hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Volver</span>
          </button>
          <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span className="text-slate-900 text-xs font-semibold">Docente Verificado</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-0">
          <div className="flex items-end gap-4 -mt-10 mb-4 relative z-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-700 flex items-center justify-center">
                {fotoSrc ? (
                  <img src={fotoSrc} className="w-full h-full object-cover" alt={perfil.nombre} />
                ) : (
                  <span className="text-white text-2xl font-bold">{perfil.nombre.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white shadow z-10" style={{ backgroundColor: "#D4AF37" }}>
                <Award className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="flex-1 pb-1">
              <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.2 }}>
                Prof. {perfil.nombre}
              </h1>
              {perfil.departamento && (
                <p className="text-slate-600 text-sm mt-0.5 flex items-center gap-1" style={{ fontWeight: 500 }}>
                  <BookOpen className="w-3.5 h-3.5" /> {perfil.departamento}
                </p>
              )}
              <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Liceo Cardenal Caro · Lo Espejo
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Nivel", value: perfil.nivel ? (nivelLabel[perfil.nivel] ?? perfil.nivel) : "—" },
              { label: "Institución", value: "Liceo Caro" },
              { label: "Lo Espejo", value: "📍" },
            ].map((k) => (
              <div key={k.label} className="text-center py-2">
                <p className="text-slate-900 font-bold text-base leading-tight">{k.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 -mx-4 px-4">
            {([
              { id: "publicaciones", label: "Publicaciones" },
              { id: "perfil", label: "Perfil" },
              { id: "info", label: "Información" },
            ] as { id: "publicaciones" | "perfil" | "info"; label: string }[]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-sm border-b-2 -mb-px transition-all ${tab === t.id ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                style={{ fontWeight: tab === t.id ? 700 : 500 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">
        {tab === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 text-sm font-bold mb-3">Sobre el docente</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {perfil.bio || "Docente con amplia experiencia en formación técnico-profesional. Comprometido con la empleabilidad real de los estudiantes del Liceo Cardenal Caro."}
              </p>
              {perfil.departamento && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                    {perfil.departamento}
                  </span>
                  <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                    Docente Verificado
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === "publicaciones" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PostList posts={posts} nombre={`Prof. ${perfil.nombre}`} fotoSrc={fotoSrc} />
          </motion.div>
        )}

        {tab === "info" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-slate-900 text-sm font-bold mb-4">Información institucional</h3>
              <div className="space-y-3">
                {perfil.departamento && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span>{perfil.departamento}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span>Liceo Cardenal Caro, Lo Espejo, RM</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span>Disponible: Lun–Vie · 08:00–18:00 hrs</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span>docente@liceocaro.cl</span>
                </div>
                {perfil.nivel && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span>Nivel: <strong>{nivelLabel[perfil.nivel] ?? perfil.nivel}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
