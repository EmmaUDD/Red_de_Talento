import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Building2, MapPin, Briefcase, CheckCircle,
  ArrowLeft, Loader2, Globe,
} from "lucide-react";
import { perfilApi, ofertasApi, feedApi } from "@/api/api";
import type { EmpresaResult, OfertaLaboral, FeedPost } from "@/app/types";
import { PostList } from "./PostList";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export function VistaEmpresa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<EmpresaResult | null>(null);
  const [ofertas, setOfertas] = useState<OfertaLaboral[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"publicaciones" | "perfil" | "empleos">("publicaciones");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      perfilApi.getEmpresa(Number(id)),
      ofertasApi.getAll().then(r => r.results).catch(() => [] as OfertaLaboral[]),
    ]).then(([p, all]) => {
      setPerfil(p);
      setOfertas(all.filter((o) => o.empresa_id === Number(id) && o.activa));
      if (p.usuario_id) {
        feedApi.getPostsDeUsuario(p.usuario_id).then(setPosts).catch(() => {});
      }
    }).catch(() => setPerfil(null))
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
        <p className="text-slate-500 text-sm">Empresa no encontrada.</p>
        <button onClick={() => navigate(-1)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver
        </button>
      </div>
    );
  }

  const foto = perfil.foto_url ?? perfil.foto_perfil;
  const fotoSrc = foto ? (foto.startsWith("http") ? foto : `${BASE_URL}${foto}`) : null;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-slate-200">
        {/* Cover */}
        <div className="relative h-36 md:h-44 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1565010640914-8d817b58d808?w=1200&h=300&fit=crop&auto=format"
            className="w-full h-full object-cover" alt="cover empresa"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/55" />
          <button onClick={() => navigate(-1)}
            className="absolute top-3 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-slate-700 hover:bg-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Volver</span>
          </button>
          <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-slate-900 text-xs font-semibold">Empresa Aliada</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-0">
          <div className="flex items-end gap-4 -mt-10 mb-4 relative z-10">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                {fotoSrc ? (
                  <img src={fotoSrc} className="w-full h-full object-cover" alt={perfil.nombre_empresa} />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white shadow bg-blue-500 z-10">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="flex-1 pb-1">
              <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.2 }}>
                {perfil.nombre_empresa}
              </h1>
              <p className="text-slate-600 text-sm mt-0.5 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> {perfil.industria}
              </p>
              <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Lo Espejo, Región Metropolitana
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Empleos activos", value: ofertas.length.toString() },
              { label: "Aliado Liceo", value: "✓", gold: true },
              { label: "Lo Espejo", value: "📍" },
            ].map((k) => (
              <div key={k.label} className="text-center py-2">
                <p className="text-slate-900 font-bold text-xl" style={{ color: k.gold ? "#D4AF37" : undefined }}>
                  {k.value}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 -mx-4 px-4">
            {([
              { id: "publicaciones", label: "Publicaciones" },
              { id: "perfil", label: "Perfil" },
              { id: "empleos", label: `Empleos (${ofertas.length})` },
            ] as { id: "publicaciones" | "perfil" | "empleos"; label: string }[]).map((t) => (
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
              <h3 className="text-slate-900 text-sm font-bold mb-3">Sobre la empresa</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {perfil.descripcion || "Empresa aliada del Liceo Cardenal Caro comprometida con la inserción laboral técnica."}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                  {perfil.industria}
                </span>
              </div>
            </div>

            {perfil.sitio_web && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-slate-900 text-sm font-bold mb-2">Sitio web</h3>
                <a href={perfil.sitio_web} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 text-sm hover:underline">
                  <Globe className="w-4 h-4" /> {perfil.sitio_web}
                </a>
              </div>
            )}
          </motion.div>
        )}

        {tab === "publicaciones" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PostList posts={posts} nombre={perfil.nombre_empresa} fotoSrc={fotoSrc} />
          </motion.div>
        )}

        {tab === "empleos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {ofertas.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <p className="text-slate-400 text-sm">No hay empleos activos.</p>
              </div>
            ) : (
              ofertas.map((o) => (
                <div key={o.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-slate-900 text-sm font-semibold">{o.titulo}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {o.tipo && (
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                        {o.tipo}
                      </span>
                    )}
                    {o.modalidad && (
                      <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                        {o.modalidad}
                      </span>
                    )}
                    {o.ubicacion && (
                      <span className="text-xs text-slate-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {o.ubicacion}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2">{o.descripcion}</p>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
