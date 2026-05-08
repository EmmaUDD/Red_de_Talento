import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Award, GraduationCap, Building2, BookOpen,
  Eye, EyeOff, ArrowRight, Shield, Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true); setError(null);
    try {
      await login(username.trim(), password);
      navigate("/inicio");
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      setError(e.detail ? String(e.detail) : "Credenciales incorrectas. Verifica tu usuario y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused?: boolean): React.CSSProperties => ({
    width: "100%", boxSizing: "border-box",
    backgroundColor: focused ? "#FFFFFF" : "#F6F5F0",
    border: `1px solid ${focused ? "#D4AF37" : "#E8E4DC"}`,
    borderRadius: 10, padding: "10px 14px",
    fontSize: "0.875rem", color: "#0d1b35",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: "none", transition: "border-color 0.15s, background-color 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Left panel — navy, full height */}
      <div className="hidden lg:flex" style={{
        flex: 1, flexDirection: "column", justifyContent: "center",
        padding: "64px 64px",
        backgroundColor: "#0d1b35",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Gold bottom accent line */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: "#D4AF37" }} />

<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award style={{ width: 22, height: 22, color: "#D4AF37" }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", margin: 0, lineHeight: 1 }}>
              Red Talento <span style={{ color: "#D4AF37" }}>Caro</span>
            </p>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", margin: "3px 0 0" }}>
              Liceo Cardenal Caro · Lo Espejo
            </p>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "2.6rem", fontWeight: 800, lineHeight: 1.15,
          color: "#FFFFFF", margin: "0 0 16px",
        }}>
          Tu oficio tiene<br />
          <span style={{ color: "#D4AF37" }}>valor real.</span>
        </h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: 400, margin: "0 0 44px" }}>
          La plataforma que conecta el talento técnico validado del Liceo Cardenal Caro
          con empleadores locales. Construye tu red profesional con respaldo institucional.
        </p>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 340 }}>
          {[
            "Perfil validado institucionalmente",
            "Insignias por competencias reales",
            "Acceso directo a empleos locales",
            "Datos y privacidad protegidos",
          ].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#D4AF37", flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>

        {/* Account type icons — bottom left */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 56 }}>
          {[
            { icon: GraduationCap, label: "Estudiante" },
            { icon: BookOpen,      label: "Docente"    },
            { icon: Building2,     label: "Empresa"    },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon style={{ width: 16, height: 16, color: "rgba(255,255,255,0.5)" }} />
              </div>
              <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — warm cream */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F6F5F0", padding: "48px 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ width: "100%", maxWidth: 380 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#0d1b35", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award style={{ width: 18, height: 18, color: "#D4AF37" }} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#0d1b35" }}>
              Red Talento <span style={{ color: "#D4AF37" }}>Caro</span>
            </span>
          </div>

          {/* Card */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, border: "1px solid #E8E4DC", overflow: "hidden" }}>
            {/* Card header strip */}
            <div style={{ height: 6, backgroundColor: "#0d1b35", backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.25) 1px, transparent 1px)", backgroundSize: "10px 10px" }} />

            <div style={{ padding: "28px 28px 24px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: "#0d1b35", margin: "0 0 4px" }}>
                Bienvenido/a
              </h2>
              <p style={{ fontSize: "0.82rem", color: "#8C7B6B", margin: "0 0 24px" }}>
                Ingresa con tu cuenta institucional
              </p>

              {error && (
                <div style={{ backgroundColor: "#FFF1F0", border: "1px solid #FECDD3", borderRadius: 10, padding: "10px 14px", marginBottom: 18 }}>
                  <p style={{ color: "#BE123C", fontSize: "0.78rem", fontWeight: 600, margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#6B5D52", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tu_usuario"
                    autoComplete="username"
                    style={inputStyle()}
                    onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                    onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.backgroundColor = "#F6F5F0"; }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#6B5D52", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    Contraseña
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      style={{ ...inputStyle(), paddingRight: 42 }}
                      onFocus={(el) => { el.currentTarget.style.borderColor = "#D4AF37"; el.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                      onBlur={(el) => { el.currentTarget.style.borderColor = "#E8E4DC"; el.currentTarget.style.backgroundColor = "#F6F5F0"; }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8C7B6B", display: "flex" }}
                    >
                      {showPass ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Shield style={{ width: 12, height: 12, color: "#94a3b8" }} />
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Acceso gestionado por el Liceo Cardenal Caro</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
                    backgroundColor: loading ? "#E8E4DC" : "#0d1b35",
                    color: loading ? "#94a3b8" : "#FFFFFF",
                    fontSize: "0.875rem", fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "background-color 0.15s",
                  }}
                >
                  {loading ? (
                    <><Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> Ingresando...</>
                  ) : (
                    <>Ingresar <ArrowRight style={{ width: 15, height: 15 }} /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 16px" }}>
                <div style={{ flex: 1, height: 1, backgroundColor: "#E8E4DC" }} />
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>tipos de cuenta</span>
                <div style={{ flex: 1, height: 1, backgroundColor: "#E8E4DC" }} />
              </div>

              {/* Role chips */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
                {[
                  { icon: GraduationCap, label: "Estudiante", bg: "#EFF6FF",  color: "#1d4ed8" },
                  { icon: BookOpen,      label: "Docente",    bg: "#F0FDF4",  color: "#15803d" },
                  { icon: Building2,     label: "Empresa",    bg: "#FFFBF0",  color: "#b45309" },
                ].map(({ icon: Icon, label, bg, color }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 6px", borderRadius: 10, backgroundColor: bg }}>
                    <Icon style={{ width: 18, height: 18, color }} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color }}>{label}</span>
                  </div>
                ))}
              </div>

              <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#8C7B6B", margin: 0 }}>
                ¿Sin cuenta?{" "}
                <button
                  onClick={() => navigate("/register")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#0d1b35", fontWeight: 700, fontSize: "0.78rem", fontFamily: "'Plus Jakarta Sans', sans-serif", textDecoration: "underline" }}
                >
                  Solicitar acceso
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
