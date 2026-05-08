import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  MapPin, Briefcase, CheckCircle,
  ArrowLeft, Loader2, Globe, Clock, Send, Mail,
} from "lucide-react";
import { perfilApi, ofertasApi, feedApi } from "@/api/api";
import type { EmpresaResult, OfertaLaboral, FeedPost } from "@/app/types";
import { PostList } from "./PostList";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const FONT_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const tipoStyle: Record<string, React.CSSProperties> = {
  "Part-time": { backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 20, fontSize: 11, padding: "2px 9px", fontWeight: 700 },
  "Full-time": { backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 20, fontSize: 11, padding: "2px 9px", fontWeight: 700 },
  "Práctica": { backgroundColor: "#fdf4ff", color: "#7e22ce", border: "1px solid #e9d5ff", borderRadius: 20, fontSize: 11, padding: "2px 9px", fontWeight: 700 },
};

const modalidadStyle: Record<string, React.CSSProperties> = {
  "Presencial": { backgroundColor: "#F6F5F0", color: "#4A3F35", border: "1px solid #E8E4DC", borderRadius: 20, fontSize: 11, padding: "2px 9px", fontWeight: 600 },
  "Híbrido":    { backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: 20, fontSize: 11, padding: "2px 9px", fontWeight: 600 },
  "Remoto":     { backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", borderRadius: 20, fontSize: 11, padding: "2px 9px", fontWeight: 600 },
};

export function VistaEmpresa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<EmpresaResult | null>(null);
  const [ofertas, setOfertas] = useState<OfertaLaboral[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"publicaciones" | "perfil" | "empleos">("publicaciones");

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

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
      <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: "#D4AF37" }} />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "#8C7B6B" }}>Empresa no encontrada.</p>
        <button
          onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "#A8998A", background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Volver
        </button>
      </div>
    );
  }

  const foto = perfil.foto_url ?? perfil.foto_perfil;
  const fotoSrc = foto ? (foto.startsWith("http") ? foto : `${BASE_URL}${foto}`) : null;

  const tabs: { id: "publicaciones" | "perfil" | "empleos"; label: string }[] = [
    { id: "publicaciones", label: "Publicaciones" },
    { id: "perfil", label: "Perfil" },
    { id: "empleos", label: `Empleos (${ofertas.length})` },
  ];

  const kpis = [
    { label: "Empleos activos", value: ofertas.length.toString() },
    { label: "Aliado Liceo", value: "✓" },
    { label: "Lo Espejo", value: "📍" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DC" }}>

        {/* Cover — full width, diagonal stripes (empresa texture) */}
        <div style={{
          height: 160,
          backgroundColor: "#0d1b35",
          backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 14px)",
          position: "relative",
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: 14,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.75)",
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "5px 12px",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <ArrowLeft style={{ width: 13, height: 13 }} /> Volver
          </button>

          <div style={{
            position: "absolute",
            top: 14,
            right: 20,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            backgroundColor: "rgba(212,175,55,0.15)",
            border: "1px solid rgba(212,175,55,0.4)",
            borderRadius: 20,
            padding: "4px 12px",
          }}>
            <CheckCircle style={{ width: 13, height: 13, color: "#D4AF37" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#D4AF37" }}>Empresa Aliada</span>
          </div>
        </div>

        {/* Identity + tabs — centered container */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* Avatar + name — overlaps cover */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: -44 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 96,
                height: 96,
                borderRadius: 18,
                border: "4px solid #FFFFFF",
                overflow: "hidden",
                backgroundColor: "#0d1b35",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {fotoSrc ? (
                  <img src={fotoSrc} alt={perfil.nombre_empresa} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: "#D4AF37" }}>
                    {perfil.nombre_empresa.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{
                position: "absolute", bottom: -4, right: -4,
                width: 26, height: 26, borderRadius: "50%",
                backgroundColor: "#D4AF37", border: "3px solid #FFFFFF",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
              }}>
                <CheckCircle style={{ width: 14, height: 14, color: "#FFFFFF" }} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingBottom: 12, paddingTop: 48 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.5rem", fontWeight: 700, color: "#0d1b35",
                margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {perfil.nombre_empresa}
              </h1>
              <p style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.92rem", color: "#6B5D52", fontWeight: 600, margin: "3px 0 0" }}>
                <Briefcase style={{ width: 13, height: 13 }} />
                {perfil.industria}
              </p>
              <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem", color: "#A8998A", margin: "2px 0 0" }}>
                <MapPin style={{ width: 12, height: 12 }} />
                Lo Espejo, Región Metropolitana
              </p>
            </div>
          </div>

          {/* KPI row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            margin: "16px 0 0",
            backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 12,
          }}>
            {kpis.map((k, i) => (
              <div key={k.label} style={{
                textAlign: "center", padding: "12px 8px",
                borderRight: i < 2 ? "1px solid #E8E4DC" : "none",
              }}>
                <p style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "0.95rem", fontWeight: 700,
                  color: i === 1 ? "#D4AF37" : "#0d1b35",
                  margin: 0, lineHeight: 1.2,
                }}>
                  {k.value}
                </p>
                <p style={{ fontSize: "0.72rem", color: "#8C7B6B", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {k.label}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #E8E4DC", marginTop: 16 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, padding: "10px 4px",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: 600,
                  color: tab === t.id ? "#0d1b35" : "#94a3b8",
                  borderBottom: tab === t.id ? "2px solid #D4AF37" : "2px solid transparent",
                  marginBottom: -2,
                  transition: "color 0.15s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 768, margin: "0 auto", padding: "20px 16px" }}>

        {/* Publicaciones */}
        {tab === "publicaciones" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PostList posts={posts} nombre={perfil.nombre_empresa} fotoSrc={fotoSrc} />
          </motion.div>
        )}

        {/* Perfil */}
        {tab === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 20 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Sobre la empresa
              </p>
              <p style={{ fontSize: "0.92rem", color: "#4A3F35", lineHeight: 1.7, margin: 0 }}>
                {perfil.descripcion || "Empresa aliada del Liceo Cardenal Caro comprometida con la inserción laboral técnica."}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "5px 14px",
                  borderRadius: 20, backgroundColor: "#F0EDE8", border: "1px solid #E8E4DC", color: "#4A3F35",
                }}>
                  {perfil.industria}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "5px 14px",
                  borderRadius: 20, backgroundColor: "#FFFBF0", border: "1px solid #D4AF37", color: "#B8962E",
                }}>
                  ✓ Empresa Aliada
                </span>
              </div>
            </div>

            {(perfil.sitio_web || perfil.email) && (
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 20 }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Contacto
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {perfil.email && (
                    <a
                      href={`mailto:${perfil.email}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                        borderRadius: 10, border: "1px solid #E8E4DC", backgroundColor: "#F6F5F0",
                        color: "#0d1b35", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Mail style={{ width: 13, height: 13, color: "#D4AF37" }} />
                      </div>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {perfil.email}
                      </span>
                    </a>
                  )}
                  {perfil.sitio_web && (
                    <a
                      href={perfil.sitio_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                        borderRadius: 10, border: "1px solid #E8E4DC", backgroundColor: "#F6F5F0",
                        color: "#0d1b35", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Globe style={{ width: 13, height: 13, color: "#8C7B6B" }} />
                      </div>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {perfil.sitio_web}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empleos */}
        {tab === "empleos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ofertas.length === 0 ? (
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 48, textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Briefcase style={{ width: 22, height: 22, color: "#C0B09A" }} />
                </div>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>Sin empleos activos</p>
                <p style={{ fontSize: "0.82rem", color: "#A8998A", marginTop: 4 }}>Esta empresa no tiene ofertas disponibles en este momento.</p>
              </div>
            ) : (
              ofertas.map((o, i) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E4DC", borderRadius: 14, padding: 18, borderLeft: `3.5px solid ${o.tipo === "Full-time" ? "#10b981" : o.tipo === "Práctica" ? "#8b5cf6" : "#3b82f6"}` }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                    <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>{o.titulo}</p>
                    {o.salario && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "3px 10px", flexShrink: 0 }}>
                        ${Number(o.salario).toLocaleString("es-CL")}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {o.tipo && <span style={tipoStyle[o.tipo] ?? tipoStyle["Part-time"]}>{o.tipo}</span>}
                    {o.modalidad && <span style={modalidadStyle[o.modalidad] ?? modalidadStyle["Presencial"]}>{o.modalidad}</span>}
                    {o.ubicacion && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8C7B6B" }}>
                        <MapPin style={{ width: 11, height: 11 }} /> {o.ubicacion}
                      </span>
                    )}
                    {o.especialidad && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8C7B6B" }}>
                        <Briefcase style={{ width: 11, height: 11 }} /> {o.especialidad}
                      </span>
                    )}
                  </div>

                  {o.descripcion && (
                    <p style={{ fontSize: "0.82rem", color: "#6B5D52", lineHeight: 1.55, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                      {o.descripcion}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#A8998A" }}>
                      <Clock style={{ width: 11, height: 11 }} />
                      {new Date(o.fecha_publicacion).toLocaleDateString("es-CL")}
                    </span>
                    <button style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 16px", borderRadius: 8,
                      backgroundColor: "#0d1b35", border: "none",
                      color: "#FFFFFF", fontSize: "0.78rem", fontWeight: 700,
                      cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      <Send style={{ width: 12, height: 12 }} /> Postular
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
