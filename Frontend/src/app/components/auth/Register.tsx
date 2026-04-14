import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Award, GraduationCap, Building2, BookOpen, ArrowLeft,
  ChevronRight, Eye, EyeOff, CheckCircle, ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { Role } from "../../context/UserContext";
import { apiRequest } from "../../../api/client";
 
const roles = [
  {
    id: "student" as Role,
    icon: GraduationCap,
    label: "Estudiante / Egresado",
    desc: "4° Medio TP, EPJA o exalumno del Liceo Cardenal Caro",
    requiresApproval: true,
  },
  {
    id: "company" as Role,
    icon: Building2,
    label: "Empresa",
    desc: "Empleador que busca talento técnico del Liceo",
    requiresApproval: false,
  },
  {
    id: "teacher" as Role,
    icon: BookOpen,
    label: "Docente / Directivo",
    desc: "Personal del Liceo Cardenal Caro",
    requiresApproval: true,
  },
];
 
export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  // Campos del formulario
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [especialidad, setEspecialidad] = useState("Electricidad");
  const [grado, setGrado] = useState("4to_medio");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [industria, setIndustria] = useState("");
  const [rut, setRut] = useState("");
  const [departamento, setDepartamento] = useState("");
 
  const role = roles.find((r) => r.id === selectedRole)!;
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
 
    try {
      let endpoint = "";
      let body: Record<string, string> = {};
 
      if (selectedRole === "student") {
        endpoint = "/api/registro/estudiante/";
        body = {
          username: email,
          password,
          email,
          first_name: firstName,
          last_name: lastName,
          especialidad,
          grado,
        };
      } else if (selectedRole === "teacher") {
        endpoint = "/api/registro/docente/";
        body = {
          username: email,
          password,
          email,
          first_name: firstName,
          last_name: lastName,
          departamento,
        };
      } else if (selectedRole === "company") {
        endpoint = "/api/registro/empresa/";
        body = {
          username: email,
          password,
          email,
          first_name: firstName,
          last_name: lastName,
          nombre_empresa: nombreEmpresa,
          industria,
          rut,
        };
      }
 
      const res = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });
 
      if (!res.ok) {
        const data = await res.json();
        // Mostrar el primer error que devuelva el backend
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] as string : String(firstError));
        return;
      }
 
      setSubmitted(true);
    } catch {
      setError("Error de conexión. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };
 
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm p-8 text-center"
        >
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-500" />
          </div>
          <h2 className="text-slate-900 mb-2" style={{ fontWeight: 700 }}>
            {selectedRole === "company" ? "¡Cuenta creada!" : "Solicitud enviada"}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            {selectedRole === "company"
              ? "Tu cuenta de empresa fue creada exitosamente. Ya puedes iniciar sesión."
              : "Tu solicitud fue enviada. Un docente del Liceo debe activar tu cuenta antes de que puedas ingresar."}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm transition-colors"
            style={{ fontWeight: 600 }}
          >
            Ir al login
          </button>
        </motion.div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <button
            onClick={() => (step === "form" ? setStep("role") : navigate("/login"))}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm mb-5 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === "form" ? "Cambiar tipo de cuenta" : "Volver al login"}
          </button>
 
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <Award className="w-5 h-5" style={{ color: "#D4AF37" }} />
            </div>
            <div>
              <p className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Red Talento Caro</p>
              <p className="text-slate-500 text-xs">Crear nueva cuenta</p>
            </div>
          </div>
 
          <div className="mt-4">
            <h2 className="text-slate-900" style={{ fontWeight: 700 }}>
              {step === "role" ? "¿Qué tipo de cuenta?" : `Cuenta de ${role.label}`}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {step === "role"
                ? "Selecciona tu perfil para continuar"
                : "Completa tus datos para registrarte"}
            </p>
          </div>
        </div>
 
        <div className="p-6">
          {step === "role" ? (
            <div className="space-y-3">
              {roles.map((r) => {
                const RIcon = r.icon;
                const sel = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`w-full border-2 rounded-xl p-4 flex items-center gap-3 transition-all text-left ${
                      sel
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sel ? "bg-slate-900" : "bg-slate-100"}`}>
                      <RIcon className={`w-5 h-5 ${sel ? "text-white" : "text-slate-500"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 text-sm" style={{ fontWeight: sel ? 600 : 500 }}>{r.label}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{r.desc}</p>
                      {r.id === "company" && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 mt-1" style={{ fontWeight: 600 }}>
                          <CheckCircle className="w-3 h-3" /> Acceso inmediato
                        </span>
                      )}
                      {r.requiresApproval && (
                        <span className="text-xs text-amber-600 mt-1 block" style={{ fontWeight: 500 }}>
                          Requiere aprobación del Liceo
                        </span>
                      )}
                    </div>
                    {sel && <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                  </button>
                );
              })}
 
              <button
                onClick={() => setStep("form")}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm transition-colors flex items-center justify-center gap-2 mt-2"
                style={{ fontWeight: 600 }}
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {selectedRole === "company" && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-xs leading-relaxed">
                    Las empresas tienen acceso inmediato al registrarse.
                  </p>
                </div>
              )}
 
              {/* Campos comunes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Nombre(s)</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Felipe"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Apellido(s)</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Muñoz"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>
 
              {/* Campos específicos por rol */}
              {selectedRole === "student" && (
                <>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Especialidad técnica</label>
                    <select
                      value={especialidad}
                      onChange={(e) => setEspecialidad(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <option>Electricidad</option>
                      <option>Mecánica Automotriz</option>
                      <option>Computación e Informática</option>
                      <option>Construcción</option>
                      <option>Mecánica Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Curso / Nivel</label>
                    <select
                      value={grado}
                      onChange={(e) => setGrado(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="4to_medio">4° Medio TP</option>
                      <option value="egresado">Egresado</option>
                    </select>
                  </div>
                </>
              )}
 
              {selectedRole === "company" && (
                <>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Nombre de la empresa</label>
                    <input
                      value={nombreEmpresa}
                      onChange={(e) => setNombreEmpresa(e.target.value)}
                      placeholder="Eléctrica Los Espejo Ltda."
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Rubro / Industria</label>
                    <input
                      value={industria}
                      onChange={(e) => setIndustria(e.target.value)}
                      placeholder="Electricidad, Construcción, TI..."
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>RUT empresa (opcional)</label>
                    <input
                      value={rut}
                      onChange={(e) => setRut(e.target.value)}
                      placeholder="12.345.678-9"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </>
              )}
 
              {selectedRole === "teacher" && (
                <div>
                  <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Departamento / Especialidad</label>
                  <input
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    placeholder="Dpto. Electricidad"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              )}
 
              <div>
                <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Correo electrónico / Usuario</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.cl"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
 
              {/* Error */}
              {error && (
                <p className="text-red-500 text-xs">{error}</p>
              )}
 
              {role.requiresApproval && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-700 text-xs leading-relaxed">
                    {selectedRole === "teacher"
                      ? "Las cuentas docentes deben ser aprobadas por la dirección del Liceo antes de activarse."
                      : "Tu cuenta debe ser vinculada al Liceo Cardenal Caro por un docente para activarse."}
                  </p>
                </div>
              )}
 
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm transition-colors"
                style={{ fontWeight: 600 }}
              >
                {loading
                  ? "Enviando..."
                  : selectedRole === "company"
                  ? "Crear cuenta de empresa"
                  : "Enviar solicitud de registro"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
