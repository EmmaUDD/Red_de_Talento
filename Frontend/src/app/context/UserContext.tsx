import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "student" | "teacher" | "company";

export interface AppUser {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  // student
  specialty?: string;
  grade?: string;
  validated?: boolean;
  // teacher
  department?: string;
  // company
  companyName?: string;
  companyIndustry?: string;
}

interface UserContextType {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
}

const UserContext = createContext<UserContextType>({ user: null, setUser: () => {} });

// Usuarios demo (se mantienen para el acceso rápido de demostración)
export const demoUsers: Record<Role, AppUser> = {
  student: {
    id: "1",
    name: "Felipe Muñoz Rojas",
    role: "student",
    avatar:
      "https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=80&h=80&fit=crop&auto=format",
    specialty: "Técnico en Electricidad",
    grade: "4° Medio TP",
    validated: true,
  },
  teacher: {
    id: "2",
    name: "Ana García Vidal",
    role: "teacher",
    avatar:
      "https://images.unsplash.com/photo-1650600538903-ec09f670c391?w=80&h=80&fit=crop&auto=format",
    department: "Dpto. Electricidad",
  },
  company: {
    id: "3",
    name: "Eléctrica Cordillera SpA",
    role: "company",
    avatar:
      "https://images.unsplash.com/photo-1601119463467-ad343113e3c5?w=80&h=80&fit=crop&auto=format",
    companyName: "Eléctrica Cordillera SpA",
    companyIndustry: "Electricidad Industrial",
  },
};

// Mapear el rol del backend al rol del frontend
export function mapBackendRole(backendRole: string): Role {
  if (backendRole === "estudiante") return "student";
  if (backendRole === "docente") return "teacher";
  if (backendRole === "empresa") return "company";
  return "student";
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}