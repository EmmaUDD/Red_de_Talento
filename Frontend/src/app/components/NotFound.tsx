import { useNavigate } from "react-router";
import { Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <p className="text-slate-200 mb-3" style={{ fontSize: "5rem", fontWeight: 800, lineHeight: 1 }}>404</p>
      <h1 className="text-slate-700 mb-2" style={{ fontWeight: 700 }}>Página no encontrada</h1>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">La sección que buscas no existe o fue movida a otro lugar.</p>
      <button
        onClick={() => navigate("/inicio")}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
        style={{ fontWeight: 600 }}
      >
        <Home className="w-4 h-4" />
        Volver al inicio
      </button>
    </div>
  );
}
