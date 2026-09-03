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

export type CertaintyLevel =
  | "Confirmado"
  | "Medido"
  | "Estimado"
  | "Potencial"
  | "No calculable";

export interface DashboardLoss {
  icon_key: IconKey;
  titulo: string;
  descripcion: string;
  impacto: "Alto" | "Media" | "Baja";
  evidencia: string | null;
  causaProbable: string | null;
  nivelCerteza: CertaintyLevel | null;
  montoEstimado: number | null;
  moneda: string;
  supuestos: string | null;
}

export interface DashboardOpportunity {
  icon_key: IconKey;
  titulo: string;
  descripcion: string;
  potencial: "Alto" | "Medio" | "Baja";
  evidencia: string | null;
  causaProbable: string | null;
  nivelCerteza: CertaintyLevel | null;
  montoEstimado: number | null;
  moneda: string;
  supuestos: string | null;
}

export interface DashboardAction {
  texto: string;
  prioridad: "Alta" | "Media" | "Baja";
  detalle: string | null;
  problema: string | null;
  evidencia: string | null;
  causaProbable: string | null;
  nivelCerteza: CertaintyLevel | null;
  metrica: string | null;
  fechaRevision: string | null;
}

export interface ReputationDetail {
  avgRating: number;
  avgRatingPrevious: number | null;
  totalReviews: number;
  totalReviewsPrevious: number | null;
  positiveCount: number | null;
  neutralCount: number | null;
  negativeCount: number | null;
  responseRatePercent: number | null;
  unrespondedNegative: number | null;
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

export interface OtherReputation {
  platform: string;
  rating: number;
  scale: 5 | 10;
  ratingOn5: number;
  reviewCount: number | null;
}

export type QuestionResponseType =
  | "single_select"
  | "multi_select"
  | "text"
  | "economic_impact";

export interface OnboardingQuestion {
  questionKey: string;
  orderNum: number;
  questionText: string;
  purpose: string | null;
  responseType: QuestionResponseType;
  options: string[] | null;
  hasTextField: boolean;
  textFieldLabel: string | null;
  required: boolean;
}

export type OnboardingAnswerValue =
  | { selected: string; texto: string }
  | { selected: string[]; texto: string }
  | { texto: string }
  | {
      antes: string;
      durante: string;
      despues: string;
      cuantificacion: string;
      monto: string;
      calculo: string;
    };

export interface OnboardingAnswer {
  questionKey: string;
  answer: OnboardingAnswerValue;
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
  resumenEjecutivo: string | null;
  nextAnalysis: string;
  visScore: {
    current: number | null;
    previous: number | null;
    delta: number | null;
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
