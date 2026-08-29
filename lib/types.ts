export type IconKey =
  | "trending-up"
  | "star"
  | "message-square"
  | "users"
  | "thumbs-down"
  | "clock"
  | "megaphone"
  | "camera";

export interface DashboardMetric {
  icon_key: IconKey;
  label: string;
  value: string;
  suffix: string | null;
  stars: number | null;
  previous: string;
  delta: string;
  accent: "blue" | "green" | "purple";
}

export interface DashboardLoss {
  icon_key: IconKey;
  titulo: string;
  descripcion: string;
  impacto: "Alto" | "Media" | "Baja";
}

export interface DashboardOpportunity {
  icon_key: IconKey;
  titulo: string;
  descripcion: string;
  potencial: "Alto" | "Medio" | "Baja";
}

export interface DashboardAction {
  texto: string;
  prioridad: "Alta" | "Media" | "Baja";
}

export interface DashboardData {
  business: {
    name: string;
    location: string;
    visId: string;
    logoInitial: string;
  };
  user: {
    name: string;
    role: string;
  };
  lastAnalysis: string;
  nextAnalysis: string;
  visScore: {
    current: number;
    previous: number;
    delta: number;
    status: string;
    statusNote: string;
  };
  detected: {
    perdidas: number;
    areas: number;
    oportunidades: number;
  };
  accionRecomendada: {
    titulo: string;
    motivo: string;
  };
  metrics: DashboardMetric[];
  perdidas: DashboardLoss[];
  oportunidades: DashboardOpportunity[];
  acciones: DashboardAction[];
}
