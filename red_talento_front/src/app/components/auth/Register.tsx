import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Award, GraduationCap, Building2, BookOpen, ArrowLeft,
  ChevronRight, Eye, EyeOff, CheckCircle, ArrowRight, Loader2,
} from "lucide-react";
import { useState } from "react";
import { authApi } from "@/api/api";
import type { Role } from "@/app/types";

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
    requiresApproval: false,
  },
];

const backendMsgs: Record<string, string> = {
  "A user with that username already exists.": "Este nombre de usuario ya está en uso.",
  "Enter a valid email address.": "Ingresa un correo electrónico válido.",
  "This password is too short. It must contain at least 8 characters.": "La contraseña debe tener al menos 8 caracteres.",
  "This password is too common.": "La contraseña es demasiado común, elige una más segura.",
  "This password is entirely numeric.": "La contraseña no puede ser solo números.",
  "This field may not be blank.": "Este campo es obligatorio.",
  "This field is required.": "Este campo es obligatorio.",
  "El RUT ingresado no es válido.": "El RUT ingresado no es válido.",
  "Ya existe una empresa registrada con este RUT.": "Ya existe una empresa registrada con este RUT.",
};

function traducir(msg: string): string {
  return backendMsgs[msg] ?? msg;
}

function parsearErrores(err: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(err)) {
    if (key === "detail") continue;
    const msgs = Array.isArray(val) ? val : [val];
    result[key] = traducir(String(msgs[0]));
  }
  return result;
}

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    especialidad: "Electricidad",
    curso: "4° Medio TP",
    departamento: "",
    nombre_empresa: "",
    industria: "",
    nombre_representante: "",
    rut: "",
  });

  const role = roles.find((r) => r.id === selectedRole)!;

  const setField = (k: string, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (fieldErrors[k]) setFieldErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const inputClass = (field: string) =>
    `w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
      fieldErrors[field]
        ? "border-red-300 focus:ring-red-100 bg-red-50"
        : "border-slate-200 focus:ring-slate-200"
    }`;

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>
    ) : null;

  const validarRut = (rut: string): boolean => {
    const limpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
    if (limpio.length < 2) return false;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    if (!/^\d+$/.test(cuerpo)) return false;
    let numero = parseInt(cuerpo, 10);
    let suma = 0;
    let factor = 2;
    while (numero > 0) {
      suma += (numero % 10) * factor;
      numero = Math.floor(numero / 10);
      factor = factor < 7 ? factor + 1 : 2;
    }
    const resto = 11 - (suma % 11);
    const verificador = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
    return dv === verificador;
  };

  const formatRut = (value: string): string => {
    const limpio = value.replace(/\./g, "").replace(/-/g, "").toUpperCase();
    if (limpio.length === 0) return "";
    const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const dv = limpio.slice(-1);
    return `${cuerpo}-${dv}`;
  };

  const handleRutChange = (raw: string) => {
    const sanitized = raw.replace(/[^0-9kK.\-]/g, "").toUpperCase();
    const formatted =
      sanitized.length > 1
        ? formatRut(sanitized.replace(/\./g, "").replace(/-/g, ""))
        : sanitized;
    setField("rut", formatted);
    const sinFormato = formatted.replace(/\./g, "").replace(/-/g, "");
    if (sinFormato.length >= 8) {
      setFieldErrors((prev) => ({
        ...prev,
        rut: validarRut(formatted) ? "" : "RUT inválido",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, rut: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError(null);
    setFieldErrors({});

    const gradoMap: Record<string, string> = {
      "4° Medio TP": "4to_medio",
      "3° Medio TP": "4to_medio",
      "EPJA": "4to_medio",
      "Egresado": "egresado",
    };

    const frontErrors: Record<string, string> = {};
    if (!form.username.trim()) frontErrors.username = "El nombre de usuario es obligatorio.";
    if (form.username.trim().includes(" ")) frontErrors.username = "El usuario no puede contener espacios.";
    if (!form.email.trim()) frontErrors.email = "El correo es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) frontErrors.email = "Ingresa un correo electrónico válido.";
    if (form.password.length < 8) frontErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    if (/^\d+$/.test(form.password)) frontErrors.password = "La contraseña no puede ser solo números.";
    if (selectedRole === "company" && !validarRut(form.rut)) {
      frontErrors.rut = "El RUT ingresado no es válido.";
    }

    if (Object.keys(frontErrors).length > 0) {
      setFieldErrors(frontErrors);
      setLoading(false);
      return;
    }

    const payload: Record<string, unknown> = {
      username: form.username,
      email: form.email,
      password: form.password,
      role: selectedRole,
    };

    if (selectedRole === "student") {
      payload.first_name = form.first_name;
      payload.last_name = form.last_name;
      payload.especialidad = form.especialidad;
      payload.grado = gradoMap[form.curso] ?? "4to_medio";
    } else if (selectedRole === "company") {
      const parts = form.nombre_representante.trim().split(" ");
      payload.first_name = parts[0] ?? form.nombre_representante;
      payload.last_name = parts.slice(1).join(" ") || "-";
      payload.nombre_empresa = form.nombre_empresa;
      payload.industria = form.industria;
      payload.rut = form.rut.replace(/\./g, "").toUpperCase();
    } else if (selectedRole === "teacher") {
      const parts = form.first_name.trim().split(" ");
      payload.first_name = parts[0] ?? form.first_name;
      payload.last_name = parts.slice(1).join(" ") || form.last_name || "-";
      payload.departamento = form.departamento;
    }

    try {
      await authApi.register(payload);
      if (selectedRole === "company" || selectedRole === "teacher") {
        navigate("/login");
      } else {
        setSubmitted(true);
      }
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      if (e.detail) {
        setGlobalError(traducir(String(e.detail)));
      } else {
        const parsed = parsearErrores(e);
        if (Object.keys(parsed).length > 0) {
          setFieldErrors(parsed);
        } else {
          setGlobalError("Error al registrarse. Verifica los datos e intenta de nuevo.");
        }
      }
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
          <h2 className="text-slate-900 font-bold mb-2">Solicitud enviada</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Tu solicitud de cuenta fue enviada al equipo del Liceo Cardenal Caro.
            Recibirás un correo cuando sea aprobada.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
          >
            Volver al login
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
        <div className="p-6 border-b border-slate-100">
          <button
            onClick={() => (step === "form" ? setStep("role") : navigate("/login"))}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === "form" ? "Cambiar tipo de cuenta" : "Volver al login"}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <Award className="w-5 h-5" style={{ color: "#D4AF37" }} />
            </div>
            <div>
              <p className="text-slate-900 text-sm font-bold">Red Talento Caro</p>
              <p className="text-slate-500 text-xs">Crear nueva cuenta</p>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-slate-900 font-bold">
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
                      sel ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sel ? "bg-slate-900" : "bg-slate-100"}`}>
                      <RIcon className={`w-5 h-5 ${sel ? "text-white" : "text-slate-500"}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-slate-900 text-sm ${sel ? "font-semibold" : "font-medium"}`}>{r.label}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{r.desc}</p>
                      {r.id === "company" && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold mt-1">
                          <CheckCircle className="w-3 h-3" /> Acceso inmediato
                        </span>
                      )}
                      {r.requiresApproval && (
                        <span className="text-xs text-amber-600 font-medium mt-1 block">
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
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-2"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {globalError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-xs font-medium">{globalError}</p>
                </div>
              )}

              {selectedRole === "company" && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-xs leading-relaxed">
                    Las empresas tienen acceso inmediato al registrarse.
                    Podrás buscar y contactar talento validado por el Liceo desde el primer día.
                  </p>
                </div>
              )}

              {selectedRole === "student" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">Nombre(s)</label>
                      <input value={form.first_name} onChange={(e) => setField("first_name", e.target.value)}
                        placeholder="Felipe" className={inputClass("first_name")} required />
                      <FieldError field="first_name" />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">Apellido(s)</label>
                      <input value={form.last_name} onChange={(e) => setField("last_name", e.target.value)}
                        placeholder="Muñoz" className={inputClass("last_name")} required />
                      <FieldError field="last_name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">Especialidad técnica</label>
                    <select value={form.especialidad} onChange={(e) => setField("especialidad", e.target.value)}
                      className={inputClass("especialidad")}>
                      <option>Electricidad</option>
                      <option>Mecánica Automotriz</option>
                      <option>Computación e Informática</option>
                      <option>Construcción</option>
                      <option>Mecánica Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">Curso / Nivel</label>
                    <select value={form.curso} onChange={(e) => setField("curso", e.target.value)}
                      className={inputClass("curso")}>
                      <option>4° Medio TP</option>
                      <option>3° Medio TP</option>
                      <option>EPJA</option>
                      <option>Egresado</option>
                    </select>
                  </div>
                </>
              )}

              {selectedRole === "company" && (
                <>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">Nombre de la empresa</label>
                    <input value={form.nombre_empresa} onChange={(e) => setField("nombre_empresa", e.target.value)}
                      placeholder="Eléctrica Los Espejo Ltda." className={inputClass("nombre_empresa")} required />
                    <FieldError field="nombre_empresa" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">RUT de la empresa</label>
                    <input
                      value={form.rut}
                      onChange={(e) => handleRutChange(e.target.value)}
                      placeholder="12.345.678-9"
                      maxLength={12}
                      className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        fieldErrors.rut
                          ? "border-red-300 focus:ring-red-100 bg-red-50"
                          : form.rut && validarRut(form.rut)
                          ? "border-green-300 focus:ring-green-100"
                          : "border-slate-200 focus:ring-slate-200"
                      }`}
                      required
                    />
                    {fieldErrors.rut && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.rut}</p>
                    )}
                    {!fieldErrors.rut && form.rut && validarRut(form.rut) && (
                      <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> RUT válido
                      </p>
                    )}
                    <p className="text-slate-400 text-xs mt-1">Ej: 12.345.678-9</p>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">Rubro / Industria</label>
                    <input value={form.industria} onChange={(e) => setField("industria", e.target.value)}
                      placeholder="Electricidad, Construcción, TI..." className={inputClass("industria")} required />
                    <FieldError field="industria" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">Nombre del representante</label>
                    <input value={form.nombre_representante} onChange={(e) => setField("nombre_representante", e.target.value)}
                      placeholder="Juan Pérez" className={inputClass("nombre_representante")} required />
                    <FieldError field="nombre_representante" />
                  </div>
                </>
              )}

              {selectedRole === "teacher" && (
                <>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">Nombre completo</label>
                    <input value={form.first_name} onChange={(e) => setField("first_name", e.target.value)}
                      placeholder="Ana García Vidal" className={inputClass("first_name")} required />
                    <FieldError field="first_name" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">Departamento / Especialidad</label>
                    <input value={form.departamento} onChange={(e) => setField("departamento", e.target.value)}
                      placeholder="Dpto. Electricidad" className={inputClass("departamento")} required />
                    <FieldError field="departamento" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Usuario</label>
                <input type="text" value={form.username} onChange={(e) => setField("username", e.target.value)}
                  placeholder="mi_usuario" autoComplete="username" className={inputClass("username")} required />
                <FieldError field="username" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Correo electrónico</label>
                <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)}
                  placeholder="correo@ejemplo.cl" className={inputClass("email")} required />
                <FieldError field="email" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className={`${inputClass("password")} pr-10`}
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError field="password" />
              </div>

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
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : (
                  selectedRole === "company" ? "Crear cuenta de empresa"
                  : selectedRole === "teacher" ? "Crear cuenta de docente"
                  : "Enviar solicitud de registro"
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
