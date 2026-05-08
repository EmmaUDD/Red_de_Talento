import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  CalendarDays, Clock, MapPin, FileText, Send,
  CheckCircle, Image, X, ArrowLeft, AlertCircle,
} from "lucide-react";
import { feedApi } from "@/api/api";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const S = {
  label: {
    fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0,
  } as React.CSSProperties,
  input: {
    backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", borderRadius: 10,
    padding: "9px 13px", fontSize: "0.85rem",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: "none", width: "100%", boxSizing: "border-box" as const,
    color: "#0d1b35", transition: "border-color 0.15s, background-color 0.15s",
  } as React.CSSProperties,
};

const focusGold = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "#D4AF37";
  e.currentTarget.style.backgroundColor = "#FFFFFF";
};
const blurGold = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "#E8E4DC";
  e.currentTarget.style.backgroundColor = "#F6F5F0";
};

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div
      className="animate-spin"
      style={{
        width: size, height: size, borderRadius: "50%",
        border: "2.5px solid #E8E4DC", borderTopColor: "#D4AF37", flexShrink: 0,
      }}
    />
  );
}

function FieldLabel({ icon: Icon, text, required }: { icon: React.ElementType; text: string; required?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon style={{ width: 11, height: 11, color: "#8C7B6B" }} />
      </div>
      <span style={{ ...S.label }}>
        {text}{required && <span style={{ color: "#D4AF37", marginLeft: 2 }}>*</span>}
      </span>
    </div>
  );
}

