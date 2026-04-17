import { createContext, useContext } from "react";
import { useNavigate } from "react-router";

export type TipoPerfil = "estudiante" | "empresa" | "docente";

interface PerfilContextType {
  openPerfil: (id: number, tipo: TipoPerfil) => void;
}

const PerfilContext = createContext<PerfilContextType | null>(null);

export function PerfilProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const openPerfil = (id: number, tipo: TipoPerfil) => {
    navigate(`/ver/${tipo}/${id}`);
  };

  return (
    <PerfilContext.Provider value={{ openPerfil }}>
      {children}
    </PerfilContext.Provider>
  );
}

export function usePerfil() {
  const ctx = useContext(PerfilContext);
  if (!ctx) throw new Error("usePerfil must be used within PerfilProvider");
  return ctx;
}
