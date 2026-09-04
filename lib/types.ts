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

export type VisualEvidenceType = "photo" | "video";
export type ImpactLevel = "low" | "medium" | "high" | "critical";

/**
 * Evidencia visual — nunca se descarga ni se guarda la imagen/video en
 * sí, solo la referencia (source_url) a la fuente pública original.
 * El cliente comprueba la evidencia directamente en su fuente.
 */
export interface VisualEvidence {
  evidenceType: VisualEvidenceType;
  source: string;
  sourceUrl: string;
  title: string;
  impact: ImpactLevel;
  category: string;
  analysis: string;
  verified: boolean;
  requiresHumanReview: boolean;
}

/**
 * VIS Evidence Record — un registro de evidencia completo y trazable
 * (no solo un número): una reseña real, con la respuesta del
 * propietario, sus fotos asociadas, y la clasificación temporal que
 * evita afirmar que una condición pasada sigue vigente hoy.
 */
export type ResolutionStatus = "yes" | "not_evident" | "unknown";
export type TemporalStatus = "historical" | "current";

export interface EvidenceRecordIssue {
  category: string;
  severity: ImpactLevel;
}

export interface EvidenceRecordPhoto {
  evidenceType: VisualEvidenceType;
  sourceUrl: string;
  description: string;
  category: string;
  impact: ImpactLevel;
  analysis: string;
}

export interface EvidenceRecord {
  source: string;
  sourceUrl: string;
  author: string | null;
  reviewDateLabel: string | null;
  rating: number | null;
  reviewText: string;
  ownerResponse: string | null;
  ownerResponseDateLabel: string | null;
  resolutionDemonstrated: ResolutionStatus;
  temporalStatus: TemporalStatus;
  publicPersistence: boolean;
  analysis: string;
  confidence: CertaintyLevel | null;
  requiresHumanReview: boolean;
  issues: EvidenceRecordIssue[];
  photos: EvidenceRecordPhoto[];
}

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

export type EvidenceSourceType = "reviews_text" | "platform_score";

/**
 * Una "señal" de experiencia del cliente para una categoría (limpieza,
 * servicio, check-in, etc.), con su origen explícito. Distingue los
 * dos tipos de evidencia que VIS IA puede usar sin mezclarlas:
 * - reviews_text: reseñas analizadas (Google, etc.) — conteos y patrón
 * - platform_score: puntuación ya calculada por la plataforma (Booking, Expedia)
 */
export interface ExperienceSignal {
  category: string;
  source: string;
  sourceType: EvidenceSourceType;
  reviewsAnalyzed: number | null;
  positiveMentions: number | null;
  negativeMentions: number | null;
  platformScore: number | null;
  platformScoreScale: number | null;
  evidence: string | null;
  pattern: string | null;
  confidence: CertaintyLevel | null;
  analyzedAt: string | null;
}

export interface ExperienceDetail {
  signals: ExperienceSignal[];
}

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
