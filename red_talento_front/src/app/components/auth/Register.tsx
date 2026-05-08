import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Award, GraduationCap, Building2, BookOpen, ArrowLeft,
  ChevronRight, Eye, EyeOff, CheckCircle, ArrowRight, Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { authApi } from "@/api/api";
import type { Role } from "@/app/types";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const roles = [
  {
    id: "student" as Role,
    icon: GraduationCap,
    label: "Estudiante / Egresado",
    desc: "4° Medio TP, EPJA o exalumno del Liceo Cardenal Caro",
    requiresApproval: true,
    badge: { text: "Requiere aprobación", bg: "#FFFBF0", color: "#B8962E", border: "#F5E6C0" },
  },
  {
    id: "company" as Role,
    icon: Building2,
    label: "Empresa",
    desc: "Empleador que busca talento técnico del Liceo",
    requiresApproval: false,
    badge: { text: "Acceso inmediato", bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" },
  },
  {
    id: "teacher" as Role,
    icon: BookOpen,
    label: "Docente / Directivo",
    desc: "Personal del Liceo Cardenal Caro",
    requiresApproval: true,
    badge: { text: "Requiere aprobación", bg: "#FFFBF0", color: "#B8962E", border: "#F5E6C0" },
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

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    width: "100%", boxSizing: "border-box",
    backgroundColor: hasError ? "#FFF1F0" : "#F6F5F0",
    border: `1px solid ${hasError ? "#FECDD3" : "#E8E4DC"}`,
    borderRadius: 10, padding: "9px 13px",
    fontSize: "0.855rem", color: "#0d1b35",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: "none",
  };
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.7rem", fontWeight: 700, color: "#6B5D52",
  textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 5,
};

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
    first_name: "", last_name: "", username: "", email: "", password: "",
    especialidad: "Electricidad", curso: "4° Medio TP",
    departamento: "", nombre_empresa: "", industria: "",
    nombre_representante: "", rut: "",
  });

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  const role = roles.find((r) => r.id === selectedRole)!;

  const setField = (k: string, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (fieldErrors[k]) setFieldErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <p style={{ color: "#BE123C", fontSize: "0.72rem", margin: "4px 0 0", fontWeight: 500 }}>{fieldErrors[field]}</p>
    ) : null;

  const validarRut = (rut: string): boolean => {
    const limpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
    if (limpio.length < 2) return false;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    if (!/^\d+$/.test(cuerpo)) return false;
    let numero = parseInt(cuerpo, 10);
    let suma = 0; let factor = 2;
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
    const formatted = sanitized.length > 1 ? formatRut(sanitized.replace(/\./g, "").replace(/-/g, "")) : sanitized;
    setField("rut", formatted);
    const sinFormato = formatted.replace(/\./g, "").replace(/-/g, "");
    if (sinFormato.length >= 8) {
      setFieldErrors((prev) => ({ ...prev, rut: validarRut(formatted) ? "" : "RUT inválido" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, rut: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setGlobalError(null); setFieldErrors({});

    const gradoMap: Record<string, string> = {
      "4° Medio TP": "4to_medio", "3° Medio TP": "4to_medio", "EPJA": "4to_medio", "Egresado": "egresado",
    };

    const frontErrors: Record<string, string> = {};
    if (!form.username.trim()) frontErrors.username = "El nombre de usuario es obligatorio.";
    if (form.username.trim().includes(" ")) frontErrors.username = "El usuario no puede contener espacios.";
    if (!form.email.trim()) frontErrors.email = "El correo es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) frontErrors.email = "Ingresa un correo electrónico válido.";
    if (form.password.length < 8) frontErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    if (/^\d+$/.test(form.password)) frontErrors.password = "La contraseña no puede ser solo números.";
    if (selectedRole === "company" && !validarRut(form.rut)) frontErrors.rut = "El RUT ingresado no es válido.";

    if (Object.keys(frontErrors).length > 0) {
      setFieldErrors(frontErrors); setLoading(false); return;
    }

    const payload: Record<string, unknown> = {
      username: form.username, email: form.email, password: form.password, role: selectedRole,
    };

    if (selectedRole === "student") {
      payload.first_name = form.first_name; payload.last_name = form.last_name;
      payload.especialidad = form.especialidad; payload.grado = gradoMap[form.curso] ?? "4to_medio";
    } else if (selectedRole === "company") {
      const parts = form.nombre_representante.trim().split(" ");
      payload.first_name = parts[0] ?? form.nombre_representante;
      payload.last_name = parts.slice(1).join(" ") || "-";
      payload.nombre_empresa = form.nombre_empresa; payload.industria = form.industria;
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
      <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ backgroundColor: "#FFFFFF", borderRadius: 20, border: "1px solid #E8E4DC", width: "100%", maxWidth: 380, overflow: "hidden" }}
        >
          <div style={{ height: 6, backgroundColor: "#D4AF37" }} />
          <div style={{ padding: "36px 32px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#FFFBF0", border: "1px solid #F5E6C0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle style={{ width: 26, height: 26, color: "#D4AF37" }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.35rem", fontWeight: 700, color: "#0d1b35", margin: "0 0 8px" }}>
              Solicitud enviada
            </h2>
            <p style={{ fontSize: "0.84rem", color: "#6B5D52", lineHeight: 1.7, margin: "0 0 28px" }}>
              Tu solicitud de cuenta fue enviada al equipo del Liceo Cardenal Caro.
              Recibirás un correo cuando sea aprobada.
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", backgroundColor: "#0d1b35", color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Volver al login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 24px 64px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 460, backgroundColor: "#FFFFFF", borderRadius: 20, border: "1px solid #E8E4DC", overflow: "hidden" }}
      >
        {/* Top accent strip */}
        <div style={{ height: 6, backgroundColor: "#0d1b35", backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.3) 1px, transparent 1px)", backgroundSize: "10px 10px" }} />

<div style={{ padding: "22px 28px 18px", borderBottom: "1px solid #F0EDE8" }}>
          <button
            onClick={() => (step === "form" ? setStep("role") : navigate("/login"))}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#8C7B6B", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 16, padding: 0 }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            {step === "form" ? "Cambiar tipo de cuenta" : "Volver al login"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Award style={{ width: 18, height: 18, color: "#D4AF37" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>
                Red Talento Caro
              </p>
              <p style={{ fontSize: "0.72rem", color: "#8C7B6B", margin: "2px 0 0" }}>Crear nueva cuenta</p>
            </div>
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.25rem", fontWeight: 700, color: "#0d1b35", margin: "0 0 3px" }}>
            {step === "role" ? "¿Qué tipo de cuenta?" : `Cuenta de ${role.label}`}
          </h2>
          <p style={{ fontSize: "0.8rem", color: "#8C7B6B", margin: 0 }}>
            {step === "role" ? "Selecciona tu perfil para continuar" : "Completa tus datos para registrarte"}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px 28px" }}>

          {step === "role" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {roles.map((r) => {
                const RIcon = r.icon;
                const sel = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    style={{
                      width: "100%", textAlign: "left",
                      border: `2px solid ${sel ? "#0d1b35" : "#E8E4DC"}`,
                      borderRadius: 14, padding: "14px 16px",
                      display: "flex", alignItems: "center", gap: 12,
                      backgroundColor: sel ? "#F6F5F0" : "#FFFFFF",
                      cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: "border-color 0.15s, background-color 0.15s",
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 11, backgroundColor: sel ? "#0d1b35" : "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background-color 0.15s" }}>
                      <RIcon style={{ width: 19, height: 19, color: sel ? "#D4AF37" : "#8C7B6B" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0d1b35", margin: 0 }}>{r.label}</p>
                      <p style={{ fontSize: "0.75rem", color: "#6B5D52", margin: "2px 0 5px" }}>{r.desc}</p>
                      <span style={{ display: "inline-block", fontSize: "0.68rem", fontWeight: 700, padding: "2px 9px", borderRadius: 20, backgroundColor: r.badge.bg, color: r.badge.color, border: `1px solid ${r.badge.border}` }}>
                        {r.badge.text}
                      </span>
                    </div>
                    {sel && <ChevronRight style={{ width: 15, height: 15, color: "#0d1b35", flexShrink: 0 }} />}
                  </button>
                );
              })}

              <button
                onClick={() => setStep("form")}
                style={{ width: "100%", marginTop: 6, padding: "12px 0", borderRadius: 10, border: "none", backgroundColor: "#0d1b35", color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Continuar <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          )}

          {step === "form" && (
            <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSubmit}>

              {globalError && (
                <div style={{ backgroundColor: "#FFF1F0", border: "1px solid #FECDD3", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ color: "#BE123C", fontSize: "0.78rem", fontWeight: 600, margin: 0 }}>{globalError}</p>
                </div>
              )}

              {selectedRole === "company" && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 9, backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 13px" }}>
                  <CheckCircle style={{ width: 14, height: 14, color: "#166534", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: "0.78rem", color: "#166534", margin: 0, lineHeight: 1.6 }}>
                    Las empresas tienen acceso inmediato al registrarse. Podrás buscar y contactar talento validado por el Liceo desde el primer día.
                  </p>
                </div>
              )}

              {/* Student fields */}
              {selectedRole === "student" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Nombre(s)</label>
                      <input value={form.first_name} onChange={(e) => setField("first_name", e.target.value)} placeholder="Felipe" style={inputStyle(!!fieldErrors.first_name)}
                        onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                        onBlur={(el) => { el.currentTarget.style.borderColor = fieldErrors.first_name ? "#FECDD3" : "#E8E4DC"; el.currentTarget.style.backgroundColor = fieldErrors.first_name ? "#FFF1F0" : "#F6F5F0"; }}
                        required />
                      <FieldError field="first_name" />
                    </div>
                    <div>
                      <label style={labelStyle}>Apellido(s)</label>
                      <input value={form.last_name} onChange={(e) => setField("last_name", e.target.value)} placeholder="Muñoz" style={inputStyle(!!fieldErrors.last_name)}
                        onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                        onBlur={(el) => { el.currentTarget.style.borderColor = fieldErrors.last_name ? "#FECDD3" : "#E8E4DC"; el.currentTarget.style.backgroundColor = fieldErrors.last_name ? "#FFF1F0" : "#F6F5F0"; }}
                        required />
                      <FieldError field="last_name" />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Especialidad técnica</label>
                    <select value={form.especialidad} onChange={(e) => setField("especialidad", e.target.value)} style={inputStyle()}>
                      <option>Electricidad</option>
                      <option>Mecánica Automotriz</option>
                      <option>Computación e Informática</option>
                      <option>Construcción</option>
                      <option>Mecánica Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Curso / Nivel</label>
                    <select value={form.curso} onChange={(e) => setField("curso", e.target.value)} style={inputStyle()}>
                      <option>4° Medio TP</option>
                      <option>3° Medio TP</option>
                      <option>EPJA</option>
                      <option>Egresado</option>
                    </select>
                  </div>
                </>
              )}

              {/* Company fields */}
              {selectedRole === "company" && (
                <>
                  <div>
                    <label style={labelStyle}>Nombre de la empresa</label>
                    <input value={form.nombre_empresa} onChange={(e) => setField("nombre_empresa", e.target.value)} placeholder="Eléctrica Los Espejo Ltda." style={inputStyle(!!fieldErrors.nombre_empresa)}
                      onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                      onBlur={(el) => { el.currentTarget.style.borderColor = fieldErrors.nombre_empresa ? "#FECDD3" : "#E8E4DC"; el.currentTarget.style.backgroundColor = fieldErrors.nombre_empresa ? "#FFF1F0" : "#F6F5F0"; }}
                      required />
                    <FieldError field="nombre_empresa" />
                  </div>
                  <div>
                    <label style={labelStyle}>RUT de la empresa</label>
                    <input
                      value={form.rut} onChange={(e) => handleRutChange(e.target.value)}
                      placeholder="12.345.678-9" maxLength={12}
                      style={{ ...inputStyle(!!fieldErrors.rut), borderColor: !fieldErrors.rut && form.rut && validarRut(form.rut) ? "#86EFAC" : (fieldErrors.rut ? "#FECDD3" : "#E8E4DC") }}
                      onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                      onBlur={(el) => {
                        el.currentTarget.style.backgroundColor = fieldErrors.rut ? "#FFF1F0" : "#F6F5F0";
                        el.currentTarget.style.borderColor = fieldErrors.rut ? "#FECDD3" : (form.rut && validarRut(form.rut) ? "#86EFAC" : "#E8E4DC");
                      }}
                      required
                    />
                    {fieldErrors.rut && <p style={{ color: "#BE123C", fontSize: "0.72rem", margin: "4px 0 0" }}>{fieldErrors.rut}</p>}
                    {!fieldErrors.rut && form.rut && validarRut(form.rut) && (
                      <p style={{ color: "#166534", fontSize: "0.72rem", margin: "4px 0 0", display: "flex", alignItems: "center", gap: 3 }}>
                        <CheckCircle style={{ width: 11, height: 11 }} /> RUT válido
                      </p>
                    )}
                    <p style={{ color: "#94a3b8", fontSize: "0.7rem", margin: "3px 0 0" }}>Ej: 12.345.678-9</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Rubro / Industria</label>
                    <input value={form.industria} onChange={(e) => setField("industria", e.target.value)} placeholder="Electricidad, Construcción, TI..." style={inputStyle(!!fieldErrors.industria)}
                      onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                      onBlur={(el) => { el.currentTarget.style.borderColor = fieldErrors.industria ? "#FECDD3" : "#E8E4DC"; el.currentTarget.style.backgroundColor = fieldErrors.industria ? "#FFF1F0" : "#F6F5F0"; }}
                      required />
                    <FieldError field="industria" />
                  </div>
                  <div>
                    <label style={labelStyle}>Nombre del representante</label>
                    <input value={form.nombre_representante} onChange={(e) => setField("nombre_representante", e.target.value)} placeholder="Juan Pérez" style={inputStyle(!!fieldErrors.nombre_representante)}
                      onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                      onBlur={(el) => { el.currentTarget.style.borderColor = fieldErrors.nombre_representante ? "#FECDD3" : "#E8E4DC"; el.currentTarget.style.backgroundColor = fieldErrors.nombre_representante ? "#FFF1F0" : "#F6F5F0"; }}
                      required />
                    <FieldError field="nombre_representante" />
                  </div>
                </>
              )}

              {/* Teacher fields */}
              {selectedRole === "teacher" && (
                <>
                  <div>
                    <label style={labelStyle}>Nombre completo</label>
                    <input value={form.first_name} onChange={(e) => setField("first_name", e.target.value)} placeholder="Ana García Vidal" style={inputStyle(!!fieldErrors.first_name)}
                      onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                      onBlur={(el) => { el.currentTarget.style.borderColor = fieldErrors.first_name ? "#FECDD3" : "#E8E4DC"; el.currentTarget.style.backgroundColor = fieldErrors.first_name ? "#FFF1F0" : "#F6F5F0"; }}
                      required />
                    <FieldError field="first_name" />
                  </div>
                  <div>
                    <label style={labelStyle}>Departamento / Especialidad</label>
                    <input value={form.departamento} onChange={(e) => setField("departamento", e.target.value)} placeholder="Dpto. Electricidad" style={inputStyle(!!fieldErrors.departamento)}
                      onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                      onBlur={(el) => { el.currentTarget.style.borderColor = fieldErrors.departamento ? "#FECDD3" : "#E8E4DC"; el.currentTarget.style.backgroundColor = fieldErrors.departamento ? "#FFF1F0" : "#F6F5F0"; }}
                      required />
                    <FieldError field="departamento" />
                  </div>
                </>
              )}

              {/* Common fields */}
              <div>
                <label style={labelStyle}>Usuario</label>
                <input type="text" value={form.username} onChange={(e) => setField("username", e.target.value)} placeholder="mi_usuario" autoComplete="username" style={inputStyle(!!fieldErrors.username)}
                  onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                  onBlur={(el) => { el.currentTarget.style.borderColor = fieldErrors.username ? "#FECDD3" : "#E8E4DC"; el.currentTarget.style.backgroundColor = fieldErrors.username ? "#FFF1F0" : "#F6F5F0"; }}
                  required />
                <FieldError field="username" />
              </div>
              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="correo@ejemplo.cl" style={inputStyle(!!fieldErrors.email)}
                  onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                  onBlur={(el) => { el.currentTarget.style.borderColor = fieldErrors.email ? "#FECDD3" : "#E8E4DC"; el.currentTarget.style.backgroundColor = fieldErrors.email ? "#FFF1F0" : "#F6F5F0"; }}
                  required />
                <FieldError field="email" />
              </div>
              <div>
                <label style={labelStyle}>Contraseña</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password} onChange={(e) => setField("password", e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    style={{ ...inputStyle(!!fieldErrors.password), paddingRight: 42 }}
                    onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                    onBlur={(el) => { el.currentTarget.style.borderColor = fieldErrors.password ? "#FECDD3" : "#E8E4DC"; el.currentTarget.style.backgroundColor = fieldErrors.password ? "#FFF1F0" : "#F6F5F0"; }}
                    required minLength={8}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8C7B6B", display: "flex" }}>
                    {showPass ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
                <FieldError field="password" />
              </div>

              {/* Approval notice */}
              {role.requiresApproval && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 9, backgroundColor: "#FFFBF0", border: "1px solid #F5E6C0", borderRadius: 10, padding: "10px 13px" }}>
                  <CheckCircle style={{ width: 14, height: 14, color: "#B8962E", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: "0.78rem", color: "#8C7B6B", margin: 0, lineHeight: 1.6 }}>
                    {selectedRole === "teacher"
                      ? "Las cuentas docentes deben ser aprobadas por la dirección del Liceo antes de activarse."
                      : "Tu cuenta debe ser vinculada al Liceo Cardenal Caro por un docente para activarse."}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", backgroundColor: loading ? "#E8E4DC" : "#0d1b35", color: loading ? "#94a3b8" : "#FFFFFF", fontSize: "0.875rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background-color 0.15s" }}
              >
                {loading ? (
                  <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Enviando...</>
                ) : selectedRole === "company" ? "Crear cuenta de empresa"
                  : selectedRole === "teacher" ? "Crear cuenta de docente"
                  : "Enviar solicitud de registro"}
              </button>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
