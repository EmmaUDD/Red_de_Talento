import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  CalendarDays, Clock, MapPin, FileText, Send,
  CheckCircle, Image, X, ArrowLeft, Loader2, AlertCircle,
} from "lucide-react";
import { feedApi } from "@/api/api";

export function TeacherPublicarEvento() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titulo: "",
    fecha: "",
    hora: "",
    lugar: "",
    descripcion: "",
  });
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleQuitarImagen = () => {
    setImagen(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.descripcion) return;
    setPublishing(true);
    setError("");
    try {
      const partes: string[] = [];
      partes.push(`📅 ${form.titulo}`);
      if (form.fecha || form.hora) {
        const fechaStr = form.fecha
          ? new Date(form.fecha + "T00:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
          : "";
        const horaStr = form.hora ? `a las ${form.hora}` : "";
        partes.push(`🗓 ${[fechaStr, horaStr].filter(Boolean).join(" ")}`);
      }
      if (form.lugar) partes.push(`📍 ${form.lugar}`);
      partes.push(`\n${form.descripcion}`);
      const contenido = partes.join("\n");

      await feedApi.crearPost(contenido, "evento", imagen ?? undefined);
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
    setImagen(null);
    setPreview(null);
  };

  const canSubmit = form.titulo.trim() && form.descripcion.trim() && !publishing;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/inicio")} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Publicar evento</h1>
            <p className="text-slate-500 text-sm mt-0.5">El evento aparecerá en el feed de la comunidad</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-slate-900 text-lg mb-1" style={{ fontWeight: 700 }}>¡Evento publicado!</p>
              <p className="text-slate-500 text-sm mb-6">Ya aparece en el feed de la comunidad.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate("/inicio")}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-colors"
                  style={{ fontWeight: 500 }}>
                  Ir al feed
                </button>
                <button onClick={handleNuevoEvento}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-700 transition-colors"
                  style={{ fontWeight: 600 }}>
                  Publicar otro
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handlePublicar}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">

              {/* Título */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    Nombre del evento <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.titulo}
                    onChange={set("titulo")}
                    placeholder="ej. Feria de Empleos 2026, Charla de Seguridad Industrial..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {/* Fecha y hora */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Fecha
                    </label>
                    <input type="date" value={form.fecha} onChange={set("fecha")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Hora
                    </label>
                    <input type="time" value={form.hora} onChange={set("hora")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                  </div>
                </div>

                {/* Lugar */}
                <div>
                  <label className="flex items-center gap-1.5 text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Lugar
                  </label>
                  <input
                    value={form.lugar}
                    onChange={set("lugar")}
                    placeholder="ej. Sala de actos, Patio central, Instalaciones empresa X..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="flex items-center gap-1.5 text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={set("descripcion")}
                    rows={4}
                    placeholder="Describe el evento: de qué se trata, a quién va dirigido, qué deben traer..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="flex items-center gap-1.5 text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                    <Image className="w-3.5 h-3.5 text-slate-400" /> Imagen (opcional)
                  </label>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagen} />
                  {preview ? (
                    <div className="relative inline-block">
                      <img src={preview} alt="preview" className="max-h-48 rounded-xl border border-slate-200 object-cover" />
                      <button type="button" onClick={handleQuitarImagen}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-slate-400 hover:bg-slate-50 transition-colors">
                      <Image className="w-4 h-4" /> Subir imagen del evento
                    </button>
                  )}
                </div>
              </div>

              {/* Aviso */}
              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-500 text-xs leading-relaxed">
                  El evento aparecerá inmediatamente en el feed. Asegúrate de verificar la fecha y el lugar antes de publicar.
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              {/* Botón */}
              <button type="submit" disabled={!canSubmit}
                className={`w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${canSubmit ? "bg-slate-900 hover:bg-slate-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                style={{ fontWeight: 600 }}>
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {publishing ? "Publicando…" : "Publicar evento"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
