export type PostType = "job" | "post" | "achievement" | "event";
export type AuthorRole = "student" | "teacher" | "company";

export interface FeedPost {
  id: number;
  type: PostType;
  author: {
    name: string;
    role: AuthorRole;
    avatar: string | null;
    subtitle: string;
    verified?: boolean;
  };
  time: string;
  content: string;
  image?: string;
  jobDetails?: {
    title: string;
    type: string;
    salary: string;
    specialty: string;
    location: string;
  };
  eventDetails?: {
    date: string;
    time: string;
    location: string;
  };
  achievementDetails?: {
    studentName: string;
    specialty: string;
  };
  likes: number;
  comments: number;
  liked?: boolean;
  saved?: boolean;
}

export const feedPosts: FeedPost[] = [
  {
    id: 1,
    type: "job",
    author: {
      name: "Eléctrica Cordillera SpA",
      role: "company",
      avatar:
        "https://images.unsplash.com/photo-1601119463467-ad343113e3c5?w=60&h=60&fit=crop&auto=format",
      subtitle: "Empresa verificada · Lo Espejo",
      verified: true,
    },
    time: "hace 2 horas",
    content:
      "🔌 ¡Buscamos técnico electricista! Ofrecemos contrato part-time con posibilidad de jornada completa. Excelente ambiente de trabajo y oportunidad de crecimiento.",
    jobDetails: {
      title: "Técnico Electricista Junior",
      type: "Part-time",
      salary: "$450.000/mes",
      specialty: "Electricidad",
      location: "Lo Espejo",
    },
    likes: 12,
    comments: 4,
  },
  {
    id: 2,
    type: "achievement",
    author: {
      name: "Liceo Cardenal Caro",
      role: "teacher",
      avatar: null,
      subtitle: "Institución · Lo Espejo",
      verified: true,
    },
    time: "hace 5 horas",
    content:
      "🏅 ¡Felicitamos a Felipe Muñoz por obtener su Sello de Validación Institucional en Electricidad! Su perfil ya está disponible para empresas aliadas. ¡Sigue adelante, Felipe!",
    achievementDetails: {
      studentName: "Felipe Muñoz Rojas",
      specialty: "Técnico en Electricidad",
    },
    likes: 34,
    comments: 8,
  },
  {
    id: 3,
    type: "post",
    author: {
      name: "Felipe Muñoz Rojas",
      role: "student",
      avatar:
        "https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=60&h=60&fit=crop&auto=format",
      subtitle: "Técnico en Electricidad · 4° Medio TP",
    },
    time: "hace 1 día",
    content:
      "¡Terminé mi proyecto de tablero trifásico en el taller! Semanas de trabajo y finalmente quedó perfecto. Gracias a la Prof. García por la guía 🙏 #LiceoCardenalCaro #Electricidad",
    image:
      "https://images.unsplash.com/photo-1520229534044-62d7cd4e9b0f?w=700&h=400&fit=crop&auto=format",
    likes: 45,
    comments: 12,
  },
  {
    id: 4,
    type: "event",
    author: {
      name: "Prof. Ana García Vidal",
      role: "teacher",
      avatar:
        "https://images.unsplash.com/photo-1650600538903-ec09f670c391?w=60&h=60&fit=crop&auto=format",
      subtitle: "Docente · Dpto. Electricidad · Liceo Cardenal Caro",
      verified: true,
    },
    time: "hace 1 día",
    content:
      "📅 Feria de Empleabilidad Técnica en el Liceo. Empresas de Lo Espejo y Santiago estarán presentes buscando talento técnico. ¡Es la oportunidad que esperaban, alumnos!",
    eventDetails: {
      date: "15 Abril 2025",
      time: "10:00 - 16:00 hrs",
      location: "Patio central, Liceo Cardenal Caro",
    },
    likes: 67,
    comments: 23,
  },
  {
    id: 5,
    type: "job",
    author: {
      name: "Constructora Del Maule",
      role: "company",
      avatar:
        "https://images.unsplash.com/photo-1630599073777-2fc89fd57921?w=60&h=60&fit=crop&auto=format",
      subtitle: "Empresa verificada · Santiago",
      verified: true,
    },
    time: "hace 2 días",
    content:
      "🏗️ Oportunidad para egresados de Construcción. Práctica laboral con proyección real a contrato. Aprende en obra con profesionales. Priorizamos egresados de Lo Espejo.",
    jobDetails: {
      title: "Ayudante en Obra",
      type: "Práctica",
      salary: "A convenir",
      specialty: "Construcción",
      location: "Santiago Centro",
    },
    likes: 28,
    comments: 6,
  },
  {
    id: 6,
    type: "post",
    author: {
      name: "Valentina Soto Leal",
      role: "student",
      avatar:
        "https://images.unsplash.com/photo-1650600538903-ec09f670c391?w=60&h=60&fit=crop&auto=format",
      subtitle: "Computación e Informática · EPJA",
    },
    time: "hace 2 días",
    content:
      "Acabo de completar el curso de Desarrollo Web en Udemy 🎉 Ya domino HTML, CSS y empecé con JavaScript. El próximo paso es React. ¡El aprendizaje no para! #AprendizajeContinuo #Tecnología",
    likes: 31,
    comments: 9,
  },
  {
    id: 7,
    type: "achievement",
    author: {
      name: "Liceo Cardenal Caro",
      role: "teacher",
      avatar: null,
      subtitle: "Institución · Lo Espejo",
      verified: true,
    },
    time: "hace 3 días",
    content:
      "✅ Matías Contreras Vega ha completado su validación de competencias en Mecánica Automotriz. ¡Otro egresado listo para el mundo laboral con el respaldo del Liceo!",
    achievementDetails: {
      studentName: "Matías Contreras Vega",
      specialty: "Mecánica Automotriz",
    },
    likes: 22,
    comments: 5,
  },
];

