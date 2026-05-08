import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { PerfilProvider } from "@/app/context/PerfilContext";
import { docenteApi, reportesApi } from "@/api/api";
import {
  Home, User, Briefcase, ClipboardCheck, BarChart2,
  Plus, Search, Sparkles, Award, LogOut, Building2,
  GraduationCap, BookOpen, ChevronDown, X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const navByRole = {
  student: [
    { path: "/inicio",   label: "Inicio",        icon: Home },
    { path: "/perfil",   label: "Mi Perfil",      icon: User,          mobileLabel: "Perfil" },
    { path: "/empleos",  label: "Empleos",        icon: Briefcase },
    { path: "/busqueda", label: "Buscar",          icon: Search },
  ],
  teacher: [
    { path: "/inicio",          label: "Inicio",          icon: Home },
    { path: "/perfil-docente",  label: "Mi Perfil",       icon: User,           mobileLabel: "Perfil" },
    { path: "/validacion",      label: "Administración",  icon: ClipboardCheck, mobileLabel: "Admin" },
    { path: "/estadisticas",    label: "Estadísticas",    icon: BarChart2,      mobileLabel: "Stats" },
    { path: "/busqueda",        label: "Buscar",           icon: Search },
  ],
  company: [
    { path: "/inicio",           label: "Inicio",    icon: Home },
    { path: "/perfil-empresa",   label: "Mi Perfil", icon: User,     mobileLabel: "Perfil" },
    { path: "/publicar",         label: "Publicar",  icon: Plus },
    { path: "/buscar",           label: "Buscar",    icon: Search },
    { path: "/recomendaciones",  label: "Para ti",   icon: Sparkles, mobileLabel: "Para ti" },
  ],
};

const roleMeta = {
  student: { label: "Estudiante", icon: GraduationCap, chipBg: "#EFF6FF", chipColor: "#1d4ed8" },
  teacher: { label: "Docente",    icon: BookOpen,      chipBg: "#F0FDF4", chipColor: "#15803d" },
  company: { label: "Empresa",    icon: Building2,     chipBg: "#FFFBF0", chipColor: "#b45309" },
};

function UserDropdown({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;
  const meta = roleMeta[user.role];
  const MetaIcon = meta.icon;
  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.username;
  const firstName = fullName.split(" ")[0];
  const fotoSrc = user.foto_perfil
    ? (user.foto_perfil.startsWith("http") ? user.foto_perfil : `${BASE_URL}${user.foto_perfil}`)
    : null;

  const profileRoute =
    user.role === "student" ? "/perfil"
    : user.role === "teacher" ? "/perfil-docente"
    : "/perfil-empresa";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "5px 8px 5px 5px", borderRadius: 12,
          backgroundColor: open ? "rgba(255,255,255,0.12)" : "transparent",
          border: "1px solid",
          borderColor: open ? "rgba(255,255,255,0.18)" : "transparent",
          cursor: "pointer", transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
      >
        {fotoSrc ? (
          <img src={fotoSrc} alt={fullName}
            style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover", border: "1.5px solid rgba(255,255,255,0.2)", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MetaIcon style={{ width: 14, height: 14, color: "#D4AF37" }} />
          </div>
        )}
        <div className="hidden lg:block" style={{ textAlign: "left" }}>
          <p style={{ margin: 0, color: "white", fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {firstName}
          </p>
          <p style={{ margin: 0, color: "#D4AF37", fontSize: "0.65rem", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {meta.label}
          </p>
        </div>
        <ChevronDown
          className="hidden lg:block"
          style={{ width: 13, height: 13, color: "rgba(255,255,255,0.4)", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              width: 220, backgroundColor: "white",
              border: "1px solid #E8E4DC", borderRadius: 14,
              boxShadow: "0 12px 32px rgba(13,27,53,0.18)",
              zIndex: 50, overflow: "hidden",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <div style={{ padding: "13px 16px", borderBottom: "1px solid #F0EDE8" }}>
              <p style={{ margin: 0, color: "#0d1b35", fontSize: "0.85rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {fullName}
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, backgroundColor: meta.chipBg, marginTop: 5 }}>
                <MetaIcon style={{ width: 11, height: 11, color: meta.chipColor }} />
                <span style={{ fontSize: "0.67rem", fontWeight: 700, color: meta.chipColor }}>{meta.label}</span>
              </div>
            </div>

            <div style={{ padding: "4px 0" }}>
              {[
                { icon: User, label: "Mi Perfil", action: () => { navigate(profileRoute); setOpen(false); } },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", fontSize: "0.8rem", color: "#334155", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, transition: "background-color 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F6F5F0"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Icon style={{ width: 14, height: 14, color: "#94a3b8", flexShrink: 0 }} />
                  {label}
                </button>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #F0EDE8", padding: "4px 0" }}>
              <button
                onClick={() => { onLogout(); setOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", fontSize: "0.8rem", color: "#ef4444", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, transition: "background-color 0.1s" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FEF2F2"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [adminBadge, setAdminBadge] = useState(0);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.href = FONT_URL; link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "teacher") return;
    Promise.all([
      docenteApi.getSolicitudes().catch(() => []),
      reportesApi.getAll().catch(() => []),
    ]).then(([sols, reps]) => {
      const p = sols.filter((s) => s.estado === "pendiente").length
              + reps.filter((r) => r.estado === "pendiente").length;
      setAdminBadge(p);
    });
  }, [user?.role]);

  useEffect(() => {
    if (location.pathname === "/busqueda") setSearch("");
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearch("");
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  const navItems = (navByRole[user.role] ?? []).map((item) =>
    item.path === "/validacion" ? { ...item, badge: adminBadge } : item
  );

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleLogout = () => { logout(); navigate("/login"); };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/busqueda?q=${encodeURIComponent(search.trim())}`); setSearch(""); }
  };

  return (
    <PerfilProvider>
      <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 30,
          height: 56,
          backgroundColor: "#0d1b35",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          borderBottom: "2px solid #D4AF37",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", alignItems: "center", gap: 12 }}>

            <button
              onClick={() => navigate("/inicio")}
              style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, background: "none", border: "none", cursor: "pointer", marginRight: 4 }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "rgba(212,175,55,0.15)", border: "1.5px solid rgba(212,175,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award style={{ width: 15, height: 15, color: "#D4AF37" }} />
              </div>
              <span className="hidden sm:block" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: "0.95rem", color: "white" }}>
                Red Talento <span style={{ color: "#D4AF37" }}>Caro</span>
              </span>
            </button>

            <form
              onSubmit={onSearch}
              className="hidden md:flex"
              style={{ flex: 1, maxWidth: 320, position: "relative" }}
              ref={searchRef}
            >
              <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Buscar estudiantes, empresas…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, paddingLeft: 34, paddingRight: search ? 32 : 12,
                  paddingTop: 7, paddingBottom: 7,
                  fontSize: "0.8rem", color: "white",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  outline: "none", transition: "border-color 0.15s, background-color 0.15s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#D4AF37"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; }}
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex" }}>
                  <X style={{ width: 13, height: 13 }} />
                </button>
              )}
              {search.trim() && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, backgroundColor: "white", border: "1px solid #E8E4DC", borderRadius: 12, boxShadow: "0 8px 24px rgba(13,27,53,0.15)", zIndex: 50, overflow: "hidden" }}>
                  <button type="submit"
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", fontSize: "0.8rem", color: "#334155", backgroundColor: "transparent", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "left" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F6F5F0"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <Search style={{ width: 13, height: 13, color: "#94a3b8", flexShrink: 0 }} />
                    <span>Buscar <strong style={{ color: "#0d1b35" }}>"{search.trim()}"</strong></span>
                  </button>
                </div>
              )}
            </form>

            <nav className="hidden md:flex" style={{ alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      position: "relative", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 2, padding: "6px 14px",
                      borderRadius: 10, border: "none", cursor: "pointer",
                      backgroundColor: "transparent",
                      color: active ? "white" : "rgba(255,255,255,0.55)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      minWidth: 60, transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                  >
                    <div style={{ position: "relative" }}>
                      <Icon style={{ width: 18, height: 18 }} />
                      {"badge" in item && (item.badge ?? 0) > 0 && (
                        <span style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, backgroundColor: "#ef4444", color: "white", fontWeight: 700, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", border: "2px solid #0d1b35" }}>
                          {(item.badge ?? 0) > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.65rem", fontWeight: active ? 700 : 500 }}>{item.label}</span>
                    {active && (
                      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 20, height: 2, backgroundColor: "#D4AF37", borderRadius: 1 }} />
                    )}
                  </button>
                );
              })}
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>

<UserDropdown onLogout={handleLogout} />
            </div>
          </div>

        </header>

        <main style={{ paddingTop: 56, paddingBottom: 64, minHeight: "100vh" }} className="md:pb-0">
          <Outlet />
        </main>

        <nav
          className="md:hidden"
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            backgroundColor: "#0d1b35",
            borderTop: "1px solid rgba(212,175,55,0.3)",
            zIndex: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "stretch", justifyContent: "space-around" }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const displayLabel = ("mobileLabel" in item ? item.mobileLabel : undefined) ?? item.label;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 3, flex: 1, padding: "10px 4px",
                    position: "relative", border: "none", cursor: "pointer",
                    backgroundColor: "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.4)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "color 0.15s",
                  }}
                >
                  {active && (
                    <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 24, height: 2, backgroundColor: "#D4AF37", borderRadius: "0 0 2px 2px" }} />
                  )}
                  <div style={{
                    padding: "5px 8px", borderRadius: 9,
                    backgroundColor: active ? "rgba(212,175,55,0.15)" : "transparent",
                    border: active ? "1px solid rgba(212,175,55,0.25)" : "1px solid transparent",
                    transition: "all 0.15s",
                  }}>
                    <Icon style={{ width: 18, height: 18, color: active ? "#D4AF37" : "rgba(255,255,255,0.5)" }} />
                  </div>
                  <span style={{ fontSize: "0.57rem", fontWeight: active ? 700 : 500, letterSpacing: "0.01em" }}>
                    {displayLabel}
                  </span>
                  {"badge" in item && (item.badge ?? 0) > 0 && !active && (
                    <span style={{ position: "absolute", top: 8, right: "14%", width: 16, height: 16, backgroundColor: "#ef4444", color: "white", fontWeight: 700, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", border: "2px solid #0d1b35" }}>
                      {(item.badge ?? 0) > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

      </div>
    </PerfilProvider>
  );
}
