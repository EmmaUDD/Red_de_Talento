import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flag, AlertTriangle, CheckCircle, ChevronDown } from "lucide-react";

interface ReportModalProps {
  targetName: string;
  targetType: "empresa" | "usuario";
  onClose: () => void;
}

const motivosEmpresa = [
  "Oferta laboral fraudulenta",
  "Condiciones laborales abusivas",
  "Información falsa o engañosa",
  "Empresa sin RUT válido",
  "Acoso o conducta inapropiada",
  "Otro motivo",
];

const motivosUsuario = [
  "Suplantación de identidad",
  "Información falsa en perfil",
  "Conducta inapropiada",
  "Spam o publicidad no autorizada",
  "Acoso o intimidación",
  "Otro motivo",
];

export function ReportModal({ targetName, targetType, onClose }: ReportModalProps) {
  const [motivo, setMotivo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [sent, setSent] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);

  const motivos = targetType === "empresa" ? motivosEmpresa : motivosUsuario;
  const canSubmit = motivo && descripcion.trim().length > 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(onClose, 2200);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <Flag className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h2 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>
                  Reportar {targetType === "empresa" ? "empresa" : "usuario"}
                </h2>
                <p className="text-slate-500 text-xs">{targetName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {sent ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Reporte enviado</p>
              <p className="text-slate-500 text-xs mt-1">El equipo del Liceo revisará el caso y tomará las medidas correspondientes.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700 text-xs leading-relaxed">
                  Los reportes son confidenciales y serán revisados por los docentes del Liceo Cardenal Caro. No uses esta función para reportes falsos.
                </p>
              </div>

              {/* Motivo custom select */}
              <div>
                <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                  Motivo del reporte <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenSelect(!openSelect)}
                    className={`w-full flex items-center justify-between bg-slate-50 border rounded-lg px-3 py-2.5 text-sm transition-colors ${openSelect ? "border-slate-400 ring-2 ring-slate-200" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <span className={motivo ? "text-slate-900" : "text-slate-400"}>
                      {motivo || "Selecciona un motivo..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSelect ? "rotate-180" : ""}`} />
                  </button>
                  {openSelect && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 mt-1">
                      {motivos.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => { setMotivo(m); setOpenSelect(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${motivo === m ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
                          style={{ fontWeight: motivo === m ? 600 : 400 }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                  Descripción de los hechos <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={4}
                  placeholder="Describe con detalle los hechos que estás reportando. Incluye fechas, comunicaciones o cualquier evidencia relevante..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent placeholder:text-slate-400 transition-all"
                />
                <p className="text-slate-400 text-xs mt-1">{descripcion.length} caracteres (mínimo 10)</p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${canSubmit ? "bg-red-500 hover:bg-red-600 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                  style={{ fontWeight: 600 }}
                >
                  <Flag className="w-3.5 h-3.5" />
                  Enviar reporte
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
