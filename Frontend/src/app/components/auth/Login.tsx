import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Award, GraduationCap, Building2, BookOpen,
  Eye, EyeOff, ArrowRight, Shield,
} from "lucide-react";
import { useState } from "react";
import { useUser, demoUsers, Role, mapBackendRole, AppUser } from "../../context/UserContext";
import { login } from "../../../api/client";

const demoAccess = [
  {
    role: "student" as Role,
    icon: GraduationCap,
    label: "Estudiante",
    desc: "Felipe Muñoz · 4° Medio TP",
  },
  {
    role: "teacher" as Role,
    icon: BookOpen,
    label: "Docente",
    desc: "Prof. Ana García · Administración",
  },
  {
    role: "company" as Role,
    icon: Building2,
    label: "Empresa",
    desc: "Eléctrica Cordillera SpA",
  },
];

export function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDemo = (role: Role) => {
    setUser(demoUsers[role]);
    navigate("/inicio");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, pass);
      // data contiene: access, refresh, role, user_id, first_name, last_name
      const frontendRole = mapBackendRole(data.role);
      const appUser: AppUser = {
        id: String(data.user_id),
        name: `${data.first_name} ${data.last_name}`.trim() || email,
        role: frontendRole,
        avatar: "",
      };
      setUser(appUser);
      navigate("/inicio");
    } catch (err) {
      setError("Correo o contraseña incorrectos. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Left panel — visible on desktop */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 bg-slate-900 text-white">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Award className="w-6 h-6" style={{ color: "#D4AF37" }} />
          </div>
          <div>
            <p className="text-white" style={{ fontWeight: 800, fontSize: "1.2rem", lineHeight: 1 }}>
              Red Talento <span style={{ color: "#D4AF37" }}>Caro</span>
            </p>
            <p className="text-white/40 text-xs mt-0.5">Liceo Cardenal Caro · Lo Espejo</p>
          </div>
        </div>

        <h1 className="text-white mb-4" style={{ fontWeight: 800, fontSize: "2.25rem", lineHeight: 1.15 }}>
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

      {/* Right panel — login */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 px-6 pt-6">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Award className="w-4 h-4" style={{ color: "#D4AF37" }} />
            </div>
            <span className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>
              Red Talento <span style={{ color: "#D4AF37" }}>Caro</span>
            </span>
          </div>

          <div className="p-6">
            <h2 className="text-slate-900 mb-0.5" style={{ fontWeight: 700 }}>Bienvenido/a</h2>
            <p className="text-slate-500 text-sm mb-6">Ingresa con tu cuenta institucional</p>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3 mb-5">
              <div>
                <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Correo institucional</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario o correo"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="Tu contraseña"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
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

              {/* Error message */}
              {error && (
                <p className="text-red-500 text-xs">{error}</p>
              )}

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Shield className="w-3 h-3" />
                Acceso gestionado por el Liceo Cardenal Caro
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                style={{ fontWeight: 600 }}
              >
                {loading ? "Ingresando..." : <> Ingresar <ArrowRight className="w-4 h-4" /> </>}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 text-xs">acceso demo</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Demo buttons */}
            <div className="space-y-2">
              {demoAccess.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.role}
                    onClick={() => handleDemo(d.role)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{d.label}</p>
                      <p className="text-slate-500 text-xs">{d.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>
                );
              })}
            </div>

            <p className="text-center text-slate-500 text-xs mt-5">
              ¿Sin cuenta?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-slate-900 hover:underline"
                style={{ fontWeight: 600 }}
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