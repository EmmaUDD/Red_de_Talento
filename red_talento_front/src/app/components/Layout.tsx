import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { PerfilProvider } from "@/app/context/PerfilContext";
import { docenteApi, reportesApi } from "@/api/api";
import {
  Home, User, Briefcase, ClipboardCheck, BarChart2,
  Plus, Search, Sparkles, Award, LogOut, Building2,
  GraduationCap, BookOpen, Settings, ChevronDown, Bell,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navByRole = {
  student: [
    { path: "/inicio", label: "Inicio", icon: Home },
    { path: "/perfil", label: "Mi Perfil", icon: User, mobileLabel: "Perfil" },
    { path: "/empleos", label: "Empleos", icon: Briefcase },
    { path: "/busqueda", label: "Buscar", icon: Search },
  ],
  teacher: [
    { path: "/inicio", label: "Inicio", icon: Home },
    { path: "/perfil-docente", label: "Mi Perfil", icon: User, mobileLabel: "Perfil" },
    { path: "/validacion", label: "Administración", icon: ClipboardCheck, mobileLabel: "Admin" },
    { path: "/estadisticas", label: "Estadísticas", icon: BarChart2, mobileLabel: "Stats" },
    { path: "/busqueda", label: "Buscar", icon: Search },
  ],
  company: [
    { path: "/inicio", label: "Inicio", icon: Home },
    { path: "/perfil-empresa", label: "Mi Perfil", icon: User, mobileLabel: "Perfil" },
    { path: "/publicar", label: "Publicar", icon: Plus },
    { path: "/buscar", label: "Buscar", icon: Search },
    { path: "/recomendaciones", label: "Para ti", icon: Sparkles, mobileLabel: "Para ti" },
  ],
};

const roleMeta = {
  student: { label: "Estudiante", icon: GraduationCap, bg: "bg-blue-50", text: "text-blue-700" },
  teacher: { label: "Docente", icon: BookOpen, bg: "bg-green-50", text: "text-green-700" },
  company: { label: "Empresa", icon: Building2, bg: "bg-amber-50", text: "text-amber-700" },
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

  const profileRoute =
    user.role === "student" ? "/perfil"
    : user.role === "teacher" ? "/perfil-docente"
    : "/perfil-empresa";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
      >
        {user.foto_perfil ? (
          <img src={user.foto_perfil} className="w-8 h-8 rounded-lg object-cover border border-slate-200" alt={fullName} />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
            <MetaIcon className="w-4 h-4 text-slate-600" />
          </div>
        )}
        <div className="hidden lg:block text-left">
          <p className="text-slate-900 text-xs font-semibold leading-tight">{firstName}</p>
          <span className={`text-xs font-medium ${meta.text}`}>{meta.label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden lg:block ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-slate-900 text-sm font-semibold">{fullName}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${meta.bg} ${meta.text}`}>
                <MetaIcon className="w-3 h-3" />
                {meta.label}
              </span>
            </div>

            <div className="py-1">
              <button
                onClick={() => { navigate(profileRoute); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Mi Perfil
              </button>
              <button
                onClick={() => { navigate(profileRoute); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Configuración
              </button>
            </div>
            <div className="py-1 border-t border-slate-100">
              <button
                onClick={() => { onLogout(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
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
  const [mobileSearch, setMobileSearch] = useState(false);
  const [adminBadge, setAdminBadge] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role !== "teacher") return;
    Promise.all([
      docenteApi.getSolicitudes().catch(() => []),
      reportesApi.getAll().catch(() => []),
    ]).then(([sols, reps]) => {
      const pendientesSols = sols.filter((s) => s.estado === "pendiente").length;
      const pendientesReps = reps.filter((r) => r.estado === "pendiente").length;
      setAdminBadge(pendientesSols + pendientesReps);
    });
  }, [user?.role]);

  useEffect(() => {
    if (location.pathname === "/busqueda") setSearch("");
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearch("");
      }
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/busqueda?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <PerfilProvider>
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 h-14">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-3">
          <button
            onClick={() => navigate("/inicio")}
            className="flex items-center gap-2 flex-shrink-0 mr-2"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Award className="w-4 h-4" style={{ color: "#D4AF37" }} />
            </div>
            <span className="text-slate-900 text-sm font-bold hidden sm:block">
              Red Talento <span style={{ color: "#D4AF37" }}>Caro</span>
            </span>
          </button>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-sm relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar estudiantes, empresas, docentes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 border border-transparent rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {search.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>Buscar <strong>"{search.trim()}"</strong></span>
                </button>
              </div>
            )}
          </form>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs transition-all ${
                    active
                      ? "text-slate-900 bg-slate-100 font-bold"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                  }`}
                  style={{ minWidth: "64px" }}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {"badge" in item && (item.badge ?? 0) > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white font-bold rounded-full flex items-center justify-center" style={{ fontSize: "0.55rem" }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                  {active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-slate-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setMobileSearch(!mobileSearch)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            <UserDropdown onLogout={handleLogout} />
          </div>
        </div>

        <AnimatePresence>
          {mobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-100 bg-white px-4 py-2 overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-slate-100 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-14 pb-16 md:pb-0 min-h-screen">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20 safe-area-inset-bottom">
        <div className="flex items-stretch justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const displayLabel = ("mobileLabel" in item ? item.mobileLabel : undefined) ?? item.label;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-3 relative transition-colors ${
                  active ? "text-slate-900" : "text-slate-400"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-slate-900 shadow-sm" : ""}`}>
                  <Icon className={`w-5 h-5 ${active ? "text-white" : ""}`} />
                </div>
                <span
                  className={active ? "font-bold" : "font-medium"}
                  style={{ fontSize: "0.58rem", letterSpacing: "0.01em" }}
                >
                  {displayLabel}
                </span>
                {"badge" in item && (item.badge ?? 0) > 0 && !active && (
                  <span className="absolute top-2 right-[12%] w-4 h-4 bg-red-500 text-white font-bold rounded-full flex items-center justify-center" style={{ fontSize: "0.5rem" }}>
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
