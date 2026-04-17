import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Award, GraduationCap, Building2, BookOpen,
  Eye, EyeOff, ArrowRight, Shield, Loader2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate("/inicio");
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      if (e.detail) {
        setError(e.detail as string);
      } else {
        setError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 bg-slate-900 text-white">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Award className="w-6 h-6" style={{ color: "#D4AF37" }} />
          </div>
          <div>
            <p className="text-white font-extrabold" style={{ fontSize: "1.2rem", lineHeight: 1 }}>
              Red Talento <span style={{ color: "#D4AF37" }}>Caro</span>
            </p>
            <p className="text-white/40 text-xs mt-0.5">Liceo Cardenal Caro · Lo Espejo</p>
          </div>
        </div>

        <h1 className="text-white font-extrabold mb-4" style={{ fontSize: "2.25rem", lineHeight: 1.15 }}>
          Tu oficio tiene<br />
          <span style={{ color: "#D4AF37" }}>valor real.</span>
        </h1>
        <p className="text-white/60 mb-10 max-w-md text-sm leading-relaxed">
          La plataforma que conecta el talento técnico validado del Liceo Cardenal Caro
          con empleadores locales. Construye tu red profesional con respaldo institucional.
        </p>

        <div className="space-y-3 max-w-sm">
          {[
            "Perfil validado institucionalmente",
            "Insignias por competencias reales",
            "Acceso directo a empleos locales",
            "Datos y privacidad protegidos",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 text-white/70 text-sm">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#D4AF37" }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 px-6 pt-6">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Award className="w-4 h-4" style={{ color: "#D4AF37" }} />
            </div>
            <span className="text-slate-900 text-sm font-bold">
              Red Talento <span style={{ color: "#D4AF37" }}>Caro</span>
            </span>
          </div>

          <div className="p-6">
            <h2 className="text-slate-900 font-bold mb-0.5">Bienvenido/a</h2>
            <p className="text-slate-500 text-sm mb-6">Ingresa con tu cuenta institucional</p>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3 mb-5">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tu_usuario"
                  autoComplete="username"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Shield className="w-3 h-3" />
                Acceso gestionado por el Liceo Cardenal Caro
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</>
                ) : (
                  <>Ingresar <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 text-xs">tipos de cuenta</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: GraduationCap, label: "Estudiante", color: "text-blue-600 bg-blue-50" },
                { icon: BookOpen, label: "Docente", color: "text-green-600 bg-green-50" },
                { icon: Building2, label: "Empresa", color: "text-amber-600 bg-amber-50" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${color}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-slate-500 text-xs">
              ¿Sin cuenta?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-slate-900 font-semibold hover:underline"
              >
                Solicitar acceso
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
