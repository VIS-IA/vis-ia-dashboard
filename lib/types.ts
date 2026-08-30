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
  detalle: string | null;
}

export interface ReputationDetail {
  avgRating: number;
  avgRatingPrevious: number;
  totalReviews: number;
  totalReviewsPrevious: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  responseRatePercent: number;
  unrespondedNegative: number;
}

export type ExperienceDetail =
  | {
      type: "negocio";
      sentimentScore: number;
      sentimentScorePrevious: number | null;
      positiveMentions: number;
      negativeMentions: number;
      topTheme: string | null;
    }
  | {
      type: "hotel";
      cleanliness: number;
      cleanlinessPrevious: number | null;
      staff: number;
      staffPrevious: number | null;
      comfort: number;
      comfortPrevious: number | null;
      location: number;
      locationPrevious: number | null;
      valueForMoney: number;
      valueForMoneyPrevious: number | null;
    };

export interface Competitor {
  name: string;
  rating: number;
  reviewCount: number;
  notes: string | null;
  isYou: boolean;
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
