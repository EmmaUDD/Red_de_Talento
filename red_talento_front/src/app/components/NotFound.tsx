import { useNavigate } from "react-router";
import { Home, AlertCircle } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-slate-900 text-2xl mb-2" style={{ fontWeight: 800 }}>404</h1>
        <p className="text-slate-500 text-sm mb-6">Esta página no existe</p>
        <button
          onClick={() => navigate("/inicio")}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-700 transition-colors mx-auto"
          style={{ fontWeight: 600 }}
        >
          <Home className="w-4 h-4" />
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