function EventPreview({ titulo, fecha, hora, lugar, descripcion, preview }: {
  titulo: string; fecha: string; hora: string; lugar: string; descripcion: string; preview: string | null;
}) {
  const fechaFmt = fecha
    ? new Date(fecha + "T00:00:00").toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })
    : null;
  const horaFmt = hora ? `a las ${hora}` : null;
  const datetime = [fechaFmt, horaFmt].filter(Boolean).join(" ");
  const hasContent = titulo || datetime || lugar || descripcion;

  return (
    <div style={{ backgroundColor: "white", border: "1px solid #E8E4DC", borderRadius: 14, overflow: "hidden", borderLeftWidth: 3, borderLeftColor: "#7c3aed" }}>
      <div style={{ ...S.label, padding: "8px 14px", borderBottom: "1px solid #F0EDE8", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#7c3aed" }} />
        Vista previa del evento
      </div>

      {!hasContent ? (
        <div style={{ padding: "20px 16px", textAlign: "center" }}>
          <p style={{ margin: 0, color: "#C4BDB5", fontSize: "0.78rem" }}>Completa los campos para ver la previsualización</p>
        </div>
      ) : (
        <>
          <div style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CalendarDays style={{ width: 13, height: 13, color: "white" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>EVENTO</p>
              <p style={{ color: "white", fontSize: "0.82rem", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {titulo || <span style={{ opacity: 0.4 }}>Nombre del evento</span>}
              </p>
            </div>
          </div>

          {(datetime || lugar) && (
            <div style={{ backgroundColor: "#F5F3FF", padding: "7px 14px", display: "flex", flexWrap: "wrap", gap: "4px 12px", borderTop: "1px solid #ede9fe" }}>
              {datetime && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6d28d9", fontSize: "0.7rem", fontWeight: 500 }}>
                  <Clock style={{ width: 10, height: 10 }} />{datetime}
                </span>
              )}
              {lugar && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6d28d9", fontSize: "0.7rem", fontWeight: 500 }}>
                  <MapPin style={{ width: 10, height: 10 }} />{lugar}
                </span>
              )}
            </div>
          )}

          {descripcion && (
            <div style={{ padding: "9px 14px" }}>
              <p style={{ margin: 0, color: "#475569", fontSize: "0.78rem", lineHeight: 1.6 }}>
                {descripcion.length > 120 ? descripcion.slice(0, 120) + "…" : descripcion}
              </p>
            </div>
          )}

          {preview && (
            <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block", borderTop: "1px solid #F0EDE8" }} />
          )}
        </>
      )}
    </div>
  );
}

export function TeacherPublicarEvento() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ titulo: "", fecha: "", hora: "", lugar: "", descripcion: "" });
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.href = FONT_URL; link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleQuitarImagen = () => {
    setImagen(null); setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.descripcion) return;
    setPublishing(true); setError("");
    try {
      const partes: string[] = [`📅 ${form.titulo}`];
      if (form.fecha || form.hora) {
        const fechaStr = form.fecha
          ? new Date(form.fecha + "T00:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
          : "";
        const horaStr = form.hora ? `a las ${form.hora}` : "";
        partes.push(`🗓 ${[fechaStr, horaStr].filter(Boolean).join(" ")}`);
      }
      if (form.lugar) partes.push(`📍 ${form.lugar}`);
      partes.push(`\n${form.descripcion}`);
      await feedApi.crearPost(partes.join("\n"), "evento", imagen ?? undefined);
      setSuccess(true);
    } catch {
      setError("Ocurrió un error al publicar. Intenta de nuevo.");
    } finally {
      setPublishing(false);
    }
  };

  const handleNuevoEvento = () => {
    setSuccess(false);
    setForm({ titulo: "", fecha: "", hora: "", lugar: "", descripcion: "" });
    setImagen(null); setPreview(null);
  };

  const canSubmit = form.titulo.trim() && form.descripcion.trim() && !publishing;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{
        backgroundColor: "#0d1b35",
        backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.15) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
        borderBottom: "3px solid #D4AF37",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/inicio")}
            style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <ArrowLeft style={{ width: 15, height: 15, color: "rgba(255,255,255,0.7)" }} />
          </button>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #5b21b6, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CalendarDays style={{ width: 15, height: 15, color: "white" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: "1.1rem", color: "white", lineHeight: 1.2 }}>
              Publicar evento
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", marginTop: 1 }}>
              Aparecerá en el feed de toda la comunidad
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        <AnimatePresence mode="wait">

          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ backgroundColor: "white", border: "1px solid #E8E4DC", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}
            >
              <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#F0FDF4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle style={{ width: 24, height: 24, color: "#16a34a" }} />
              </div>
              <h2 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", fontWeight: 800, color: "#0d1b35" }}>
                ¡Evento publicado!
              </h2>
              <p style={{ margin: "0 0 24px", color: "#8C7B6B", fontSize: "0.85rem" }}>
                Ya aparece en el feed de la comunidad.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/inicio")}
                  style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid #E8E4DC", backgroundColor: "white", color: "#0d1b35", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Ir al feed
                </button>
                <button
                  onClick={handleNuevoEvento}
                  style={{ padding: "9px 20px", borderRadius: 10, border: "none", backgroundColor: "#0d1b35", color: "white", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Publicar otro
                </button>
              </div>
            </motion.div>

          ) : (

            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}
              className="grid"
            >
              <form onSubmit={handlePublicar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                <div style={{ backgroundColor: "white", border: "1px solid #E8E4DC", borderRadius: 16, padding: "18px 18px", display: "flex", flexDirection: "column", gap: 16 }}>

                  <div>
                    <FieldLabel icon={CalendarDays} text="Nombre del evento" required />
                    <input
                      value={form.titulo}
                      onChange={set("titulo")}
                      placeholder="ej. Feria de Empleos 2026, Charla de Seguridad Industrial…"
                      style={S.input}
                      onFocus={focusGold}
                      onBlur={blurGold}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <FieldLabel icon={CalendarDays} text="Fecha" />
                      <input
                        type="date"
                        value={form.fecha}
                        onChange={set("fecha")}
                        style={S.input}
                        onFocus={focusGold}
                        onBlur={blurGold}
                      />
                    </div>
                    <div>
                      <FieldLabel icon={Clock} text="Hora" />
                      <input
                        type="time"
                        value={form.hora}
                        onChange={set("hora")}
                        style={S.input}
                        onFocus={focusGold}
                        onBlur={blurGold}
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel icon={MapPin} text="Lugar" />
                    <input
                      value={form.lugar}
                      onChange={set("lugar")}
                      placeholder="ej. Sala de actos, Patio central, Instalaciones empresa X…"
                      style={S.input}
                      onFocus={focusGold}
                      onBlur={blurGold}
                    />
                  </div>

                  <div>
                    <FieldLabel icon={FileText} text="Descripción" required />
                    <textarea
                      value={form.descripcion}
                      onChange={set("descripcion")}
                      rows={4}
                      placeholder="Describe el evento: de qué se trata, a quién va dirigido, qué deben traer…"
                      style={{ ...S.input, resize: "none" as const }}
                      onFocus={focusGold}
                      onBlur={blurGold}
                    />
                  </div>

                  <div>
                    <FieldLabel icon={Image} text="Imagen del evento (opcional)" />
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImagen} />
                    {preview ? (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <img src={preview} alt="preview" style={{ maxHeight: 160, borderRadius: 10, border: "1px solid #E8E4DC", objectFit: "cover", display: "block" }} />
                        <button
                          type="button"
                          onClick={handleQuitarImagen}
                          style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", backgroundColor: "rgba(13,27,53,0.75)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <X style={{ width: 11, height: 11 }} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1.5px dashed #D4C99A", backgroundColor: "#FDFCF7", color: "#8C7B6B", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "border-color 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#D4AF37"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#D4C99A"}
                      >
                        <Image style={{ width: 13, height: 13 }} />
                        Subir imagen del evento
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, backgroundColor: "#FFFBF0", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 14px" }}>
                  <AlertCircle style={{ width: 13, height: 13, color: "#b45309", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ margin: 0, color: "#92400e", fontSize: "0.75rem", lineHeight: 1.6 }}>
                    El evento aparecerá inmediatamente en el feed. Verifica la fecha y el lugar antes de publicar.
                  </p>
                </div>

                {error && (
                  <p style={{ margin: 0, color: "#ef4444", fontSize: "0.8rem", textAlign: "center" }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 12, border: "none",
                    backgroundColor: canSubmit ? "#0d1b35" : "#E8E4DC",
                    color: canSubmit ? "white" : "#94a3b8",
                    fontSize: "0.875rem", fontWeight: 700,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "background-color 0.15s",
                  }}
                >
                  {publishing ? <Spinner size={15} /> : <Send style={{ width: 14, height: 14 }} />}
                  {publishing ? "Publicando…" : "Publicar evento"}
                </button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "sticky", top: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: "#F6F5F0", border: "1px solid #E8E4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CalendarDays style={{ width: 10, height: 10, color: "#8C7B6B" }} />
                  </div>
                  <p style={{ ...S.label }}>Vista previa en el feed</p>
                </div>
                <EventPreview
                  titulo={form.titulo}
                  fecha={form.fecha}
                  hora={form.hora}
                  lugar={form.lugar}
                  descripcion={form.descripcion}
                  preview={preview}
                />
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