export const jobListings = [
  {
    id: 1,
    title: "Técnico Electricista Junior",
    company: "Eléctrica Cordillera SpA",
    logo: "https://images.unsplash.com/photo-1601119463467-ad343113e3c5?w=60&h=60&fit=crop&auto=format",
    type: "Part-time",
    salary: "$450.000/mes",
    specialty: "Electricidad",
    location: "Lo Espejo",
    posted: "hace 2 horas",
    verified: true,
    description: "Instalación y mantención de sistemas eléctricos residenciales. Se requiere conocimiento básico de tableros y cableado.",
    requirements: ["Estudiante o egresado de Electricidad", "Disponibilidad inmediata", "Responsabilidad demostrada"],
  },
  {
    id: 2,
    title: "Ayudante en Obra",
    company: "Constructora Del Maule",
    logo: "https://images.unsplash.com/photo-1630599073777-2fc89fd57921?w=60&h=60&fit=crop&auto=format",
    type: "Práctica",
    salary: "A convenir",
    specialty: "Construcción",
    location: "Santiago Centro",
    posted: "hace 2 días",
    verified: true,
    description: "Práctica laboral en faena activa. Aprendizaje real con posibilidad de contrato a futuro.",
    requirements: ["Egresado de Construcción", "Trabajo en equipo", "Disposición a aprender"],
  },
  {
    id: 3,
    title: "Soporte TI Part-time",
    company: "TechSur Ltda.",
    logo: "https://images.unsplash.com/photo-1657558665549-bd7d82afed8c?w=60&h=60&fit=crop&auto=format",
    type: "Part-time",
    salary: "$380.000/mes",
    specialty: "Computación e Informática",
    location: "Pedro Aguirre Cerda",
    posted: "hace 3 días",
    verified: true,
    description: "Soporte a usuarios, instalación de equipos y gestión de redes locales.",
    requirements: ["Estudiante de Computación", "Conocimiento en redes", "Trato amable con usuarios"],
  },
  {
    id: 4,
    title: "Mecánico Automotriz",
    company: "Automotora Los Andes",
    logo: "https://images.unsplash.com/photo-1690129070358-355e4d9c2fc7?w=60&h=60&fit=crop&auto=format",
    type: "Full-time",
    salary: "$550.000/mes",
    specialty: "Mecánica Automotriz",
    location: "La Cisterna",
    posted: "hace 4 días",
    verified: false,
    description: "Diagnóstico y reparación de vehículos livianos. Taller moderno con herramientas actualizadas.",
    requirements: ["Egresado de Mecánica Automotriz", "Experiencia o práctica previa", "Carnet B (deseable)"],
  },
];
