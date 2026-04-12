
    const { useState, useEffect, useContext, createContext, useCallback, useRef } = React;

    // ─── API ────────────────────────────────────────────────────────────────
    const BASE = 'http://localhost:8000/api';
    const MEDIA_BASE = 'http://localhost:8000';
    const getImgUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      return `${MEDIA_BASE}${path}`;
    };

    const api = {
      async req(method, path, body, token, isFormData = false) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (!isFormData) headers['Content-Type'] = 'application/json';
        const res = await fetch(`${BASE}${path}`, {
          method,
          headers,
          body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
        });
        if (!res.ok) {
          let err;
          try { err = await res.json(); } catch { err = { detail: 'Error del servidor' }; }
          throw err;
        }
        if (res.status === 204) return null;
        return res.json();
      },
      login: (d) => api.req('POST', '/login/', d),
      refreshToken: (r) => api.req('POST', '/token/refresh/', { refresh: r }),
      registerStudent: (d) => api.req('POST', '/registro/estudiante/', d),
      registerTeacher: (d) => api.req('POST', '/registro/docente/', d),
      registerCompany: (d) => api.req('POST', '/registro/empresa/', d),
      getProfile: (role, id, t) => api.req('GET', `/perfil/${role}/${id}/`, null, t),
      updateProfile: (role, id, d, t, isFD = false) => api.req('PATCH', `/perfil/${role}/${id}/`, d, t, isFD),
      getFeed: (t) => api.req('GET', '/feed/', null, t),
      createPost: (d, t, isFD = false) => api.req('POST', '/feed/', d, t, isFD),
      deletePost: (id, t) => api.req('DELETE', `/feed/${id}/`, null, t),
      getMisPublicaciones: (userId, t) => api.req('GET', `/feed/?autor_id=${userId}`, null, t),
      getOfertas: (t) => api.req('GET', '/ofertas/', null, t),
      createOferta: (d, t) => api.req('POST', '/ofertas/', d, t),
      postular: (d, t) => api.req('POST', '/postulaciones/', d, t),
      getPostulaciones: (ofertaId, t) => api.req('GET', `/postulaciones/oferta/${ofertaId}/`, null, t),
      getMisPostulaciones: (t) => api.req('GET', '/postulaciones/', null, t),
      updatePostulacion: (id, d, t) => api.req('PATCH', `/postulaciones/${id}/`, d, t),
      getHabilidades: (t) => api.req('GET', '/habilidades/', null, t),
      createHabilidad: (d, t) => api.req('POST', '/habilidades/', d, t),
      validarHabilidad: (id, d, t) => api.req('PATCH', `/habilidades/${id}/validar/`, d, t),
      getEvidencias: (studentId, t) => api.req('GET', `/evidencias/estudiante/${studentId}/`, null, t),
      subirEvidencia: (d, t) => api.req('POST', '/evidencias/', d, t, true),
      getEstudiantesList: (params, t) => api.req('GET', `/estudiantes/${params || ''}`, null, t),
      activarEstudiante: (id, t) => api.req('PATCH', `/estudiantes/${id}/activar/`, {}, t),
      getEmpresas: (params, t) => api.req('GET', `/empresas/${params || ''}`, null, t),
      getEstadisticas: (t) => api.req('GET', '/estadisticas/', null, t),
      getDisponibilidad: (t) => api.req('GET', '/disponibilidad/', null, t),
      createDisponibilidad: (d, t) => api.req('POST', '/disponibilidad/', d, t),
      deleteDisponibilidad: (id, t) => api.req('DELETE', `/disponibilidad/${id}/`, null, t),
      getReportes: (t) => api.req('GET', '/reporte/', null, t),
      createReporte: (d, t) => api.req('POST', '/reporte/', d, t),
      updateReporte: (id, d, t) => api.req('PATCH', `/reporte/${id}/`, d, t),
      getQR: (studentId, t) => `${BASE}/perfil/estudiante/${studentId}/qr/`,
    };

    // ─── Auth Context ────────────────────────────────────────────────────────
    const AuthCtx = createContext(null);
    function AuthProvider({ children }) {
      const [auth, setAuth] = useState(() => {
        try {
          const s = localStorage.getItem('rtc_auth');
          return s ? JSON.parse(s) : null;
        } catch { return null; }
      });
      const [toast, setToast] = useState([]);

      const addToast = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToast(t => [...t, { id, msg, type }]);
        setTimeout(() => setToast(t => t.filter(x => x.id !== id)), 3500);
      }, []);

      const login = useCallback(async (username, password) => {
        const data = await api.login({ username, password });
        const newAuth = { ...data, username };
        setAuth(newAuth);
        localStorage.setItem('rtc_auth', JSON.stringify(newAuth));
        return newAuth;
      }, []);

      const logout = useCallback(() => {
        setAuth(null);
        localStorage.removeItem('rtc_auth');
      }, []);

      const updateAuth = useCallback((updates) => {
        setAuth(prev => {
          const next = { ...prev, ...updates };
          localStorage.setItem('rtc_auth', JSON.stringify(next));
          return next;
        });
      }, []);

      return (
        <AuthCtx.Provider value={{ auth, login, logout, updateAuth, addToast }}>
          {children}
          <div className="toast-container">
            {toast.map(t => (
              <div key={t.id} className={`toast toast-${t.type}`}>
                {t.type === 'success'
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
                }
                {t.msg}
              </div>
            ))}
          </div>
        </AuthCtx.Provider>
      );
    }
    const useAuth = () => useContext(AuthCtx);

    // ─── Icons (using lucide UMD globals) ────────────────────────────────────
    const Icon = ({ name, size = 16, color, ...rest }) => {
      const icons = {
        Award: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
        Home: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        User: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        Briefcase: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
        ClipboardCheck: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>`,
        BarChart2: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`,
        Plus: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
        Search: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
        LogOut: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
        Send: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
        CheckCircle: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
        Eye: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
        Trash2: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
        Edit: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
        X: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
        Star: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        Shield: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        Flag: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
        Bell: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
        TrendingUp: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
        MapPin: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
        Building2: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`,
        GraduationCap: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
        BookOpen: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
        Wrench: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
        Upload: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`,
        ArrowRight: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
        EyeOff: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`,
        QrCode: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>`,
        Clock: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
        Info: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
        ChevronDown: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
        Save: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
        Filter: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
        Sparkles: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
        AlertCircle: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
        ThumbsUp: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>`,
        Link2: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>`,
        UserCheck: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
        Bookmark: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
        Heart: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
        MessageSquare: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        Ban: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>`,
        Sun: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`,
        Moon: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
      };
      return <span dangerouslySetInnerHTML={{ __html: icons[name] || '' }} style={{ display: 'inline-flex', alignItems: 'center' }} />;
    };

    // ─── Small shared components ─────────────────────────────────────────────
    function Spinner({ size = 24 }) {
      return <div className="spinner" style={{ width: size, height: size }} />;
    }

    function RoleBadge({ role }) {
      const map = {
        estudiante: ['badge-blue', 'Estudiante'],
        docente: ['badge-green', 'Docente'],
        empresa: ['badge-amber', 'Empresa'],
      };
      const [cls, label] = map[role] || ['badge-gray', role];
      return <span className={`badge ${cls}`}>{label}</span>;
    }

    function SkillLevelBadge({ level }) {
      const map = { Alto: ['badge-green', 'Alto'], Medio: ['badge-amber', 'Medio'], Bajo: ['badge-red', 'Bajo'], Aprobado: ['badge-green', 'Aprobado'], Rechazado: ['badge-red', 'Rechazado'], Pendiente: ['badge-gray', 'Pendiente'] };
      const [cls, lbl] = map[level] || ['badge-gray', level];
      return <span className={`badge ${cls}`}>{lbl}</span>;
    }

    function EmptyState({ title, sub, icon = 'Search' }) {
      return (
        <div className="empty">
          <Icon name={icon} size={36} color="var(--slate-300)" />
          <h3 style={{ marginTop: 12 }}>{title}</h3>
          <p>{sub}</p>
        </div>
      );
    }

    // ─── Page Router (simple hash-based) ─────────────────────────────────────
    function useRoute() {
      const [route, setRoute] = useState(window.location.hash.slice(1) || '/login');
      useEffect(() => {
        const handler = () => setRoute(window.location.hash.slice(1) || '/login');
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
      }, []);
      const navigate = useCallback((r) => { window.location.hash = r; }, []);
      return { route, navigate };
    }

    // ─── Login Page ───────────────────────────────────────────────────────────
    function LoginPage({ navigate }) {
      const { login, addToast } = useAuth();
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [showPass, setShowPass] = useState(false);
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) return;
        setLoading(true);
        try {
          await login(username, password);
          navigate('/inicio');
        } catch (err) {
          addToast(err?.detail || 'Usuario o contraseña incorrectos', 'error');
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="login-page">
          <div className="login-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
              <div className="logo-icon"><Icon name="Award" size={20} color="#D4AF37" /></div>
              <div>
                <div className="logo-text">Red Talento <span style={{ color: '#D4AF37' }}>Caro</span></div>
                <div className="logo-sub">Liceo Cardenal Caro · Lo Espejo</div>
              </div>
            </div>
            <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: '2.4rem', color: 'white', lineHeight: 1.15, marginBottom: 16 }}>
              Tu oficio tiene<br /><span style={{ color: '#D4AF37' }}>valor real.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', lineHeight: 1.7, maxWidth: 380, marginBottom: 40 }}>
              Plataforma que conecta el talento técnico validado del Liceo Cardenal Caro con empleadores locales.
            </p>
            {['Perfil validado institucionalmente', 'Insignias por competencias reales', 'Acceso directo a empleos locales', 'Datos y privacidad protegidos'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.6)', fontSize: '.85rem', marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37', flexShrink: 0 }} />{f}
              </div>
            ))}
          </div>
          <div className="login-right">
            <div className="login-card fade-in">
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>Bienvenido/a</h2>
              <p style={{ color: 'var(--slate-500)', fontSize: '.85rem', marginBottom: 24 }}>Ingresa con tu cuenta institucional</p>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <label className="label">Usuario</label>
                  <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="tu_usuario" autoFocus />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="label">Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}>
                      <Icon name={showPass ? 'EyeOff' : 'Eye'} size={15} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', color: 'var(--slate-400)', marginBottom: 16 }}>
                  <Icon name="Shield" size={13} /> Acceso gestionado por el Liceo Cardenal Caro
                </div>
                <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ borderRadius: 12, padding: '12px' }}>
                  {loading ? <Spinner size={16} /> : <><span>Ingresar</span><Icon name="ArrowRight" size={15} /></>}
                </button>
              </form>
              <p style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--slate-500)', marginTop: 20 }}>
                ¿Sin cuenta? <button onClick={() => navigate('/register')} style={{ color: 'var(--navy)', fontWeight: 700, fontSize: '.8rem' }}>Solicitar acceso</button>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ─── Register Page ────────────────────────────────────────────────────────
    function RegisterPage({ navigate }) {
      const { addToast } = useAuth();
      const [step, setStep] = useState('role');
      const [role, setRole] = useState('estudiante');
      const [loading, setLoading] = useState(false);
      const [done, setDone] = useState(false);
      const [form, setForm] = useState({ username: '', password: '', email: '', first_name: '', last_name: '', especialidad: '', grado: '', departamento: '', bio: '', nombre_empresa: '', industria: '', rut: '' });
      const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

      const roles = [
        { id: 'estudiante', label: 'Estudiante / Egresado', desc: '4° Medio TP, EPJA o exalumno del Liceo' },
        { id: 'docente', label: 'Docente / Directivo', desc: 'Personal del Liceo Cardenal Caro' },
        { id: 'empresa', label: 'Empresa', desc: 'Empleador que busca talento técnico' },
      ];

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          const base = { username: form.username, password: form.password, email: form.email, first_name: form.first_name, last_name: form.last_name };
          if (role === 'estudiante') await api.registerStudent({ ...base, especialidad: form.especialidad, grado: form.grado });
          else if (role === 'docente') await api.registerTeacher({ ...base, departamento: form.departamento, bio: form.bio });
          else await api.registerCompany({ ...base, nombre_empresa: form.nombre_empresa, industria: form.industria, rut: form.rut });
          setDone(true);
        } catch (err) {
          addToast(Object.values(err).flat().join(' ') || 'Error al registrar', 'error');
        } finally { setLoading(false); }
      };

      if (done) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
          <div className="card card-p fade-in" style={{ maxWidth: 380, textAlign: 'center', padding: 40 }}>
            <div style={{ width: 56, height: 56, background: '#D1FAE5', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="CheckCircle" size={28} color="#16A34A" />
            </div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Solicitud enviada</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '.85rem', marginBottom: 24 }}>Tu solicitud fue enviada. Recibirás un correo cuando sea aprobada por el Liceo Cardenal Caro.</p>
            <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>Volver al inicio</button>
          </div>
        </div>
      );

      return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card card-p fade-in" style={{ width: '100%', maxWidth: 440 }}>
            <button onClick={() => step === 'form' ? setStep('role') : navigate('/login')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--slate-500)', fontSize: '.82rem', marginBottom: 20 }}>
              ← Atrás
            </button>
            {step === 'role' ? (
              <>
                <h2 style={{ fontWeight: 800, marginBottom: 4 }}>Crear cuenta</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '.85rem', marginBottom: 20 }}>¿Cómo te registras?</p>
                {roles.map(r => (
                  <div key={r.id} onClick={() => setRole(r.id)} style={{ border: `2px solid ${role === r.id ? 'var(--navy)' : 'var(--slate-200)'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', background: role === r.id ? 'var(--slate-100)' : 'white', transition: 'all .15s' }}>
                    <p style={{ fontWeight: 700, fontSize: '.9rem' }}>{r.label}</p>
                    <p style={{ fontSize: '.78rem', color: 'var(--slate-500)', marginTop: 2 }}>{r.desc}</p>
                  </div>
                ))}
                <button className="btn btn-primary w-full" onClick={() => setStep('form')} style={{ marginTop: 8 }}>
                  Continuar <Icon name="ArrowRight" size={15} />
                </button>
              </>
            ) : (
              <>
                <h2 style={{ fontWeight: 800, marginBottom: 4 }}>Tus datos</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '.85rem', marginBottom: 20 }}>Completa el formulario para solicitar acceso</p>
                <form onSubmit={handleSubmit}>
                  <div className="grid-2" style={{ marginBottom: 12 }}>
                    <div><label className="label">Nombre</label><input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} required /></div>
                    <div><label className="label">Apellido</label><input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} required /></div>
                  </div>
                  <div style={{ marginBottom: 12 }}><label className="label">Usuario</label><input className="input" value={form.username} onChange={e => set('username', e.target.value)} required /></div>
                  <div style={{ marginBottom: 12 }}><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
                  <div style={{ marginBottom: 12 }}><label className="label">Contraseña</label><input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
                  {role === 'estudiante' && <>
                    <div style={{ marginBottom: 12 }}><label className="label">Especialidad</label><input className="input" value={form.especialidad} onChange={e => set('especialidad', e.target.value)} /></div>
                    <div style={{ marginBottom: 12 }}><label className="label">Grado</label>
                      <select className="input" value={form.grado} onChange={e => set('grado', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {['3er_medio', '4to_medio', 'egresado', 'epja'].map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </>}
                  {role === 'docente' && <>
                    <div style={{ marginBottom: 12 }}><label className="label">Departamento</label><input className="input" value={form.departamento} onChange={e => set('departamento', e.target.value)} /></div>
                    <div style={{ marginBottom: 12 }}><label className="label">Bio</label><textarea className="input textarea" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} /></div>
                  </>}
                  {role === 'empresa' && <>
                    <div style={{ marginBottom: 12 }}><label className="label">Nombre empresa</label><input className="input" value={form.nombre_empresa} onChange={e => set('nombre_empresa', e.target.value)} /></div>
                    <div style={{ marginBottom: 12 }}><label className="label">Industria</label><input className="input" value={form.industria} onChange={e => set('industria', e.target.value)} /></div>
                    <div style={{ marginBottom: 12 }}><label className="label">RUT empresa</label><input className="input" value={form.rut} onChange={e => set('rut', e.target.value)} placeholder="76123456-7" /></div>
                  </>}
                  <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                    {loading ? <Spinner size={16} /> : 'Enviar solicitud'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      );
    }

    // ─── Topbar ───────────────────────────────────────────────────────────────
    function Topbar({ route, navigate, role, user }) {
      const { logout } = useAuth();
      const [dropdown, setDropdown] = useState(false);

      useEffect(() => {
        const handleClickOutside = (e) => {
          if (!e.target.closest('.user-dropdown')) setDropdown(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
      }, []);

      const navs = {
        estudiante: [
          { path: '/inicio', label: 'Inicio', icon: 'Home' },
          { path: '/perfil', label: 'Mi Perfil', icon: 'User' },
          { path: '/empleos', label: 'Empleos', icon: 'Briefcase' },
        ],
        docente: [
          { path: '/inicio', label: 'Inicio', icon: 'Home' },
          { path: '/perfil-docente', label: 'Mi Perfil', icon: 'User' },
          { path: '/validacion', label: 'Administración', icon: 'ClipboardCheck' },
          { path: '/estadisticas', label: 'Estadísticas', icon: 'BarChart2' },
        ],
        empresa: [
          { path: '/inicio', label: 'Inicio', icon: 'Home' },
          { path: '/perfil-empresa', label: 'Mi Perfil', icon: 'User' },
          { path: '/publicar', label: 'Publicar', icon: 'Plus' },
          { path: '/buscar', label: 'Buscar Talento', icon: 'Search' },
        ],
      };

      const items = navs[role] || navs.estudiante;
      const avatar = user?.nombre_empresa || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || '?';
      const roleName = role === 'empresa' ? 'Empresa' : role === 'docente' ? 'Docente' : 'Estudiante';

      const [isDark, setIsDark] = useState(() => document.body.classList.contains('theme-dark'));

      const toggleTheme = () => {
        if (isDark) {
          document.body.classList.remove('theme-dark');
          localStorage.setItem('theme', 'light');
          setIsDark(false);
        } else {
          document.body.classList.add('theme-dark');
          localStorage.setItem('theme', 'dark');
          setIsDark(true);
        }
      };

      return (
        <div className="topbar">
          <div className="topbar-inner">
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/inicio')}>
              <div className="logo-icon" style={{ background: '#1E293B' }}><Icon name="Award" size={18} color="#D4AF37" /></div>
              <div style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '.95rem' }}>Red Talento <span style={{ color: '#D4AF37' }}>Caro</span></div>
            </div>

            {/* Search */}
            <div className="top-search">
              <Icon name="Search" size={15} color="var(--slate-400)" />
              <input placeholder="Buscar estudiantes, empleos, empresas..." />
            </div>

            {/* Nav & User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: '100%' }}>
              <div className="top-nav-wrap">
                {items.map(it => (
                  <div key={it.path} className={`top-nav-item${route === it.path ? ' active' : ''}`} onClick={() => navigate(it.path)}>
                    <Icon name={it.icon} size={18} />
                    {it.label}
                  </div>
                ))}
              </div>

              <div style={{ width: 1, height: 24, background: 'var(--slate-200)' }} />

              <button className="btn-ghost" style={{ padding: 6, borderRadius: '50%', color: 'var(--slate-500)' }} onClick={toggleTheme}>
                <Icon name={isDark ? "Sun" : "Moon"} size={18} />
              </button>

              <button className="btn-ghost" style={{ padding: 6, borderRadius: '50%', color: 'var(--slate-500)', position: 'relative' }}>
                <Icon name="Bell" size={18} />
                <span style={{ position: 'absolute', top: 4, right: 6, width: 6, height: 6, background: '#EF4444', borderRadius: '50%' }} />
              </button>

              <div className="user-dropdown">
                <div className="user-chip" onClick={() => setDropdown(!dropdown)}>
                  <div className="user-chip-avatar" style={{ overflow: 'hidden' }}>
                    {user?.foto_perfil ? (
                      <img src={getImgUrl(user.foto_perfil)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Icon name={role === 'empresa' ? 'Building2' : role === 'docente' ? 'BookOpen' : 'GraduationCap'} size={14} color="var(--slate-500)" />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span className="user-chip-name">{avatar}</span>
                    <span className="user-chip-role" style={{ color: 'var(--slate-500)' }}>{roleName}</span>
                  </div>
                  <Icon name="ChevronDown" size={14} color="var(--slate-400)" />
                </div>

                {dropdown && (
                  <div className="dropdown-menu">
                    <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
                      <Icon name="LogOut" size={14} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ─── Home Feed ────────────────────────────────────────────────────────────
    function HomePage({ token, role, user }) {
      const { addToast } = useAuth();
      const [posts, setPosts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [text, setText] = useState('');
      const [posting, setPosting] = useState(false);
      const [file, setFile] = useState(null);

      useEffect(() => {
        api.getFeed(token).then(d => { setPosts(Array.isArray(d) ? d : d?.results || []); setLoading(false); }).catch(() => setLoading(false));
      }, [token]);

      const handlePost = async () => {
        if (!text.trim() && !file) return;
        setPosting(true);
        try {
          const fd = new FormData();
          fd.append('tipo', 'post');
          fd.append('contenido', text);
          if (file) fd.append('imagen', file);
          const p = await api.createPost(fd, token, true);
          setPosts(prev => [p, ...prev]);
          setText('');
          setFile(null);
          addToast('Publicación creada exitosamente');
        } catch { addToast('Error al publicar', 'error'); }
        finally { setPosting(false); }
      };

      const handleDelete = async (id) => {
        try {
          await api.deletePost(id, token);
          setPosts(prev => prev.filter(p => p.id !== id));
          addToast('Publicación eliminada');
        } catch { addToast('Error al eliminar', 'error'); }
      };

      const displayName = user?.nombre_empresa || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || '';

      return (
        <div className="page fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Welcome */}
              <div className="card card-p" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="avatar-placeholder" style={{ width: 44, height: 44 }}>
                  <Icon name={role === 'empresa' ? 'Building2' : role === 'docente' ? 'BookOpen' : 'GraduationCap'} size={20} color="var(--slate-400)" />
                </div>
                <div>
                  <p style={{ fontWeight: 700 }}>Hola, {displayName.split(' ')[0] || 'Usuario'}</p>
                  <p style={{ fontSize: '.8rem', color: 'var(--slate-500)', marginTop: 2 }}>
                    {role === 'estudiante' ? `${user?.especialidad || ''} · ${user?.grado || ''}` : role === 'docente' ? `Docente · ${user?.departamento || ''}` : user?.nombre_empresa || ''}
                  </p>
                </div>
                {user?.validado && <span className="badge badge-gold" style={{ marginLeft: 'auto' }}><Icon name="CheckCircle" size={12} color="#D4AF37" /> Validado</span>}
              </div>

              {/* Composer */}
              <div className="composer">
                <textarea className="input textarea" rows={3} placeholder={role === 'estudiante' ? 'Comparte tu avance, proyecto o logro...' : role === 'docente' ? 'Publica un anuncio para la comunidad...' : 'Publica una oferta o novedad...'} value={text} onChange={e => setText(e.target.value)} style={{ marginBottom: 10 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="file" id="post-img" className="hidden" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                    <label htmlFor="post-img" className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                      <Icon name="Upload" size={13} /> {file ? 'Cambiar imagen' : 'Añadir imagen'}
                    </label>
                    {file && <span style={{ fontSize: '.75rem', color: 'var(--slate-500)' }}>{file.name}</span>}
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={handlePost} disabled={(!text.trim() && !file) || posting}>
                    {posting ? <Spinner size={14} /> : <><Icon name="Send" size={13} /> Publicar</>}
                  </button>
                </div>
              </div>

              {/* Posts */}
              {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div> :
                posts.length === 0 ? <EmptyState title="Sin publicaciones aún" sub="Sé el primero en publicar algo" icon="Send" /> :
                  posts.map(post => <PostCard key={post.id} post={post} onDelete={handleDelete} currentRole={role} />)}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {role === 'estudiante' && <StudentSidePanel token={token} />}
              {role === 'docente' && <TeacherSidePanel token={token} />}
              {role === 'empresa' && <CompanySidePanel token={token} />}
            </div>
          </div>
        </div>
      );
    }

    function PostCard({ post, onDelete, currentRole }) {
      const author = post.autor_nombre || post.autor?.username || 'Usuario';
      const authorRole = post.autor_role || post.autor?.role || '';
      return (
        <div className="post-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar-placeholder" style={{ width: 36, height: 36 }}>
                <Icon name={authorRole === 'empresa' ? 'Building2' : authorRole === 'docente' ? 'BookOpen' : 'GraduationCap'} size={16} color="var(--slate-400)" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '.88rem' }}>{author}</p>
                <p style={{ fontSize: '.72rem', color: 'var(--slate-400)', marginTop: 2 }}>
                  {post.fecha_creacion ? new Date(post.fecha_creacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : ''}
                  {authorRole && <> · <RoleBadge role={authorRole} /></>}
                </p>
              </div>
            </div>
            {(currentRole === 'docente' || post.es_propio) && (
              <button className="btn btn-ghost" onClick={() => onDelete(post.id)} style={{ padding: 6 }}>
                <Icon name="Trash2" size={14} color="var(--slate-400)" />
              </button>
            )}
          </div>
          <p style={{ fontSize: '.88rem', lineHeight: 1.65, color: 'var(--slate-700)', marginTop: 12 }}>{post.contenido}</p>
          {post.imagen && (
            <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <img src={getImgUrl(post.imagen)} style={{ width: '100%', display: 'block' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--slate-100)' }}>
            <button className="btn btn-ghost" style={{ gap: 5, color: 'var(--slate-500)', fontSize: '.78rem', padding: '4px 0' }}>
              <Icon name="Heart" size={13} /> Me gusta
            </button>
            <button className="btn btn-ghost" style={{ gap: 5, color: 'var(--slate-500)', fontSize: '.78rem', padding: '4px 0' }}>
              <Icon name="MessageSquare" size={13} /> Comentar
            </button>
          </div>
        </div>
      );
    }

    function StudentSidePanel({ token }) {
      const [ofertas, setOfertas] = useState([]);
      useEffect(() => { api.getOfertas(token).then(d => setOfertas(Array.isArray(d) ? d : d?.results || [])).catch(() => { }); }, [token]);
      return (
        <>
          <div className="card card-p">
            <p style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="User" size={14} color="var(--slate-500)" />Tu perfil
            </p>
            <div style={{ fontSize: '.75rem', color: 'var(--slate-500)', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Completitud</span><span style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>72%</span>
            </div>
            <div className="skill-bar-track" style={{ marginBottom: 16 }}>
              <div className="skill-bar-fill" style={{ width: '72%', background: 'var(--gold)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', padding: '8px 0', borderBottom: '1px solid var(--slate-100)' }}>
              <span style={{ color: 'var(--slate-500)' }}>Vistas esta semana</span><span style={{ fontWeight: 700 }}>14</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', padding: '8px 0' }}>
              <span style={{ color: 'var(--slate-500)' }}>Empresas te guardaron</span><span style={{ fontWeight: 700 }}>3</span>
            </div>
          </div>

          <div className="card card-p">
            <p style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="TrendingUp" size={14} color="var(--slate-500)" /> Empleos recomendados
            </p>
            {ofertas.slice(0, 3).map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingBottom: 8, marginBottom: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--slate-300)', flexShrink: 0, marginTop: 7 }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--slate-500)' }}>{o.titulo} · {o.empresa_nombre || 'Empresa'}</p>
                </div>
              </div>
            ))}
            {ofertas.length === 0 && <p style={{ fontSize: '.8rem', color: 'var(--slate-400)' }}>Sin ofertas disponibles</p>}
          </div>
        </>
      );
    }

    function TeacherSidePanel({ token }) {
      const [estuds, setEstuds] = useState([]);
      useEffect(() => { api.getEstudiantesList('', token).then(d => setEstuds(Array.isArray(d) ? d : d?.results || [])).catch(() => { }); }, [token]);
      const pending = estuds.filter(e => !e.activo);
      return (
        <div className="card card-p">
          <p style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 12 }}>Resumen</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', padding: '8px 0', borderBottom: '1px solid var(--slate-100)' }}>
            <span style={{ color: 'var(--slate-500)' }}>Total estudiantes</span>
            <span style={{ fontWeight: 700 }}>{estuds.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', padding: '8px 0' }}>
            <span style={{ color: 'var(--slate-500)' }}>Pendientes activación</span>
            <span style={{ fontWeight: 700, color: 'var(--amber)' }}>{pending.length}</span>
          </div>
        </div>
      );
    }

    function CompanySidePanel({ token }) {
      const [ofertas, setOfertas] = useState([]);
      useEffect(() => { api.getOfertas(token).then(d => setOfertas(Array.isArray(d) ? d : d?.results || [])).catch(() => { }); }, [token]);
      return (
        <div className="card card-p">
          <p style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 12 }}>Mis ofertas activas</p>
          {ofertas.slice(0, 3).map(o => (
            <div key={o.id} style={{ marginBottom: 8, padding: '8px', borderRadius: 8, background: 'var(--slate-100)' }}>
              <p style={{ fontWeight: 600, fontSize: '.82rem' }}>{o.titulo}</p>
              <p style={{ fontSize: '.72rem', color: 'var(--slate-500)', marginTop: 2 }}>{o.especialidad_requerida}</p>
            </div>
          ))}
          {ofertas.length === 0 && <p style={{ fontSize: '.8rem', color: 'var(--slate-400)' }}>Sin ofertas publicadas</p>}
        </div>
      );
    }

    // ─── Student Profile ──────────────────────────────────────────────────────
    function StudentProfilePage({ token, userId }) {
      const { updateAuth, addToast } = useAuth();
      const [profile, setProfile] = useState(null);
      const [loading, setLoading] = useState(true);
      const [editing, setEditing] = useState(false);
      const [form, setForm] = useState({});
      const [newSkill, setNewSkill] = useState({ nombre: '', nivel: 'Medio' });
      const [addingSkill, setAddingSkill] = useState(false);
      const [habilidades, setHabilidades] = useState([]);
      const [tab, setTab] = useState('perfil');
      const [evidencias, setEvidencias] = useState([]);
      const [misPublicaciones, setMisPublicaciones] = useState([]);
      const [qrModal, setQrModal] = useState(false);

      useEffect(() => {
        const load = async () => {
          try {
            const p = await api.getProfile('estudiante', userId, token);
            setProfile(p);
            setForm({ first_name: p.user?.first_name || '', last_name: p.user?.last_name || '', email: p.user?.email || '', especialidad: p.especialidad || '', grado: p.grado || '', video_pitch: p.video_pitch || '' });
          } catch (e) { addToast('Error al cargar perfil', 'error'); }
          finally { setLoading(false); }
        };
        const loadHab = async () => {
          try {
            const h = await api.getProfile('estudiante', userId, token);
            // habilidades come from profile
          } catch { }
        };
        load();
        api.getEvidencias(userId, token).then(d => setEvidencias(Array.isArray(d) ? d : d?.results || [])).catch(() => { });
        api.getMisPublicaciones(userId, token).then(d => setMisPublicaciones(Array.isArray(d) ? d : d?.results || [])).catch(() => { });
      }, [userId, token]);

      const handleSave = async () => {
        try {
          const updated = await api.updateProfile('estudiante', userId, form, token);
          setProfile(p => ({ ...p, ...updated }));
          setEditing(false);
          addToast('Perfil actualizado');
        } catch { addToast('Error al guardar', 'error'); }
      };

      const handleAddSkill = async () => {
        if (!newSkill.nombre) return;
        setAddingSkill(true);
        try {
          await api.createHabilidad({ nombre: newSkill.nombre, nivel: newSkill.nivel, estudiante: userId }, token);
          addToast('Habilidad enviada para validación');
          setNewSkill({ nombre: '', nivel: 'Medio' });
          // refresh profile
          const p = await api.getProfile('estudiante', userId, token);
          setProfile(p);
        } catch (e) { addToast('Error al agregar habilidad', 'error'); }
        finally { setAddingSkill(false); }
      };

      if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner /></div>;
      if (!profile) return <div className="page"><EmptyState title="Perfil no encontrado" sub="No pudimos cargar tu perfil" icon="AlertCircle" /></div>;

      const skills = profile.habilidades || [];
      const displayName = `${profile.user?.first_name || ''} ${profile.user?.last_name || ''}`.trim() || profile.user?.username || 'Estudiante';

      return (
        <div className="page fade-in">
          {/* Hero */}
          <div className="profile-hero" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="avatar-placeholder" style={{ width: 64, height: 64, background: 'rgba(255,255,255,.08)', borderRadius: 16, overflow: 'hidden' }}>
                  {profile.user?.foto_perfil ? (
                    <img src={getImgUrl(profile.user.foto_perfil)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Icon name="GraduationCap" size={28} color="rgba(255,255,255,.4)" />
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem' }}>{displayName}</h1>
                    {profile.activo && <span className="badge badge-gold"><Icon name="CheckCircle" size={11} color="#D4AF37" /> Activo</span>}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.85rem', marginTop: 4 }}>{profile.especialidad} · {profile.grado}</p>
                  <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.78rem', marginTop: 2 }}>{profile.user?.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <button className="btn btn-gold btn-sm" onClick={() => setEditing(!editing)} style={{ width: '100%', justifyContent: 'center' }}>
                  <Icon name="Edit" size={13} /> {editing ? 'Cancelar Edición' : 'Editar Perfil'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setQrModal(true)} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', width: '100%', justifyContent: 'center' }}>
                  <Icon name="QrCode" size={13} /> Código QR
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            {['perfil', 'competencias', 'crecimiento'].map(t => (
              <div key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t === 'perfil' ? 'Perfil' : t === 'competencias' ? 'Competencias' : 'Crecimiento'}
              </div>
            ))}
          </div>

          {tab === 'perfil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card card-p">
                <p style={{ fontWeight: 700, marginBottom: 16 }}>Información básica</p>
                {editing ? (
                  <>
                    <div className="grid-2" style={{ marginBottom: 12 }}>
                      <div><label className="label">Nombre</label><input className="input" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                      <div><label className="label">Apellido</label><input className="input" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                    </div>
                    <div style={{ marginBottom: 12 }}><label className="label">Correo Electrónico</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                    <div style={{ marginBottom: 12 }}>
                      <label className="label">Especialidad</label>
                      <select className="input" value={form.especialidad} onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))}>
                        <option value="">Selecciona tu especialidad...</option>
                        {['Electricidad', 'Construcción', 'Computación e Informática', 'Mecánica Automotriz', 'Administración'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label className="label">Grado</label>
                      <select className="input" value={form.grado} onChange={e => setForm(f => ({ ...f, grado: e.target.value }))}>
                        <option value="1ro_medio">1ro Medio</option>
                        <option value="2do_medio">2do Medio</option>
                        <option value="3ro_medio">3ro Medio</option>
                        <option value="4to_medio">4to Medio</option>
                        <option value="egresado">Egresado</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: 16 }}><label className="label">Video Pitch (URL)</label><input className="input" value={form.video_pitch} onChange={e => setForm(f => ({ ...f, video_pitch: e.target.value }))} placeholder="https://youtube.com/..." /></div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <label className="label">Foto de Perfil</label>
                      <input type="file" accept="image/*" className="input" onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const fd = new FormData();
                          fd.append('foto_perfil', file);
                          api.updateProfile('estudiante', userId, fd, token, true)
                            .then(updated => {
                              setProfile(p => ({ ...p, ...updated }));
                              if (updated.user?.foto_perfil) updateAuth({ foto_perfil: updated.user.foto_perfil });
                              addToast('Foto de perfil actualizada');
                            })
                            .catch(() => addToast('Error al subir foto', 'error'));
                        }
                      }} style={{ padding: '6px 14px' }} />
                    </div>

                    <button className="btn btn-primary" onClick={handleSave}><Icon name="Save" size={14} /> Guardar Cambios</button>
                  </>
                ) : (
                  <>
                    <InfoRow label="Especialidad" value={profile.especialidad || '—'} />
                    <InfoRow label="Grado" value={profile.grado || '—'} />
                    <InfoRow label="Email" value={profile.user?.email || '—'} />
                  </>
                )}
              </div>

              <div className="card card-p">
                <p style={{ fontWeight: 700, marginBottom: 16 }}>Disponibilidad</p>
                <DisponibilidadPanel token={token} studentId={userId} disponibilidad={profile.disponibilidad_perfil} />
              </div>

              <div className="card card-p">
                <p style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="Play" size={16} /> Video-Pitch (30 seg)
                </p>
                {profile.video_pitch ? (
                  <div>
                    <div style={{ position: 'relative', width: '100%', height: 300, background: 'var(--navy)', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <a href={profile.video_pitch} target="_blank" rel="noopener" style={{ color: 'white', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="Play" size={24} color="var(--navy)" style={{ marginLeft: 4 }} />
                        </div>
                        <span style={{ fontSize: '.85rem' }}>Ver Video Externo</span>
                      </a>
                      <div style={{ position: 'absolute', top: 12, left: 12 }}>
                        <span className="badge badge-gold"><Icon name="CheckCircle" size={12} color="var(--gold-dark)" /> Validado</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState title="Sin Video Pitch" sub="Añade el link a tu video grabando tu presentación." icon="Video" />
                )}
              </div>

              <div className="card">
                <div className="card-header">Galería de Evidencias</div>
                <div className="card-p">
                  {evidencias.length === 0 ? <EmptyState title="Sin evidencias" sub="Sube fotos o proyectos para mostrar tu trabajo" icon="Upload" /> :
                    evidencias.map(e => (
                      <div key={e.id} style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--slate-100)' }}>
                        {e.imagen && <img src={getImgUrl(e.imagen)} style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover' }} />}
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '.88rem' }}>{e.titulo}</p>
                          <p style={{ fontSize: '.8rem', color: 'var(--slate-500)', marginTop: 2 }}>{e.descripcion}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <EvidenciaUpload token={token} studentId={userId} onUpload={e => setEvidencias(p => [e, ...p])} />
            </div>
          )}

          {tab === 'competencias' && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">Mis Competencias / Habilidades</div>
                <div className="card-p">
                  {skills.length === 0 ? <EmptyState title="Sin competencias" sub="Agrega tus primeras competencias técnicas" icon="Wrench" /> :
                    skills.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--slate-100)' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '.88rem' }}>{s.nombre}</p>
                          <p style={{ fontSize: '.72rem', color: 'var(--slate-400)', marginTop: 2 }}>Nivel: {s.nivel}</p>
                        </div>
                        <SkillLevelBadge level={s.estado || s.nivel} />
                      </div>
                    ))}
                </div>
              </div>
              <div className="card card-p">
                <p style={{ fontWeight: 700, marginBottom: 12 }}>Agregar competencia</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input className="input" placeholder="Nombre de la competencia" value={newSkill.nombre} onChange={e => setNewSkill(s => ({ ...s, nombre: e.target.value }))} style={{ flex: 1 }} />
                  <select className="input" value={newSkill.nivel} onChange={e => setNewSkill(s => ({ ...s, nivel: e.target.value }))} style={{ width: 120 }}>
                    <option>Bajo</option><option>Medio</option><option>Alto</option>
                  </select>
                  <button className="btn btn-primary" onClick={handleAddSkill} disabled={addingSkill || !newSkill.nombre}>
                    {addingSkill ? <Spinner size={14} /> : <Icon name="Plus" size={15} />}
                  </button>
                </div>
                <p style={{ fontSize: '.75rem', color: 'var(--slate-400)', marginTop: 8 }}>Las competencias quedan pendientes hasta ser validadas por un docente.</p>
              </div>
            </div>
          )}

          {tab === 'crecimiento' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card card-p" style={{ marginBottom: 8 }}>
                <p style={{ fontWeight: 700, marginBottom: 8, fontSize: '1.05rem', color: 'var(--navy)' }}>Tu Crecimiento en la Red</p>
                <p style={{ fontSize: '.85rem', color: 'var(--slate-500)', lineHeight: '1.5' }}>Comparte tus avances y logros para mejorar tu posicionamiento ante las empresas que buscan talento.</p>
              </div>
              {misPublicaciones.length === 0 ? <EmptyState title="Sin actividad de crecimiento" sub="Aún no has compartido nada en la red" icon="TrendingUp" /> :
                misPublicaciones.map(post => (
                  <div className="card post-card fade-in" key={post.id} style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div className="avatar-placeholder" style={{ width: 40, height: 40 }}><Icon name="User" size={20} color="var(--slate-400)" /></div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '.9rem' }}>{displayName}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--slate-400)' }}>{new Date(post.fecha).toLocaleString()}</p>
                      </div>
                      <span className={`badge badge-${post.tipo === 'empleo' ? 'green' : post.tipo === 'evento' ? 'gold' : 'blue'}`} style={{ marginLeft: 'auto' }}>{post.tipo?.toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: '.9rem', color: 'var(--slate-700)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{post.contenido}</p>
                  </div>
                ))
              }
            </div>
          )}
          {/* Modal QR Compartir Perfil */}
          {qrModal && (
            <div className="modal-overlay fade-in" onClick={e => e.target === e.currentTarget && setQrModal(false)}>
              <div className="modal" style={{ width: 440, maxWidth: '90%', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderRadius: 16 }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700, margin: 0, fontSize: '1.2rem' }}>Compartir perfil</h3>
                  <button onClick={() => setQrModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)', padding: 4 }}><Icon name="X" size={18} /></button>
                </div>

                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid var(--slate-200)', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <img src={api.getQR(userId, token)} alt="QR Code" style={{ width: 220, height: 220, opacity: 0.9 }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div style={{ display: 'none', width: 220, height: 220, background: 'var(--slate-100)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)' }}>QR no disponible</div>
                </div>

                <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 4 }}>{displayName}</h2>
                <p style={{ fontSize: '.85rem', color: 'var(--slate-500)', marginBottom: 16 }}>{profile.especialidad} · {profile.grado}</p>

                {profile.validado && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '8px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, color: '#92400E' }}>
                    <Icon name="CheckCircle" size={14} /> <span style={{ fontSize: '.8rem', fontWeight: 600 }}>Perfil validado institucionalmente</span>
                  </div>
                )}

                <p style={{ fontSize: '.8rem', color: 'var(--slate-500)', maxWidth: 300, lineHeight: 1.5, marginBottom: 24 }}>
                  Escanea el código QR para ver el perfil completo con evidencias y competencias validadas.
                </p>

                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: '.95rem' }} onClick={() => { navigator.clipboard.writeText(window.location.origin + '/perfil/' + userId); addToast('Enlace copiado'); }}>
                  <Icon name="Link2" size={16} /> Copiar enlace
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    function InfoRow({ label, value }) {
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--slate-100)', fontSize: '.85rem' }}>
          <span style={{ color: 'var(--slate-500)' }}>{label}</span>
          <span style={{ fontWeight: 600 }}>{value}</span>
        </div>
      );
    }

    function DisponibilidadPanel({ token, disponibilidad }) {
      const { addToast } = useAuth();
      const [selections, setSelections] = useState(Array.isArray(disponibilidad) ? disponibilidad : []);
      const options = [{ value: 'full_time', label: 'Full-time' }, { value: 'part_time', label: 'Part-time' }, { value: 'practica', label: 'Práctica' }, { value: 'no_disponible', label: 'No disponible' }];

      const handleChange = async (val) => {
        const isSelected = selections.find(s => s.disponibilidad === val);
        const prevSelections = [...selections];

        // Optimista UI Update (Instant response)
        if (isSelected) {
          setSelections(prevSelections.filter(s => s.disponibilidad !== val));
        } else if (val === 'no_disponible') {
          setSelections([{ id: 'temp', disponibilidad: val }]);
        } else {
          setSelections([...prevSelections.filter(s => s.disponibilidad !== 'no_disponible'), { id: 'temp', disponibilidad: val }]);
        }

        try {
          if (isSelected) {
            await api.deleteDisponibilidad(isSelected.id, token);
          } else {
            if (val === 'no_disponible') {
              await Promise.all(prevSelections.map(s => api.deleteDisponibilidad(s.id, token).catch(() => { })));
              const res = await api.createDisponibilidad({ disponibilidad: val }, token);
              setSelections([res]);
            } else {
              const noneSelected = prevSelections.find(s => s.disponibilidad === 'no_disponible');
              if (noneSelected) {
                await api.deleteDisponibilidad(noneSelected.id, token);
              }
              const res = await api.createDisponibilidad({ disponibilidad: val }, token);
              setSelections(prev => prev.map(s => s.disponibilidad === val ? res : s));
            }
          }
        } catch {
          setSelections(prevSelections); // Rollback on failure
          addToast('Error al actualizar la visibilidad', 'error');
        }
      };

      return (
        <div>
          {options.map(o => {
            const checked = selections.some(s => s.disponibilidad === o.value);
            return (
              <div key={o.value} onClick={() => handleChange(o.value)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${checked ? 'var(--gold)' : 'var(--border-color)'}`, background: checked ? 'var(--badge-gold-bg)' : 'var(--surface)', cursor: 'pointer', marginBottom: 8, transition: 'all .15s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${checked ? 'var(--gold)' : 'var(--slate-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {checked && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)' }} />}
                </div>
                <span style={{ fontSize: '.85rem', fontWeight: checked ? 700 : 500, color: 'var(--text-main)' }}>{o.label}</span>
              </div>
            );
          })}
        </div>
      );
    }

    function EvidenciaUpload({ token, studentId, onUpload }) {
      const { addToast } = useAuth();
      const [titulo, setTitulo] = useState('');
      const [desc, setDesc] = useState('');
      const [file, setFile] = useState(null);
      const [uploading, setUploading] = useState(false);

      const handleUpload = async () => {
        if (!titulo) return;
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append('titulo', titulo);
          fd.append('descripcion', desc);
          if (file) fd.append('imagen', file);
          const e = await api.subirEvidencia(fd, token);
          onUpload(e);
          setTitulo(''); setDesc(''); setFile(null);
          addToast('Evidencia subida exitosamente');
        } catch { addToast('Error al subir evidencia', 'error'); }
        finally { setUploading(false); }
      };

      return (
        <div className="card card-p">
          <p style={{ fontWeight: 700, marginBottom: 12 }}>Subir evidencia</p>
          <div style={{ marginBottom: 10 }}><label className="label">Título</label><input className="input" value={titulo} onChange={e => setTitulo(e.target.value)} /></div>
          <div style={{ marginBottom: 10 }}><label className="label">Descripción</label><textarea className="input textarea" rows={2} value={desc} onChange={e => setDesc(e.target.value)} /></div>
          <div style={{ marginBottom: 14 }}><label className="label">Imagen (opcional)</label><input type="file" accept="image/*" className="input" onChange={e => setFile(e.target.files[0])} style={{ padding: '6px 14px' }} /></div>
          <button className="btn btn-primary" onClick={handleUpload} disabled={!titulo || uploading}>
            {uploading ? <Spinner size={14} /> : <><Icon name="Upload" size={14} /> Subir</>}
          </button>
        </div>
      );
    }

    // ─── Jobs (Empleos for students) ──────────────────────────────────────────
    function EmpleosPage({ token, userId }) {
      const { addToast } = useAuth();
      const [ofertas, setOfertas] = useState([]);
      const [misPostulaciones, setMisPostulaciones] = useState([]);
      const [loading, setLoading] = useState(true);
      const [search, setSearch] = useState('');
      const [selected, setSelected] = useState(null);
      const [applying, setApplying] = useState(false);
      const [applied, setApplied] = useState(new Set());
      const [tab, setTab] = useState('explorar');
      const [filterType, setFilterType] = useState('Todos');

      useEffect(() => {
        Promise.all([
          api.getOfertas(token).catch(() => []),
          api.getMisPostulaciones(token).catch(() => [])
        ]).then(([ofertasData, postuData]) => {
          const oList = Array.isArray(ofertasData) ? ofertasData : ofertasData?.results || [];
          const pList = Array.isArray(postuData) ? postuData : [];
          setOfertas(oList);
          setMisPostulaciones(pList);
          setApplied(new Set(pList.map(p => p.oferta)));
          setLoading(false);
        });
      }, [token]);

      const filtered = ofertas.filter(o => {
        const matchesSearch = o.titulo?.toLowerCase().includes(search.toLowerCase()) || o.especialidad_requerida?.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'Todos' || (o.disponibilidad_requerida && o.disponibilidad_requerida.toLowerCase().replace('_', '-') === filterType.toLowerCase().replace('á', 'a'));
        return matchesSearch && matchesType;
      });

      const handleApply = async (ofertaId) => {
        setApplying(true);
        try {
          await api.postular({ oferta: ofertaId, mensaje_estudiante: 'Me interesa esta oferta.' }, token);
          setApplied(s => new Set([...s, ofertaId]));
          addToast('¡Postulación enviada exitosamente!');
          setSelected(null);
        } catch (e) {
          addToast(e?.detail || e?.non_field_errors?.[0] || 'Error al postular', 'error');
        } finally { setApplying(false); }
      };

      return (
        <div className="page fade-in">
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Ofertas de Empleo</h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '.85rem', marginTop: 4 }}>Oportunidades para tu especialidad</p>
          </div>

          <div className="tabs" style={{ marginBottom: 20 }}>
            <div className={`tab${tab === 'explorar' ? ' active' : ''}`} onClick={() => setTab('explorar')}>Explorar Ofertas</div>
            <div className={`tab${tab === 'postulaciones' ? ' active' : ''}`} onClick={() => setTab('postulaciones')}>Mis Postulaciones</div>
          </div>

          {loading ? <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner /></div> : (
            tab === 'explorar' ? (
              <>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><Icon name="Search" size={15} color="var(--slate-400)" /></span>
                  <input className="input" style={{ paddingLeft: 40 }} placeholder="Buscar por título o especialidad..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10, marginBottom: 20 }}>
                  {['Todos', 'Part-time', 'Full-time', 'Práctica'].map(f => (
                    <button key={f} onClick={() => setFilterType(f)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: '.8rem', fontWeight: filterType === f ? 600 : 500, background: filterType === f ? 'var(--navy)' : 'var(--surface)', color: filterType === f ? 'white' : 'var(--text-muted)', border: `1px solid ${filterType === f ? 'var(--navy)' : 'var(--border-color)'}`, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}>
                      {f}
                    </button>
                  ))}
                </div>

                {filtered.length === 0 ? <EmptyState title="Sin ofertas" sub="No hay ofertas disponibles para estos filtros" icon="Briefcase" /> :
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                    {/* The mockup shows cards span full width of their container rather than a 1fr 1fr grid. I changed it to 1fr. */}
                    {filtered.map(o => (
                      <div key={o.id} className="job-card fade-in" onClick={() => setSelected(o)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div className="avatar-placeholder" style={{ width: 44, height: 44, borderRadius: 8 }}><Icon name="Briefcase" size={20} color="var(--slate-400)" /></div>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {o.titulo} <Icon name="CheckCircle" size={14} color="#3B82F6" />
                              </p>
                              <p style={{ fontSize: '.85rem', color: 'var(--slate-500)', marginTop: 2 }}>{o.empresa_nombre || 'Empresa'}</p>
                            </div>
                          </div>
                          <Icon name="Bookmark" size={18} color="var(--slate-300)" />
                        </div>

                        <div style={{ display: 'flex', gap: 14, fontSize: '.8rem', color: 'var(--slate-500)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="Briefcase" size={14} /> {o.disponibilidad_requerida ? o.disponibilidad_requerida.replace('_', '-') : 'No especificada'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="Clock" size={14} /> hace 2 horas</div>
                        </div>

                        <p style={{ fontSize: '.85rem', color: 'var(--slate-600)', lineHeight: 1.55 }}>{o.descripcion?.slice(0, 160)}{o.descripcion?.length > 160 ? '...' : ''}</p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--slate-100)', paddingTop: 12, marginTop: 4 }}>
                          <span style={{ fontSize: '.8rem', color: 'var(--gold-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="Star" size={12} color="var(--gold-dark)" /> Buena coincidencia con tu perfil
                          </span>
                          <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--navy)' }}>Ver oferta &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </>
            ) : (
              // Mis postulaciones tab
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {misPostulaciones.length === 0 ? <EmptyState title="Aún no has postulado" sub="Explora las ofertas y postula a tu primer empleo" icon="Send" /> :
                  misPostulaciones.map(p => (
                    <div key={p.id} className="card card-p">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{p.oferta_detalle?.titulo || 'Oferta indisponible'}</p>
                          <p style={{ fontSize: '.85rem', color: 'var(--slate-500)', marginTop: 2 }}>{p.oferta_detalle?.empresa_nombre || 'Empresa Desconocida'}</p>
                        </div>
                        <span className={`badge ${p.estado === 'Seleccionado' || p.estado === 'Contratado' ? 'badge-green' : p.estado === 'Rechazado' ? 'badge-red' : 'badge-amber'}`}>
                          {p.estado}
                        </span>
                      </div>

                      {p.mensaje_empresa && (
                        <div style={{ marginTop: 12, padding: 12, background: 'var(--gold-light)', borderRadius: 8, fontSize: '.85rem', color: 'var(--gold-dark)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                          <span style={{ fontWeight: 700, fontSize: '.75rem', display: 'block', marginBottom: 4 }}>MENSAJE DE LA EMPRESA</span>
                          {p.mensaje_empresa}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )
          )}

          {/* Detail Modal */}
          {selected && (
            <div className="modal-overlay fade-in" onClick={e => e.target === e.currentTarget && setSelected(null)}>
              <div className="modal" style={{ padding: 0, overflow: 'hidden', maxWidth: 500, borderRadius: 16 }}>
                {/* Header Navy */}
                <div style={{ background: 'var(--navy)', color: 'white', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 48, height: 48, background: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="Briefcase" size={24} color="var(--navy)" />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                        {selected.titulo} <Icon name="CheckCircle" size={14} color="#D4AF37" />
                      </h3>
                      <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0' }}>{selected.empresa_nombre || 'Empresa'}</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <span style={{ fontSize: '.75rem', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="Briefcase" size={12} /> {selected.disponibilidad_requerida ? selected.disponibilidad_requerida.replace('_', '-') : 'No especificada'}</span>
                        <span style={{ fontSize: '.75rem', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="DollarSign" size={12} /> $450.000/mes</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4, display: 'flex' }}><Icon name="X" size={18} /></button>
                </div>

                <div style={{ padding: '24px' }}>
                  <p style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 6 }}>Descripción</p>
                  <p style={{ fontSize: '.85rem', lineHeight: 1.6, color: 'var(--slate-600)', marginBottom: 20 }}>{selected.descripcion}</p>

                  <p style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 10 }}>Requisitos</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem', color: 'var(--slate-600)' }}><Icon name="CheckCircle" size={15} color="#10B981" /> Estudiante de {selected.especialidad_requerida || 'Especialidad'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem', color: 'var(--slate-600)' }}><Icon name="CheckCircle" size={15} color="#10B981" /> Conocimiento general</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem', color: 'var(--slate-600)' }}><Icon name="CheckCircle" size={15} color="#10B981" /> Trato amable</div>
                  </div>

                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px 14px', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 24 }}>
                    <Icon name="Star" size={16} color="var(--gold-dark)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: '.8rem', color: '#92400E', lineHeight: 1.4, margin: 0 }}>
                      <span style={{ fontWeight: 700 }}>Tu perfil encaja en 2 de 3 requisitos.</span> Completa tu validación para destacar.
                    </p>
                  </div>

                  {applied.has(selected.id) ? (
                    <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: '.95rem' }} disabled><Icon name="CheckCircle" size={16} /> Postulación enviada</button>
                  ) : (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn" onClick={() => handleApply(selected.id)} disabled={applying} style={{ flex: 1, background: 'var(--navy)', color: 'white', justifyContent: 'center', padding: '12px 0', fontSize: '.95rem' }}>
                        {applying ? <Spinner size={16} /> : <><Icon name="Send" size={16} /> Postular con mi Pasaporte</>}
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0 16px', borderRadius: 8 }}><Icon name="Bookmark" size={18} /></button>
                    </div>
                  )}
                  <p style={{ fontSize: '.75rem', color: 'var(--slate-400)', textAlign: 'center', marginTop: 14 }}>Al postular, el empleador verá tu Pasaporte de Oficio validado por el Liceo</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ─── Teacher Validacion ───────────────────────────────────────────────────
    function TeacherValidacionPage({ token }) {
      const { addToast } = useAuth();
      const [tab, setTab] = useState('estudiantes');
      const [estudiantes, setEstudiantes] = useState([]);
      const [reportes, setReportes] = useState([]);
      const [loading, setLoading] = useState(true);
      const [selectedStudent, setSelectedStudent] = useState(null);
      const [studentProfile, setStudentProfile] = useState(null);
      const [loadingStudent, setLoadingStudent] = useState(false);

      useEffect(() => {
        const load = async () => {
          try {
            const [e, r] = await Promise.all([
              api.getEstudiantesList('', token),
              api.getReportes(token),
            ]);
            setEstudiantes(Array.isArray(e) ? e : e?.results || []);
            setReportes(Array.isArray(r) ? r : r?.results || []);
          } catch (err) {
            addToast('Error al cargar datos', 'error');
          } finally { setLoading(false); }
        };
        load();
      }, [token]);

      const handleActivar = async (id) => {
        try {
          await api.activarEstudiante(id, token);
          setEstudiantes(p => p.map(e => e.id === id ? { ...e, activo: true } : e));
          addToast('Estudiante activado exitosamente');
        } catch { addToast('Error al activar', 'error'); }
      };

      const handleReporte = async (id, estado) => {
        try {
          await api.updateReporte(id, { estado }, token);
          setReportes(p => p.map(r => r.id === id ? { ...r, estado } : r));
          addToast('Reporte actualizado');
        } catch { addToast('Error al actualizar', 'error'); }
      };

      const handleViewStudent = async (studentUser) => {
        setLoadingStudent(true);
        setSelectedStudent(studentUser);
        try {
          const p = await api.getProfile('estudiante', studentUser.id, token);
          setStudentProfile(p);
        } catch { addToast('Error al cargar perfil del estudiante', 'error'); setSelectedStudent(null); }
        finally { setLoadingStudent(false); }
      };

      const handleValidarHabilidad = async (habilidadId) => {
        try {
          await api.validarHabilidad(habilidadId, { estado: 'Aprobado' }, token);
          addToast('Habilidad validada correctamente');
          setStudentProfile(prev => ({
            ...prev,
            habilidades: prev.habilidades.map(h => h.id === habilidadId ? { ...h, estado: 'Aprobado' } : h)
          }));
        } catch { addToast('Error al validar habilidad', 'error'); }
      };

      const pending = estudiantes.filter(e => !e.activo);
      const active = estudiantes.filter(e => e.activo);

      return (
        <div className="page fade-in">
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 6 }}>Administración</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '.85rem', marginBottom: 20 }}>Gestiona estudiantes, validaciones y reportes</p>

          <div className="tabs" style={{ marginBottom: 20 }}>
            {['estudiantes', 'reportes'].map(t => (
              <div key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t === 'estudiantes' ? `Estudiantes ${pending.length > 0 ? `(${pending.length} pendientes)` : ''}` : 'Reportes'}
              </div>
            ))}
          </div>

          {loading ? <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner /></div> : <>
            {tab === 'estudiantes' && (
              <div>
                {pending.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-amber">Pendientes de activación</span>
                    </h3>
                    {pending.map(e => (
                      <div key={e.id} className="card card-p" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="avatar-placeholder" style={{ width: 40, height: 40 }}><Icon name="GraduationCap" size={18} color="var(--slate-400)" /></div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '.9rem' }}>{`${e.user?.first_name || ''} ${e.user?.last_name || ''}`.trim() || e.user?.username}</p>
                            <p style={{ fontSize: '.78rem', color: 'var(--slate-500)' }}>{e.especialidad} · {e.grado}</p>
                          </div>
                        </div>
                        <button className="btn btn-success btn-sm" onClick={() => handleActivar(e.id)}>
                          <Icon name="UserCheck" size={13} /> Activar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Todos los estudiantes ({active.length})</h3>
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Nombre</th><th>Especialidad</th><th>Grado</th><th>Estado</th></tr></thead>
                      <tbody>
                        {active.map(e => (
                          <tr key={e.id} onClick={() => handleViewStudent(e.usuario_id || e.id)} style={{ cursor: 'pointer' }}>
                            <td style={{ fontWeight: 600 }}>{`${e.user?.first_name || ''} ${e.user?.last_name || ''}`.trim() || e.user?.username || 'Estudiante'}</td>
                            <td>{e.especialidad || '—'}</td>
                            <td>{e.grado || '—'}</td>
                            <td><span className="badge badge-green"><Icon name="CheckCircle" size={11} color="#16A34A" /> Activo</span></td>
                          </tr>
                        ))}
                        {active.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--slate-400)', padding: 32 }}>Sin estudiantes activos</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'reportes' && (
              <div>
                {reportes.length === 0 ? <EmptyState title="Sin reportes" sub="No hay reportes pendientes" icon="Flag" /> :
                  reportes.map(r => (
                    <div key={r.id} className="card card-p" style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <p style={{ fontWeight: 700, fontSize: '.9rem' }}>{r.motivo}</p>
                            <span className={`badge ${r.estado === 'pendiente' ? 'badge-amber' : r.estado === 'en_revision' ? 'badge-blue' : r.estado === 'resuelto' ? 'badge-green' : 'badge-gray'}`}>
                              {r.estado}
                            </span>
                          </div>
                          <p style={{ fontSize: '.8rem', color: 'var(--slate-600)', marginBottom: 4 }}>{r.descripcion}</p>
                          <p style={{ fontSize: '.75rem', color: 'var(--slate-400)' }}>Reportado por: {r.reportador_nombre || 'Usuario'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {r.estado !== 'en_revision' && <button className="btn btn-outline btn-sm" onClick={() => handleReporte(r.id, 'en_revision')}>En revisión</button>}
                          {r.estado !== 'resuelto' && <button className="btn btn-success btn-sm" onClick={() => handleReporte(r.id, 'resuelto')}>Resolver</button>}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>}

          {/* Student Profile Modal for Teachers (Validation) */}
          {selectedStudent && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedStudent(null)}>
              <div className="modal fade-in">
                <div className="modal-header">
                  <h3 style={{ fontWeight: 700 }}>Perfil del Estudiante</h3>
                  <button className="btn btn-ghost" onClick={() => setSelectedStudent(null)} style={{ padding: 6 }}><Icon name="X" size={16} /></button>
                </div>
                <div className="modal-body">
                  {loadingStudent ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div> : studentProfile ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div className="avatar-placeholder" style={{ width: 50, height: 50 }}><Icon name="GraduationCap" size={24} color="var(--slate-400)" /></div>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{studentProfile.user?.first_name || ''} {studentProfile.user?.last_name || ''}</p>
                          <p style={{ fontSize: '.85rem', color: 'var(--slate-500)' }}>{studentProfile.especialidad} · {studentProfile.grado}</p>
                        </div>
                      </div>

                      <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '.95rem' }}>Habilidades Reportadas</h4>
                      {studentProfile.habilidades && studentProfile.habilidades.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {studentProfile.habilidades.map(h => (
                            <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 10 }}>
                              <div>
                                <p style={{ fontWeight: 700, fontSize: '.88rem' }}>{h.nombre}</p>
                                <p style={{ fontSize: '.75rem', color: 'var(--slate-500)' }}>Nivel: {h.nivel}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <SkillLevelBadge level={h.estado || h.nivel} />
                                {(h.estado === 'Pendiente' || h.estado === 'N/A' || !h.estado) && (
                                  <button className="btn btn-success btn-sm" onClick={() => handleValidarHabilidad(h.id)}>Validar</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState title="Sin habilidades" sub="El estudiante aún no registra habilidades" />
                      )}

                    </div>
                  ) : (
                    <EmptyState title="Error" sub="No se pudo cargar el perfil" icon="AlertCircle" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ─── Teacher Stats ────────────────────────────────────────────────────────
    function TeacherEstadisticasPage({ token }) {
      const { addToast } = useAuth();
      const [stats, setStats] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        api.getEstadisticas(token).then(d => { setStats(d); setLoading(false); }).catch(() => { addToast('Error al cargar estadísticas', 'error'); setLoading(false); });
      }, [token]);

      if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner /></div>;

      const s = stats || {};
      const statItems = [
        { label: 'Total estudiantes', value: s.total_estudiantes || 0, sub: 'Registrados en la plataforma' },
        { label: 'Estudiantes activos', value: s.estudiantes_activos || 0, sub: 'Con perfil validado' },
        { label: 'Habilidades validadas', value: s.habilidades_validadas || 0, sub: 'Aprobadas por docentes' },
        { label: 'Ofertas activas', value: s.ofertas_activas || 0, sub: 'Publicadas por empresas' },
        { label: 'Empresas registradas', value: s.total_empresas || 0, sub: 'En la plataforma' },
        { label: 'Postulaciones', value: s.total_postulaciones || 0, sub: 'Realizadas este período' },
      ];

      return (
        <div className="page fade-in">
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 6 }}>Estadísticas</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '.85rem', marginBottom: 24 }}>Métricas globales de la plataforma</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            {statItems.map(st => (
              <div key={st.label} className="stat-card">
                <div className="stat-value">{st.value}</div>
                <div className="stat-label">{st.label}</div>
                <div className="stat-sub">{st.sub}</div>
              </div>
            ))}
          </div>

          {s.por_especialidad && (
            <div className="card">
              <div className="card-header">Distribución por especialidad</div>
              <div className="card-p">
                {Object.entries(s.por_especialidad).map(([esp, cnt]) => (
                  <div key={esp} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '.85rem', fontWeight: 600 }}>{esp}</span>
                      <span style={{ fontSize: '.85rem', color: 'var(--slate-500)' }}>{cnt}</span>
                    </div>
                    <div className="skill-bar-track">
                      <div className="skill-bar-fill" style={{ width: `${(cnt / (s.total_estudiantes || 1)) * 100}%`, background: 'var(--navy)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // ─── Teacher Profile ──────────────────────────────────────────────────────
    function TeacherProfilePage({ token, userId }) {
      const { addToast } = useAuth();
      const [profile, setProfile] = useState(null);
      const [loading, setLoading] = useState(true);
      const [editing, setEditing] = useState(false);
      const [form, setForm] = useState({});
      const [misPublicaciones, setMisPublicaciones] = useState([]);
      const [tab, setTab] = useState('perfil');

      useEffect(() => {
        api.getProfile('docente', userId, token).then(p => { setProfile(p); setForm({ first_name: p.user?.first_name || '', last_name: p.user?.last_name || '', email: p.user?.email || '', departamento: p.departamento || '', bio: p.bio || '' }); setLoading(false); }).catch(() => setLoading(false));
        api.getMisPublicaciones(userId, token).then(d => setMisPublicaciones(Array.isArray(d) ? d : d?.results || [])).catch(() => { });
      }, [userId, token]);

      const handleSave = async () => {
        try {
          const updated = await api.updateProfile('docente', userId, form, token);
          setProfile(p => ({ ...p, ...updated }));
          setEditing(false);
          addToast('Perfil actualizado');
        } catch { addToast('Error al guardar', 'error'); }
      };

      if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner /></div>;

      const displayName = `${profile?.user?.first_name || ''} ${profile?.user?.last_name || ''}`.trim() || profile?.user?.username || 'Docente';

      return (
        <div className="page fade-in">
          <div className="profile-hero">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="avatar-placeholder" style={{ width: 64, height: 64, background: 'rgba(255,255,255,.08)', borderRadius: 16 }}>
                  <Icon name="BookOpen" size={28} color="rgba(255,255,255,.4)" />
                </div>
                <div>
                  <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem' }}>{displayName}</h1>
                  <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.85rem', marginTop: 4 }}>{profile?.departamento || 'Docente'}</p>
                  <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.78rem', marginTop: 2 }}>{profile?.user?.email}</p>
                </div>
              </div>
              <button className="btn btn-gold btn-sm" onClick={() => setEditing(!editing)}>
                <Icon name="Edit" size={13} /> {editing ? 'Cancelar Edición' : 'Editar Perfil'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            {['perfil', 'publicaciones'].map(t => (
              <div key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t === 'perfil' ? 'Mi Perfil' : 'Mis Publicaciones'}
              </div>
            ))}
          </div>

          {tab === 'perfil' && (
            <div className="card card-p">
              <p style={{ fontWeight: 700, marginBottom: 16 }}>Información</p>
              {editing ? (
                <>
                  <div className="grid-2" style={{ marginBottom: 12 }}>
                    <div><label className="label">Nombre</label><input className="input" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                    <div><label className="label">Apellido</label><input className="input" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                  </div>
                  <div style={{ marginBottom: 12 }}><label className="label">Correo Electrónico</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div style={{ marginBottom: 12 }}><label className="label">Departamento</label><input className="input" value={form.departamento} onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))} /></div>
                  <div style={{ marginBottom: 16 }}><label className="label">Bio</label><textarea className="input textarea" rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} /></div>
                  <button className="btn btn-primary" onClick={handleSave}><Icon name="Save" size={14} /> Guardar</button>
                </>
              ) : (
                <>
                  <InfoRow label="Departamento" value={profile?.departamento || '—'} />
                  <InfoRow label="Email" value={profile?.user?.email || '—'} />
                  {profile?.bio && <p style={{ marginTop: 14, fontSize: '.88rem', lineHeight: 1.7, color: 'var(--slate-600)' }}>{profile.bio}</p>}
                </>
              )}
            </div>
          )}

          {tab === 'publicaciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
              {misPublicaciones.length === 0 ? <EmptyState title="Sin publicaciones" sub="Aún no has compartido nada en la red" icon="MessageSquare" /> :
                misPublicaciones.map(post => (
                  <div className="card post-card fade-in" key={post.id} style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div className="avatar-placeholder" style={{ width: 40, height: 40 }}><Icon name="User" size={20} color="var(--slate-400)" /></div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '.9rem' }}>{displayName}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--slate-400)' }}>{new Date(post.fecha).toLocaleString()}</p>
                      </div>
                      <span className={`badge badge-${post.tipo === 'empleo' ? 'green' : post.tipo === 'evento' ? 'gold' : 'blue'}`} style={{ marginLeft: 'auto' }}>{post.tipo?.toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: '.9rem', color: 'var(--slate-700)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{post.contenido}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      );
    }

    // ─── Company Publicar ─────────────────────────────────────────────────────
    function CompanyPublicarPage({ token, userId }) {
      const { addToast } = useAuth();
      const [ofertas, setOfertas] = useState([]);
      const [form, setForm] = useState({ titulo: '', descripcion: '', especialidad_requerida: '' });
      const [loading, setLoading] = useState(false);
      const [loadingList, setLoadingList] = useState(true);
      const [selectedOferta, setSelectedOferta] = useState(null);
      const [postulaciones, setPostulaciones] = useState([]);
      const [loadingPostulaciones, setLoadingPostulaciones] = useState(false);
      const [studentProfileModal, setStudentProfileModal] = useState(null);
      const [studentProfileLoading, setStudentProfileLoading] = useState(false);
      const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

      useEffect(() => {
        api.getProfile('empresa', userId, token).then(d => {
          setOfertas(d?.ofertas_laboral || []);
          setLoadingList(false);
        }).catch(() => setLoadingList(false));
      }, [token, userId]);

      const handlePublish = async (e) => {
        e.preventDefault();
        if (!form.titulo) return;
        setLoading(true);
        try {
          const payload = { ...form };
          if (!payload.especialidad_requerida) delete payload.especialidad_requerida;
          const o = await api.createOferta(payload, token);
          setOfertas(p => [o, ...p]);
          setForm({ titulo: '', descripcion: '', especialidad_requerida: '' });
          addToast('Oferta publicada exitosamente');
        } catch (err) {
          addToast(Object.values(err).flat().join(' ') || 'Error al publicar', 'error');
        } finally { setLoading(false); }
      };

      const handleVerPostulantes = async (oferta) => {
        setSelectedOferta(oferta);
        setLoadingPostulaciones(true);
        try {
          const res = await api.getPostulaciones(oferta.id, token);
          setPostulaciones(Array.isArray(res) ? res : res?.results || []);
        } catch { addToast('Error al cargar postulaciones', 'error'); }
        finally { setLoadingPostulaciones(false); }
      };

      const handleActualizarPostulacion = async (postulacionId, estado) => {
        let msg = 'Estado actualizado por la empresa';
        if (estado === 'Contratado') {
          const m = prompt('¡Felicidades por encontrar talento! Ingresa un mensaje para el estudiante (ej. tu email de contacto o detalles de incorporación):');
          if (m === null) return;
          if (m.trim()) msg = m;
        } else if (estado === 'Rechazado') {
          const m = prompt('(Opcional) Puedes dejar un mensaje de retroalimentación para el estudiante:');
          if (m !== null && m.trim()) msg = m;
        }

        try {
          await api.updatePostulacion(postulacionId, { estado, mensaje_empresa: msg }, token);
          setPostulaciones(p => p.map(pos => pos.id === postulacionId ? { ...pos, estado } : pos));
          addToast(`Postulación marcada como ${estado}`);
        } catch { addToast('Error al actualizar estado', 'error'); }
      };

      const handleVerPerfil = async (studentUserId) => {
        setStudentProfileModal(true);
        setStudentProfileLoading(true);
        try {
          const profile = await api.getProfile('estudiante', studentUserId, token);
          setStudentProfileModal(profile);
        } catch {
          addToast('Error al cargar perfil', 'error');
          setStudentProfileModal(null);
        } finally { setStudentProfileLoading(false); }
      };

      return (
        <div className="page fade-in">
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 6 }}>Publicar Oferta</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '.85rem', marginBottom: 24 }}>Crea una oferta laboral para los estudiantes del Liceo</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
            <div className="card card-p">
              <p style={{ fontWeight: 700, marginBottom: 16 }}>Nueva oferta laboral</p>
              <form onSubmit={handlePublish}>
                <div style={{ marginBottom: 12 }}><label className="label">Título del puesto *</label><input className="input" value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ej: Técnico Electricista Senior" required /></div>
                <div style={{ marginBottom: 12 }}><label className="label">Descripción</label><textarea className="input textarea" rows={4} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Describe el puesto, funciones, condiciones..." /></div>
                <div style={{ marginBottom: 16 }}><label className="label">Especialidad requerida</label>
                  <select className="input" value={form.especialidad_requerida} onChange={e => set('especialidad_requerida', e.target.value)}>
                    <option value="">Cualquier especialidad</option>
                    {['Electricidad', 'Construcción', 'Computación e Informática', 'Mecánica Automotriz', 'Administración'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                  {loading ? <Spinner size={14} /> : <><Icon name="Send" size={14} /> Publicar oferta</>}
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-header">Mis ofertas activas</div>
              <div className="card-p">
                {loadingList ? <Spinner /> : ofertas.length === 0 ? <EmptyState title="Sin ofertas activas" sub="Publica tu primera oferta" icon="Briefcase" /> :
                  ofertas.map(o => (
                    <div key={o.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--slate-100)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '.9rem' }}>{o.titulo}</p>
                          {o.especialidad_requerida && <span className="badge badge-blue" style={{ marginTop: 4 }}>{o.especialidad_requerida}</span>}
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => handleVerPostulantes(o)}>Ver Postulantes</button>
                      </div>
                      <p style={{ fontSize: '.78rem', color: 'var(--slate-500)', marginTop: 6 }}>{o.descripcion?.slice(0, 80)}...</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Modal Postulaciones */}
          {selectedOferta && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedOferta(null)}>
              <div className="modal fade-in" style={{ maxWidth: 640 }}>
                <div className="modal-header">
                  <div>
                    <h3 style={{ fontWeight: 700 }}>Postulantes: {selectedOferta.titulo}</h3>
                  </div>
                  <button className="btn btn-ghost" onClick={() => setSelectedOferta(null)} style={{ padding: 6 }}><Icon name="X" size={16} /></button>
                </div>
                <div className="modal-body" style={{ background: 'var(--slate-100)' }}>
                  {loadingPostulaciones ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div> : postulaciones.length === 0 ? (
                    <EmptyState title="Sin postulantes" sub="Aún nadie ha postulado a esta oferta" icon="User" />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {postulaciones.map(pos => (
                        <div key={pos.id} className="card card-p">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                              <div className="avatar-placeholder" style={{ width: 44, height: 44 }}><Icon name="GraduationCap" size={20} color="var(--slate-400)" /></div>
                              <div>
                                <p style={{ fontWeight: 700 }}>{pos.estudiante_detalle?.first_name || 'Estudiante'} {pos.estudiante_detalle?.last_name || ''}</p>
                                <p style={{ fontSize: '.8rem', color: 'var(--slate-500)' }}>{pos.estudiante_detalle?.grado} · {pos.estudiante_detalle?.especialidad}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <button className="btn btn-outline btn-sm" onClick={() => handleVerPerfil(pos.estudiante_detalle?.user_id)}>Ver Perfil</button>
                              <span className={`badge ${pos.estado === 'Seleccionado' || pos.estado === 'Contratado' ? 'badge-green' : pos.estado === 'Rechazado' ? 'badge-red' : 'badge-amber'}`}>
                                {pos.estado}
                              </span>
                            </div>
                          </div>
                          {pos.mensaje_estudiante && (
                            <div style={{ marginTop: 12, padding: 12, background: 'var(--slate-100)', borderRadius: 8, fontSize: '.85rem', color: 'var(--slate-700)' }}>
                              <span style={{ fontWeight: 700, fontSize: '.75rem', color: 'var(--slate-400)', display: 'block', marginBottom: 4 }}>MENSAJE DEL ESTUDIANTE</span>
                              {pos.mensaje_estudiante}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                            {pos.estado !== 'Contratado' && <button className="btn btn-success btn-sm" onClick={() => handleActualizarPostulacion(pos.id, 'Contratado')}>Contratar</button>}
                            {pos.estado !== 'Seleccionado' && pos.estado !== 'Contratado' && <button className="btn btn-outline btn-sm" style={{ color: 'var(--navy)', borderColor: 'var(--navy)' }} onClick={() => handleActualizarPostulacion(pos.id, 'Seleccionado')}>Preseleccionar</button>}
                            {pos.estado !== 'Rechazado' && pos.estado !== 'Contratado' && <button className="btn btn-danger btn-sm" onClick={() => handleActualizarPostulacion(pos.id, 'Rechazado')}>Rechazar</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Student Profile Modal for Companies */}
          {studentProfileModal && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setStudentProfileModal(null)} style={{ zIndex: 1001 }}>
              <div className="modal fade-in">
                <div className="modal-header">
                  <h3 style={{ fontWeight: 700 }}>Perfil del Estudiante</h3>
                  <button className="btn btn-ghost" onClick={() => setStudentProfileModal(null)} style={{ padding: 6 }}><Icon name="X" size={16} /></button>
                </div>
                <div className="modal-body">
                  {studentProfileLoading || studentProfileModal === true ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div> : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div className="avatar-placeholder" style={{ width: 50, height: 50 }}><Icon name="GraduationCap" size={24} color="var(--slate-400)" /></div>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{studentProfileModal.user?.first_name || ''} {studentProfileModal.user?.last_name || ''}</p>
                          <p style={{ fontSize: '.85rem', color: 'var(--slate-500)' }}>{studentProfileModal.especialidad} · {studentProfileModal.grado}</p>
                          <p style={{ fontSize: '.8rem', color: 'var(--slate-400)' }}>{studentProfileModal.user?.email}</p>
                        </div>
                      </div>

                      <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '.95rem' }}>Habilidades Validadas</h4>
                      {studentProfileModal.habilidades_aprobadas && studentProfileModal.habilidades_aprobadas.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                          {studentProfileModal.habilidades_aprobadas.map(h => (
                            <span key={h.id} className="badge badge-gray">{h.nombre} ({h.nivel})</span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '.8rem', color: 'var(--slate-500)', marginBottom: 20 }}>No tiene habilidades validadas aún.</p>
                      )}

                      <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '.95rem' }}>Disponibilidad</h4>
                      {studentProfileModal.disponibilidad_perfil && studentProfileModal.disponibilidad_perfil.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {studentProfileModal.disponibilidad_perfil.map(d => (
                            <span key={d.id} className="badge badge-blue">{d.disponibilidad}</span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '.8rem', color: 'var(--slate-500)' }}>No indica disponibilidad.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ─── Company Buscar ───────────────────────────────────────────────────────
    function CompanyBuscarPage({ token }) {
      const { addToast } = useAuth();
      const [estudiantes, setEstudiantes] = useState([]);
      const [loading, setLoading] = useState(true);
      const [search, setSearch] = useState('');
      const [specialty, setSpecialty] = useState('');

      useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('nombre', search);
        if (specialty) params.set('especialidad', specialty);
        const qs = params.toString() ? `?${params}` : '';
        api.getEstudiantesList(qs, token).then(d => { setEstudiantes(Array.isArray(d) ? d : d?.results || []); setLoading(false); }).catch(() => setLoading(false));
      }, [search, specialty, token]);

      return (
        <div className="page fade-in">
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 6 }}>Buscar Talento</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '.85rem', marginBottom: 20 }}>Encuentra estudiantes por especialidad y habilidades</p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><Icon name="Search" size={15} color="var(--slate-400)" /></span>
              <input className="input" style={{ paddingLeft: 40 }} placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{ width: 220 }} value={specialty} onChange={e => setSpecialty(e.target.value)}>
              <option value="">Todas las especialidades</option>
              {['Electricidad', 'Construcción', 'Computación e Informática', 'Mecánica Automotriz', 'Administración'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {loading ? <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner /></div> :
            estudiantes.length === 0 ? <EmptyState title="Sin resultados" sub="Prueba con otros filtros de búsqueda" icon="Search" /> :
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {estudiantes.map(e => (
                  <div key={e.id} className="card card-p" style={{ cursor: 'pointer', transition: 'all .15s', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div className="avatar-placeholder" style={{ width: 44, height: 44 }}><Icon name="GraduationCap" size={20} color="var(--slate-400)" /></div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '.9rem' }}>{`${e.user?.first_name || ''} ${e.user?.last_name || ''}`.trim() || e.user?.username}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--slate-500)', marginTop: 2 }}>{e.grado}</p>
                      </div>
                    </div>
                    {e.especialidad && <span className="badge badge-blue" style={{ alignSelf: 'flex-start' }}>{e.especialidad}</span>}
                    {e.activo && <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}><Icon name="CheckCircle" size={11} color="#D4AF37" />Validado</span>}
                    {e.habilidades?.length > 0 && (
                      <div>
                        <p style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--slate-500)', marginBottom: 6 }}>HABILIDADES</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {e.habilidades.slice(0, 3).map(h => (
                            <span key={h.id} className="badge badge-gray">{h.nombre}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
          }
        </div>
      );
    }

    // ─── Company Profile ──────────────────────────────────────────────────────
    function CompanyProfilePage({ token, userId }) {
      const { addToast } = useAuth();
      const [profile, setProfile] = useState(null);
      const [loading, setLoading] = useState(true);
      const [editing, setEditing] = useState(false);
      const [form, setForm] = useState({});
      const [misPublicaciones, setMisPublicaciones] = useState([]);
      const [tab, setTab] = useState('perfil');

      useEffect(() => {
        api.getProfile('empresa', userId, token).then(p => { setProfile(p); setForm({ nombre_empresa: p.nombre_empresa || '', email: p.user?.email || '', industria: p.industria || '' }); setLoading(false); }).catch(() => setLoading(false));
        api.getMisPublicaciones(userId, token).then(d => setMisPublicaciones(Array.isArray(d) ? d : d?.results || [])).catch(() => { });
      }, [userId, token]);

      const handleSave = async () => {
        try {
          const updated = await api.updateProfile('empresa', userId, form, token);
          setProfile(p => ({ ...p, ...updated }));
          setEditing(false);
          addToast('Perfil actualizado');
        } catch { addToast('Error al guardar', 'error'); }
      };

      if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner /></div>;

      const displayName = profile?.nombre_empresa || profile?.user?.username || 'Empresa';

      return (
        <div className="page fade-in">
          <div className="profile-hero" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="avatar-placeholder" style={{ width: 64, height: 64, background: 'rgba(255,255,255,.08)', borderRadius: 16 }}>
                  <Icon name="Building2" size={28} color="rgba(255,255,255,.4)" />
                </div>
                <div>
                  <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem' }}>{displayName}</h1>
                  <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.85rem', marginTop: 4 }}>{profile?.industria || 'Empresa'}</p>
                  <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.78rem', marginTop: 2 }}>{profile?.user?.email}</p>
                </div>
              </div>
              <button className="btn btn-gold btn-sm" onClick={() => setEditing(!editing)}>
                <Icon name="Edit" size={13} /> {editing ? 'Cancelar Edición' : 'Editar Perfil'}
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            {['perfil', 'publicaciones'].map(t => (
              <div key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t === 'perfil' ? 'Perfil de Empresa' : 'Nuestras Publicaciones'}
              </div>
            ))}
          </div>

          {tab === 'perfil' && (
            <div className="card card-p">
              <p style={{ fontWeight: 700, marginBottom: 16 }}>Información de la empresa</p>
              {editing ? (
                <>
                  <div style={{ marginBottom: 12 }}><label className="label">Nombre</label><input className="input" value={form.nombre_empresa} onChange={e => setForm(f => ({ ...f, nombre_empresa: e.target.value }))} /></div>
                  <div style={{ marginBottom: 12 }}><label className="label">Correo Electrónico</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div style={{ marginBottom: 12 }}><label className="label">Industria</label><input className="input" value={form.industria} onChange={e => setForm(f => ({ ...f, industria: e.target.value }))} /></div>
                  <button className="btn btn-primary" onClick={handleSave}><Icon name="Save" size={14} /> Guardar</button>
                </>
              ) : (
                <>
                  <InfoRow label="Nombre" value={profile?.nombre_empresa || '—'} />
                  <InfoRow label="Industria" value={profile?.industria || '—'} />
                  <InfoRow label="RUT" value={profile?.rut || '—'} />
                  <InfoRow label="Email" value={profile?.user?.email || '—'} />
                </>
              )}
            </div>
          )}

          {tab === 'publicaciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
              {misPublicaciones.length === 0 ? <EmptyState title="Sin publicaciones" sub="Aún no han compartido nada en la red" icon="MessageSquare" /> :
                misPublicaciones.map(post => (
                  <div className="card post-card fade-in" key={post.id} style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div className="avatar-placeholder" style={{ width: 40, height: 40 }}><Icon name="Building2" size={20} color="var(--slate-400)" /></div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '.9rem' }}>{displayName}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--slate-400)' }}>{new Date(post.fecha).toLocaleString()}</p>
                      </div>
                      <span className={`badge badge-${post.tipo === 'empleo' ? 'green' : post.tipo === 'evento' ? 'gold' : 'blue'}`} style={{ marginLeft: 'auto' }}>{post.tipo?.toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: '.9rem', color: 'var(--slate-700)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{post.contenido}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      );
    }

    // ─── App Shell ────────────────────────────────────────────────────────────
    function App() {
      const { auth } = useAuth();
      const { route, navigate } = useRoute();

      // Auth guard
      useEffect(() => {
        if (!auth && route !== '/login' && route !== '/register') {
          navigate('/login');
        }
        if (auth && (route === '/login' || route === '/register')) {
          navigate('/inicio');
        }
      }, [auth, route]);

      if (!auth) {
        if (route === '/register') return <RegisterPage navigate={navigate} />;
        return <LoginPage navigate={navigate} />;
      }

      const token = auth.access;
      const role = auth.role;
      const userId = auth.user_id;

      const renderPage = () => {
        switch (route) {
          case '/inicio': return <HomePage token={token} role={role} user={auth.user} />;
          case '/perfil': return <StudentProfilePage token={token} userId={userId} />;
          case '/empleos': return <EmpleosPage token={token} userId={userId} />;
          case '/validacion': return <TeacherValidacionPage token={token} />;
          case '/estadisticas': return <TeacherEstadisticasPage token={token} />;
          case '/perfil-docente': return <TeacherProfilePage token={token} userId={userId} />;
          case '/publicar': return <CompanyPublicarPage token={token} userId={userId} />;
          case '/buscar': return <CompanyBuscarPage token={token} />;
          case '/perfil-empresa': return <CompanyProfilePage token={token} userId={userId} />;
          default: return <HomePage token={token} role={role} user={auth.user} />;
        }
      };

      return (
        <div className="app-shell">
          <Topbar route={route} navigate={navigate} role={role} user={auth.user} />
          <div className="main-content">
            {renderPage()}
          </div>
        </div>
      );
    }

    // ─── Root ─────────────────────────────────────────────────────────────────
    function Root() {
      return (
        <AuthProvider>
          <App />
        </AuthProvider>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
  