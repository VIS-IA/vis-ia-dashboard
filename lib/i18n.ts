export type Language = "es" | "en";

/**
 * Diccionario del panel del cliente — SOLO textos fijos de interfaz
 * (menú, títulos, botones genéricos). El contenido de cada reporte
 * (hallazgos, resúmenes, análisis) NO se traduce automáticamente: se
 * redacta directamente en el idioma de ese cliente al publicar su
 * reporte, porque el idioma del panel es fijo por cliente (definido
 * una vez al crearlo, ver `clients.language`), nunca elegido por el
 * cliente en el momento.
 *
 * Se va ampliando página por página — cada página nueva que se
 * traduce agrega su propia sección acá y llama a getDictionary(lang)
 * en vez de tener el texto en español embebido directamente.
 */
export interface Dictionary {
  nav: {
    home: string;
    account: string;
    groupLabels: Record<"diagnostic" | "pro" | "intelligence", string>;
    yourPlan: string;
    seeEverythingIncluded: string; // ej. "Ver todo lo que incluye {group}"
    items: Record<string, string>; // href -> label
    needHelp: string;
    writeUsOnWhatsapp: string;
    support: string;
  };
  home: {
    welcomeTitle: string;
    noReportTitle: string;
    noReportBody: string;
    answerQuestions: string;
    alreadyAnsweredThanks: string;
    missingQuestionsBanner: string;
    lastAnalysis: string;
    downloadReport: (pdf: boolean) => string;
    greeting: (name: string) => string;
    visScorePendingBadge: string;
    visScorePendingOnboardingDone: string;
    visScorePendingOnboardingMissing: string;
    visIaDetected: string;
    invisibleLosses: (n: number) => string;
    invisibleLossesSubtitle: string;
    areasNeedingAttention: (n: number) => string;
    areasNeedingAttentionSubtitle: string;
    hiddenValueOpportunities: (n: number) => string;
    hiddenValueOpportunitiesSubtitle: string;
    recommendedActionNumber1: string;
    seeDetailAndPlan: string;
    whatChangedTitle: string;
    seeFullComparison: string;
    fullComparisonProOnly: string;
    mainInvisibleLosses: string;
    impacto: string;
    seeAllLosses: string;
    hiddenValueOpportunitiesTitle: string;
    potencial: string;
    seeAllOpportunities: string;
    nextPriorityActions: string;
    seeFullActionPlan: string;
    watchingBusiness: string;
    watchingBusinessBody: string;
    nextAutomaticAnalysis: string;
    seeAllReports: string;
  };
  shareButton: {
    shareThisFinding: string;
    copied: string;
    share: string;
  };
  common: {
    noAnalysisAvailable: string;
    impacto: string;
    potencial: string;
    certeza: string;
    evidencia: string;
    causaProbable: string;
    problema: string;
    notCalculable: string;
    firstReport: string;
    before: string;
  };
  upgradeNotice: {
    availableFrom: (feature: string, plan: string) => string;
    writeUsOnWhatsapp: string;
  };
  lockedPreview: {
    availableFrom: (feature: string, plan: string) => string;
    sampleDataNotice: string;
    upgradeTo: (plan: string) => string;
  };
  visScore: {
    title: string;
    lastAnalysis: (date: string) => string;
    noAnalysis: string;
    pendingBadge: string;
    pendingOnboardingDone: string;
    pendingOnboardingMissing: string;
    previousScore: (n: number) => string;
    whyThisScore: string;
    reputation: string;
    ratingOnGoogle: (rating: string, count: number) => string;
    customerExperience: string;
    signalsAnalyzed: (n: number) => string;
    digitalPresence: string;
    confirmedOnPlatforms: (count: number, names: string) => string;
    competitiveness: string;
    competitorsCompared: (n: number) => string;
    frictionsDetected: string;
    invisibleLossesIdentified: (n: number) => string;
    noFrictionsDetected: string;
    mainVisSignals: string;
    frictionLabel: string;
    frictionResponseManagement: (prevRate: number, rate: number) => string;
    gapLabel: string;
    strengthLabel: string;
    evolutionTitle: string;
    evolutionUpgradeFeature: string;
    evolutionEmpty: string;
  };
  perdidas: {
    title: string;
    subtitle: string;
    empty: string;
    shareTitle: (businessName: string) => string;
  };
  oportunidades: {
    title: string;
    subtitle: string;
    empty: string;
    shareTitle: (businessName: string) => string;
    whyThisOpportunity: string;
    whyThisExists: string;
  };
  planAccion: {
    title: string;
    subtitle: string;
    empty: string;
    shareTitle: (businessName: string) => string;
    problema: string;
    evidencia: string;
    causaProbable: string;
    impacto: string;
    howWeWillKnowItWorked: string;
    successMetric: string;
    reviewDate: string;
    priority: string;
    footerNote: string;
  };
  reputacion: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    whyThisAffectsYou: string;
    mainReputationGoogle: string;
    averageRating: string;
    totalReviews: string;
    reviewsDistribution: string;
    positive: string;
    neutral: string;
    negative: string;
    unrespondedNegative: (n: number) => string;
    checkActionPlan: string;
    responseManagement: string;
    frictionResponseManagement: (prevRate: number, rate: number) => string;
    responded: string;
    unresponded: string;
    responseRate: string;
    averageTime: string;
    days: string;
    otherReputations: string;
    reputationGapSignal: (gap: string) => string;
    reviewsCount: (n: number) => string;
  };
  experiencia: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    reviewsAnalyzedLabel: string;
    platformScoreLabel: string;
    reviewsAnalyzedCount: (n: number) => string;
    detectedPattern: string;
    analyzed: (date: string) => string;
    footerNote: string;
  };
  competencia: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    you: string;
    reviewsCount: (n: number) => string;
  };
  evidencia: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    visEvidence: string;
    historicalEvidence: string;
    recentEvidence: string;
    persistentPublicExposure: string;
    ownerResponse: string;
    resolutionDemonstrated: string;
    yes: string;
    no: string;
    notEvident: string;
    unknown: string;
    issuesDetected: string;
    visAnalysis: string;
    requiresHumanReview: string;
    respondToReview: string;
    visualEvidence: string;
    seeOriginalEvidence: string;
    seeOriginalReview: string;
    otherVisualEvidence: string;
    impactLabel: string;
    video: string;
    photo: string;
    source: string;
    category: string;
    verified: string;
    unverified: string;
    requiresHumanReviewLong: string;
    impactLevels: Record<"BAJO" | "MEDIO" | "ALTO" | "CRÍTICO", string>;
  };
  reportes: {
    title: string;
    subtitle: string;
    empty: string;
    analysisFrom: (date: string) => string;
    pending: string;
  };
  comparacion: {
    title: string;
    subtitle: string;
    subtitleWithDate: (date: string) => string;
    noAnalysis: string;
    overallScore: string;
    activityMetrics: string;
    reputation: string;
    averageRating: string;
    totalReviews: string;
    webTrafficGoogle: string;
    customerExperience: string;
    comparisonComingSoon: string;
    positiveNegative: (pos: number, neg: number) => string;
  };
  presenciaWeb: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    hasWebsite: string;
    mobileFriendly: string;
    consistentContactInfo: string;
    onlineBooking: string;
    notEvaluated: string;
    yes: string;
    no: string;
    lastContentUpdate: string;
    overallAssessment: string;
    specificFindings: string;
    evidencia: string;
    sampleFindings: { titulo: string; descripcion: string; impacto: string; categoria: string }[];
  };
  redesSociales: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    followers: string;
    frequency: string;
    lastPost: string;
    respondsToComments: string;
    yes: string;
    no: string;
    overallAssessment: string;
    noProfileFound: string;
    specificFindings: string;
    evidencia: string;
    whatToDo: string;
    whyLabel: string;
    sampleProfile: {
      platform: string;
      handle: string;
      lastPostLabel: string;
      postingFrequencyLabel: string;
    };
    sampleFindings: {
      titulo: string;
      descripcion: string;
      impacto: string;
      categoria: string;
      accionRecomendada: string;
      porQue: string;
    }[];
  };
  noticias: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    overallAssessment: string;
    noMentionsFound: string;
    seeSource: string;
    sampleMention: {
      titulo: string;
      fuente: string;
      fechaLabel: string;
      resumen: string;
    };
  };
  evolucionWeb: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    historicalEvolution: string;
    trafficAndBehavior: string;
    source: string;
    whatToDo: string;
    whyLabel: string;
    trendLabels: Record<"Mejorando" | "Empeorando" | "Estable" | "Sin datos suficientes", string>;
    sample: {
      resumenEvolucion: string;
      traficoEstimadoLabel: string;
      traficoFuente: string;
      comportamientoVisitantes: string;
      accionRecomendada: string;
      porQue: string;
    };
  };
  asistente: {
    title: string;
    noAnalysis: string;
    subtitleFor: (businessName: string) => string;
    trialEndedBody: string;
    askAbout: (businessName: string) => string;
    trialNoticeWithDate: (date: string) => string;
    trialNoticeNoDate: string;
  };
  tendencias: {
    title: string;
    subtitle: string;
    upgradeFeature: string;
    noHistory: string;
    visScoreEvolution: string;
    visScoreReading: string;
    averageRatingEvolution: string;
    ratingReading: string;
    reviewsCountEvolution: string;
    reviewsVolumeReading: string;
  };
  preguntas: {
    title: string;
    emptyConfig: string;
    alreadyAnsweredSubtitle: string;
    alreadyAnsweredBanner: string;
    subtitle: string;
    before: string;
    during: string;
    after: string;
    quantification: string;
    amount: string;
    calculation: string;
  };
  miCuenta: {
    title: string;
    paymentReceived: string;
    paymentCancelled: string;
    email: string;
    business: string;
    visId: string;
    currentPlan: string;
    pastDueWarning: string;
    planWillCancel: (date: string | null) => string;
    undoCancellation: string;
    planWillChange: (plan: string, date: string | null) => string;
    termsOfService: string;
    privacyPolicy: string;
    upgradePlan: string;
    securePaymentNote: string;
    upgradeTo: (plan: string) => string;
    changePlan: string;
    changePlanNote: string;
    changeTo: (plan: string) => string;
    noLongerWantPlan: string;
    cancelMyPlan: string;
  };
  cancelarPlan: {
    title: string;
    noActiveSubscription: (plan: string) => string;
    backToAccount: string;
  };
  planDetail: {
    currentPlanBadge: string;
    alreadyIncludedBadge: (plan: string) => string;
    whatsIncluded: string;
    open: string;
    upgradeToPlan: (plan: string) => string;
    upgradeButton: (plan: string) => string;
    content: Record<
      "diagnostic" | "pro" | "intelligence",
      {
        title: string;
        tagline: string;
        items: { label: string; href?: string }[];
        note?: string;
      }
    >;
  };
}

const es: Dictionary = {
  nav: {
    home: "Inicio",
    account: "Mi Cuenta",
    groupLabels: {
      diagnostic: "Diagnostic",
      pro: "Pro",
      intelligence: "Intelligence",
    },
    yourPlan: "Tu plan",
    seeEverythingIncluded: "Ver todo lo que incluye",
    items: {
      "/panel/preguntas": "15 Preguntas",
      "/panel/vis-score": "VIS Score",
      "/panel/perdidas": "Pérdida Invisible",
      "/panel/oportunidades": "Valor Oculto",
      "/panel/reputacion": "Reputación",
      "/panel/experiencia": "Experiencia del Cliente",
      "/panel/competencia": "Competencia",
      "/panel/evidencia": "Evidencia Visual",
      "/panel/plan-accion": "Plan de Acción",
      "/panel/reportes": "Reportes",
      "/panel/comparacion": "Comparación Completa",
      "/panel/presencia-web": "Presencia Web",
      "/panel/redes-sociales": "Redes Sociales",
      "/panel/noticias": "Noticias y Menciones",
      "/panel/evolucion-web": "Evolución del Sitio Web",
      "/panel/asistente": "Asistente IA",
      "/panel/tendencias": "Análisis de Tendencias",
    },
    needHelp: "¿Necesitas ayuda?",
    writeUsOnWhatsapp: "Escríbenos por WhatsApp",
    support: "Soporte VIS IA",
  },
  home: {
    welcomeTitle: "Bienvenido a VIS IA",
    noReportTitle: "Aún no hay un análisis publicado",
    noReportBody:
      "Tu cuenta está activa. VIS IA está preparando tu primer reporte — mientras tanto, ayúdanos respondiendo las 15 preguntas sobre tu negocio; esa información es parte del análisis.",
    answerQuestions: "Responder las 15 preguntas",
    alreadyAnsweredThanks:
      "Ya respondiste las 15 preguntas — gracias. Te avisaremos cuando tu primer reporte esté listo.",
    missingQuestionsBanner:
      "Nos faltan tus respuestas a las 15 preguntas sobre tu negocio — tómate unos minutos para completarlas",
    lastAnalysis: "Último análisis",
    downloadReport: (pdf) => `Descargar reporte${pdf ? " (PDF)" : ""}`,
    greeting: (name) => `Hola, ${name}`,
    visScorePendingBadge: "PENDIENTE",
    visScorePendingOnboardingDone:
      "Ya recibimos tus respuestas a las 15 preguntas — VIS IA está terminando de calcular tu VIS Score con esa información.",
    visScorePendingOnboardingMissing:
      "El VIS Score se calcula cuando se completen las 15 preguntas — el análisis externo ya está listo, falta tu información interna.",
    visIaDetected: "VIS IA detectó:",
    invisibleLosses: (n) => `${n} PÉRDIDAS INVISIBLES`,
    invisibleLossesSubtitle: "Están afectando tus resultados",
    areasNeedingAttention: (n) => `${n} ÁREAS QUE REQUIEREN ATENCIÓN`,
    areasNeedingAttentionSubtitle: "Podrían convertirse en problemas",
    hiddenValueOpportunities: (n) => `${n} OPORTUNIDADES DE VALOR OCULTO`,
    hiddenValueOpportunitiesSubtitle: "Puedes aprovechar para crecer más",
    recommendedActionNumber1: "ACCIÓN RECOMENDADA #1",
    seeDetailAndPlan: "Ver detalle y plan",
    whatChangedTitle: "¿Qué cambió desde tu último análisis?",
    seeFullComparison: "Ver comparación completa",
    fullComparisonProOnly: "Comparación completa — disponible en PRO",
    mainInvisibleLosses: "PÉRDIDAS INVISIBLES PRINCIPALES",
    impacto: "Impacto",
    seeAllLosses: "Ver todas las pérdidas",
    hiddenValueOpportunitiesTitle: "OPORTUNIDADES DE VALOR OCULTO",
    potencial: "Potencial",
    seeAllOpportunities: "Ver todas las oportunidades",
    nextPriorityActions: "PRÓXIMAS ACCIONES PRIORITARIAS",
    seeFullActionPlan: "Ver plan de acción completo",
    watchingBusiness: "VIS IA está vigilando tu negocio 24/7",
    watchingBusinessBody:
      "Analizamos, detectamos y te mostramos lo que realmente importa para que tomes mejores decisiones.",
    nextAutomaticAnalysis: "Próximo análisis automático",
    seeAllReports: "Ver todos los reportes",
  },
  shareButton: {
    shareThisFinding: "Compartir este hallazgo",
    copied: "Copiado",
    share: "Compartir",
  },
  common: {
    noAnalysisAvailable: "Aún no hay un análisis disponible para tu negocio.",
    impacto: "Impacto",
    potencial: "Potencial",
    certeza: "Certeza",
    evidencia: "Evidencia",
    causaProbable: "Causa probable",
    problema: "Problema",
    notCalculable: "No calculable con la información disponible",
    firstReport: "Primer reporte",
    before: "Antes",
  },
  upgradeNotice: {
    availableFrom: (feature, plan) => `${feature} está disponible a partir del plan ${plan}`,
    writeUsOnWhatsapp: "Escríbenos por WhatsApp si quieres subir de plan.",
  },
  lockedPreview: {
    availableFrom: (feature, plan) => `${feature} está disponible a partir del plan ${plan}`,
    sampleDataNotice:
      "Lo que ves detrás es un ejemplo con datos de muestra — así se vería con tu negocio real.",
    upgradeTo: (plan) => `Subir a ${plan}`,
  },
  visScore: {
    title: "VIS Score",
    lastAnalysis: (date) => `Último análisis: ${date}`,
    noAnalysis: "Aún no hay un análisis disponible para tu negocio.",
    pendingBadge: "PENDIENTE",
    pendingOnboardingDone:
      "Ya recibimos tus respuestas a las 15 preguntas — VIS IA está terminando de calcular tu VIS Score con esa información.",
    pendingOnboardingMissing:
      "El análisis externo de tu negocio ya está listo, pero el VIS Score todavía no se calcula — falta que completes las 15 preguntas internas. VIS IA no asigna un puntaje sin esa información, para no basarlo en datos incompletos.",
    previousScore: (n) => `Puntaje anterior: ${n}/100`,
    whyThisScore: "¿Por qué este Score?",
    reputation: "Reputación",
    ratingOnGoogle: (rating, count) => `${rating}/5 en Google (${count} reseñas)`,
    customerExperience: "Experiencia del Cliente",
    signalsAnalyzed: (n) => `${n} señal${n > 1 ? "es" : ""} analizada${n > 1 ? "s" : ""}`,
    digitalPresence: "Presencia Digital",
    confirmedOnPlatforms: (count, names) =>
      `Perfil confirmado en ${count} plataforma${count > 1 ? "s" : ""} (${names})`,
    competitiveness: "Competitividad",
    competitorsCompared: (n) => `${n} competidor${n > 1 ? "es" : ""} comparado${n > 1 ? "s" : ""}`,
    frictionsDetected: "Fricciones detectadas",
    invisibleLossesIdentified: (n) =>
      `${n} pérdida${n > 1 ? "s" : ""} invisible${n > 1 ? "s" : ""} identificada${n > 1 ? "s" : ""}`,
    noFrictionsDetected: "No se detectaron fricciones en el último análisis",
    mainVisSignals: "Principales señales VIS",
    frictionLabel: "Fricción:",
    frictionResponseManagement: (prevRate, rate) =>
      `abandono de gestión de reputación — la tasa de respuesta a reseñas cayó de ${prevRate}% a ${rate}%`,
    gapLabel: "Brecha:",
    strengthLabel: "Fortaleza:",
    evolutionTitle: "Evolución del VIS Score",
    evolutionUpgradeFeature: "Ver la evolución de tu VIS Score en el tiempo",
    evolutionEmpty:
      'El historial completo de tu VIS Score a través del tiempo aparecerá aquí a medida que se publiquen más reportes. Puedes ver todos tus reportes anteriores en la sección "Reportes".',
  },
  perdidas: {
    title: "Pérdida Invisible",
    subtitle: "Todo lo que VIS IA detectó que te está costando dinero o clientes",
    empty: "No se detectaron pérdidas invisibles en el último análisis. 🎉",
    shareTitle: (businessName) => `PÉRDIDA INVISIBLE — ${businessName}`,
  },
  oportunidades: {
    title: "Valor Oculto",
    subtitle: "Oportunidades que VIS IA identificó para que crezcas más",
    empty: "No se detectaron nuevas oportunidades en el último análisis.",
    shareTitle: (businessName) => `VALOR OCULTO — ${businessName}`,
    whyThisOpportunity: "Por qué existe esta oportunidad:",
    whyThisExists: "Por qué existe:",
  },
  planAccion: {
    title: "Plan de Acción",
    subtitle:
      "El análisis completo detrás de cada prioridad: qué encontramos, por qué importa, y cómo saber si funcionó",
    empty: "No hay acciones pendientes en este momento.",
    shareTitle: (businessName) => `PLAN DE ACCIÓN — ${businessName}`,
    problema: "Problema",
    evidencia: "Evidencia",
    causaProbable: "Causa probable",
    impacto: "Impacto",
    howWeWillKnowItWorked: "Cómo sabremos que funcionó",
    successMetric: "Métrica de éxito",
    reviewDate: "Fecha de revisión",
    priority: "Prioridad",
    footerNote:
      'Cuando marcamos "Certeza: Potencial" o "No calculable" significa que existe una señal real, pero no suficiente evidencia todavía para convertirla en una cifra exacta — nunca inventamos un número donde no lo hay.',
  },
  reputacion: {
    title: "Reputación",
    subtitle: "Google es tu reputación principal — otras plataformas se muestran como contexto",
    emptyTitle: "Aún no hay datos de reputación cargados",
    emptyBody: "Cuando VIS IA publique el detalle de reseñas de tu negocio, aparecerá aquí.",
    whyThisAffectsYou: "Por qué esto te afecta tanto",
    mainReputationGoogle: "Reputación principal — Google",
    averageRating: "Calificación promedio",
    totalReviews: "Reseñas totales",
    reviewsDistribution: "Distribución de reseñas",
    positive: "Positivas",
    neutral: "Neutrales",
    negative: "Negativas",
    unrespondedNegative: (n) => `${n} reseñas negativas sin responder`,
    checkActionPlan: "Revisa el Plan de Acción para priorizar esto",
    responseManagement: "Response Management",
    frictionResponseManagement: (prevRate, rate) =>
      `la tasa de respuesta cayó de ${prevRate}% a ${rate}% frente al reporte anterior. Esto suele indicar un cambio operativo (menos personal, cambio de dueño, o descuido) que vale la pena investigar antes de que afecte más la reputación.`,
    responded: "Respondidas",
    unresponded: "Sin responder",
    responseRate: "Tasa de respuesta",
    averageTime: "Tiempo promedio",
    days: "días",
    otherReputations: "Otras reputaciones",
    reputationGapSignal: (gap) =>
      `la percepción de tu negocio no es uniforme entre plataformas (diferencia de ${gap} puntos sobre 5). Vale la pena investigar qué está generando esta diferencia.`,
    reviewsCount: (n) => `${n} reseñas`,
  },
  experiencia: {
    title: "Experiencia del Cliente",
    subtitle:
      "Basado en fuentes públicas verificables — reseñas analizadas y puntuaciones de plataformas, sin mezclarlas",
    emptyTitle: "Aún no hay datos de experiencia del cliente cargados",
    emptyBody: "Cuando VIS IA publique este detalle, aparecerá aquí.",
    reviewsAnalyzedLabel: "Reseñas analizadas",
    platformScoreLabel: "Puntuación de plataforma",
    reviewsAnalyzedCount: (n) => `${n} reseñas analizadas`,
    detectedPattern: "Patrón detectado:",
    analyzed: (date) => `Analizado: ${date}`,
    footerNote:
      "Cada señal conserva su origen: las reseñas analizadas y las puntuaciones publicadas por plataformas (Booking, Expedia, etc.) son evidencia de distinto tipo y nunca se presentan como si fueran lo mismo.",
  },
  competencia: {
    title: "Competencia",
    subtitle: "Cómo te comparas con negocios similares en tu zona",
    emptyTitle: "Aún no hay comparación de competencia cargada",
    emptyBody: "Cuando VIS IA publique este detalle, aparecerá aquí.",
    you: "Tú",
    reviewsCount: (n) => `${n} reseñas`,
  },
  evidencia: {
    title: "Evidencia Visual",
    subtitle:
      "Referencia y análisis, con enlace directo a la fuente pública original — VIS IA no descarga ni almacena el contenido",
    emptyTitle: "Aún no hay evidencia cargada",
    emptyBody:
      "Cuando VIS IA identifique reseñas, fotos o videos relevantes en fuentes públicas, aparecerán aquí — con enlace directo a la fuente original, sin copiar el archivo.",
    visEvidence: "VIS Evidence",
    historicalEvidence: "Evidencia histórica",
    recentEvidence: "Evidencia reciente",
    persistentPublicExposure: "Exposición pública persistente",
    ownerResponse: "Respuesta del propietario",
    resolutionDemonstrated: "Resolución demostrada",
    yes: "Sí",
    no: "No",
    notEvident: "No evidente",
    unknown: "Desconocido",
    issuesDetected: "Issues Detected",
    visAnalysis: "Análisis VIS",
    requiresHumanReview: "Requiere revisión humana antes de tomarse como concluyente.",
    respondToReview: "Responder a esta reseña",
    visualEvidence: "Visual Evidence",
    seeOriginalEvidence: "Ver evidencia original",
    seeOriginalReview: "Ver reseña original",
    otherVisualEvidence: "Otra evidencia visual",
    impactLabel: "Impacto:",
    video: "Video",
    photo: "Foto",
    source: "Fuente:",
    category: "Categoría:",
    verified: "Verificado",
    unverified: "Sin verificar",
    requiresHumanReviewLong:
      "La interpretación definitiva de esta evidencia requiere revisión humana antes de tomarse como concluyente.",
    impactLevels: { BAJO: "BAJO", MEDIO: "MEDIO", ALTO: "ALTO", CRÍTICO: "CRÍTICO" },
  },
  reportes: {
    title: "Reportes",
    subtitle: "Todos los análisis publicados para tu negocio",
    empty: "Aún no hay reportes publicados.",
    analysisFrom: (date) => `Análisis del ${date}`,
    pending: "Pendiente",
  },
  comparacion: {
    title: "Comparación Completa",
    subtitle: "Antes y después de tu negocio, reporte a reporte",
    subtitleWithDate: (date) => `Tu negocio: antes vs. ahora — comparado con el análisis previo a ${date}`,
    noAnalysis: "Aún no hay un análisis disponible para tu negocio.",
    overallScore: "Puntaje general",
    activityMetrics: "Métricas de actividad",
    reputation: "Reputación",
    averageRating: "Calificación promedio",
    totalReviews: "Reseñas totales",
    webTrafficGoogle: "Tráfico perfil Google",
    customerExperience: "Experiencia del Cliente",
    comparisonComingSoon:
      "Comparación detallada disponible próximamente — por ahora se muestra el estado actual de cada señal.",
    positiveNegative: (pos, neg) => `${pos} positivas / ${neg} negativas`,
  },
  presenciaWeb: {
    title: "Presencia Web",
    subtitle: "Qué tan bien está trabajando tu propia página web para ti — separado de tus reseñas y redes sociales",
    emptyTitle: "Aún no hay un análisis de tu página web cargado",
    emptyBody: "Cuando VIS IA publique este detalle, aparecerá aquí.",
    hasWebsite: "¿Tiene página web?",
    mobileFriendly: "Adaptada a celular",
    consistentContactInfo: "Info. de contacto consistente",
    onlineBooking: "Reservas en línea",
    notEvaluated: "No evaluado",
    yes: "Sí",
    no: "No",
    lastContentUpdate: "Última actualización de contenido estimada",
    overallAssessment: "Evaluación general",
    specificFindings: "Hallazgos específicos",
    evidencia: "Evidencia:",
    sampleFindings: [
      {
        titulo: "El horario publicado no coincide con Google",
        descripcion:
          "La página web dice que cierran a las 6pm, pero Google Business Profile dice 8pm — esta inconsistencia genera desconfianza y llamadas perdidas.",
        impacto: "Alto",
        categoria: "Información de contacto",
      },
      {
        titulo: "Sin botón de reserva directa",
        descripcion:
          "Los visitantes tienen que llamar por teléfono para reservar — no hay forma de reservar en línea desde la propia web.",
        impacto: "Media",
        categoria: "Reservas online",
      },
    ],
  },
  redesSociales: {
    title: "Redes Sociales",
    subtitle: "Qué tan presente y activo está tu negocio en Instagram y Facebook — separado de tus reseñas",
    emptyTitle: "Aún no hay un análisis de tus redes sociales cargado",
    emptyBody: "Cuando VIS IA publique este detalle, aparecerá aquí.",
    followers: "Seguidores",
    frequency: "Frecuencia",
    lastPost: "Última publicación",
    respondsToComments: "Responde comentarios",
    yes: "Sí",
    no: "No",
    overallAssessment: "Evaluación general",
    noProfileFound:
      "No se encontró ninguna cuenta de Instagram o Facebook administrada específicamente por este negocio.",
    specificFindings: "Hallazgos específicos",
    evidencia: "Evidencia:",
    whatToDo: "Qué hacer:",
    whyLabel: "Por qué:",
    sampleProfile: {
      platform: "Instagram",
      handle: "@negocio_ejemplo",
      lastPostLabel: "Hace 6 semanas",
      postingFrequencyLabel: "~1 publicación al mes",
    },
    sampleFindings: [
      {
        titulo: "Sin presencia propia en redes sociales",
        descripcion:
          "No se encontró una cuenta de Instagram o Facebook administrada específicamente por este negocio — solo aparece la cuenta genérica de la marca/franquicia.",
        impacto: "Alto",
        categoria: "Presencia",
        accionRecomendada: "Crear una cuenta propia y publicar contenido real del negocio cada semana.",
        porQue: "Los clientes deciden con fotos recientes, no con las genéricas de la marca.",
      },
    ],
  },
  noticias: {
    title: "Noticias y Menciones",
    subtitle: "Qué se dice de tu negocio fuera de tus propios canales — medios, blogs y directorios",
    emptyTitle: "Aún no hay un análisis de noticias y menciones cargado",
    emptyBody: "Cuando VIS IA publique este detalle, aparecerá aquí.",
    overallAssessment: "Evaluación general",
    noMentionsFound:
      "No se encontró ninguna mención de este negocio en medios, blogs o directorios fuera de las páginas estándar de reservas/reseñas.",
    seeSource: "Ver fuente",
    sampleMention: {
      titulo: "Negocio local destacado en directorio de la cámara de comercio",
      fuente: "Cámara de Comercio local",
      fechaLabel: "Hace 4 meses",
      resumen: "Mención breve en un listado de negocios recomendados de la zona.",
    },
  },
  evolucionWeb: {
    title: "Evolución del Sitio Web",
    subtitle: "Cómo ha cambiado tu sitio con el tiempo y qué tan bien está convirtiendo visitantes en clientes",
    emptyTitle: "Aún no hay un análisis de evolución del sitio web cargado",
    emptyBody: "Cuando VIS IA publique este detalle, aparecerá aquí.",
    historicalEvolution: "Evolución histórica (Wayback Machine)",
    trafficAndBehavior: "Tráfico y comportamiento de visitantes",
    source: "Fuente:",
    whatToDo: "Qué hacer:",
    whyLabel: "Por qué:",
    trendLabels: {
      Mejorando: "Mejorando",
      Empeorando: "Empeorando",
      Estable: "Estable",
      "Sin datos suficientes": "Sin datos suficientes",
    },
    sample: {
      resumenEvolucion:
        "Comparando capturas de Wayback Machine de hace 2 años contra hoy, el sitio actualizó su diseño y agregó reservas en línea, pero el contenido de servicios sigue siendo casi idéntico.",
      traficoEstimadoLabel: "~2,400 visitas/mes",
      traficoFuente: "SimilarWeb.com (gratuito)",
      comportamientoVisitantes:
        "Duración promedio de 1:45 min y 2.1 páginas por visita — señal de interés moderado, no solo rebote inmediato.",
      accionRecomendada: "Agregar testimonios y precios claros en la página de inicio.",
      porQue: "Los visitantes se quedan pero no siempre encuentran la información que necesitan para decidir de inmediato.",
    },
  },
  asistente: {
    title: "Asistente IA",
    noAnalysis: "Aún no hay un análisis disponible para tu negocio.",
    subtitleFor: (businessName) => `Asistente de ${businessName}`,
    trialEndedBody:
      "Tu mes de prueba gratis de VIS ya terminó. VIS es una funcionalidad del plan Intelligence — actualiza tu plan para seguir teniendo acceso a tu asistente de forma permanente.",
    askAbout: (businessName) => `Pregúntale sobre el negocio de ${businessName}`,
    trialNoticeWithDate: (date) =>
      `VIS es una funcionalidad del plan Intelligence — tienes acceso gratis hasta el ${date}.`,
    trialNoticeNoDate:
      "VIS es una funcionalidad del plan Intelligence — tu negocio tiene acceso gratis por un mes, a partir de tu primer mensaje.",
  },
  tendencias: {
    title: "Análisis de Tendencias",
    subtitle: "Exclusivo de tu plan Intelligence — construido solo con reportes reales ya publicados",
    upgradeFeature:
      "El Análisis de Tendencias (evolución de tu reputación y detección de patrones a través de tus reportes)",
    noHistory:
      "Aún no hay ningún reporte publicado para tu negocio. Las tendencias aparecerán aquí a partir de tu primer reporte.",
    visScoreEvolution: "Evolución del VIS Score",
    visScoreReading: "Lectura del VIS Score",
    averageRatingEvolution: "Evolución de la calificación promedio",
    ratingReading: "Lectura de la calificación",
    reviewsCountEvolution: "Evolución de la cantidad de reseñas",
    reviewsVolumeReading: "Lectura del volumen de reseñas",
  },
  preguntas: {
    title: "15 Preguntas",
    emptyConfig: "El cuestionario aún no está configurado. Vuelve más tarde.",
    alreadyAnsweredSubtitle: "Ya respondiste este cuestionario — gracias",
    alreadyAnsweredBanner:
      "Tus respuestas ya fueron recibidas y VIS IA las está usando como contexto para tu análisis.",
    subtitle:
      "Información interna de tu negocio que solo tú conoces — nos ayuda a comparar lo que percibes contra lo que la evidencia muestra",
    before: "Antes",
    during: "Durante",
    after: "Después",
    quantification: "Cuantificación",
    amount: "Monto",
    calculation: "Cálculo",
  },
  miCuenta: {
    title: "Mi Cuenta",
    paymentReceived:
      "Pago recibido — tu plan se actualizará en unos segundos. Si no ves el cambio de inmediato, refresca la página.",
    paymentCancelled: "El pago se canceló — no se hizo ningún cargo. Puedes intentarlo de nuevo cuando quieras.",
    email: "Correo",
    business: "Negocio",
    visId: "ID VIS IA",
    currentPlan: "Plan actual",
    pastDueWarning:
      "Tu último pago no se pudo procesar. Verifica tu método de pago para evitar que se suspenda tu plan.",
    planWillCancel: (date) => `Tu plan se cancelará${date ? ` el ${date}` : ""} y volverás a Diagnostic.`,
    undoCancellation: "Deshacer cancelación",
    planWillChange: (plan, date) => `Cambiarás a ${plan}${date ? ` el ${date}` : ""}, cuando termine tu período actual.`,
    termsOfService: "Términos de Servicio",
    privacyPolicy: "Política de Privacidad",
    upgradePlan: "Subir de plan",
    securePaymentNote: "El pago se procesa de forma segura a través de Stripe.",
    upgradeTo: (plan) => `Actualizar a ${plan}`,
    changePlan: "Cambiar de plan",
    changePlanNote:
      "Subir de plan se aplica de inmediato (con prorrateo). Bajar de plan se programa para cuando termine tu período actual — nunca pierdes lo que ya pagaste.",
    changeTo: (plan) => `Cambiar a ${plan}`,
    noLongerWantPlan: "¿Ya no quieres continuar con tu plan?",
    cancelMyPlan: "Cancelar mi plan",
  },
  cancelarPlan: {
    title: "Cancelar mi plan",
    noActiveSubscription: (plan) => `No tienes una suscripción activa que cancelar. Tu plan actual es ${plan}.`,
    backToAccount: "Volver a Mi Cuenta",
  },
  planDetail: {
    currentPlanBadge: "Tu plan actual",
    alreadyIncludedBadge: (plan) => `Ya incluido en tu plan ${plan}`,
    whatsIncluded: "Qué incluye",
    open: "Abrir",
    upgradeToPlan: (plan) => `Sube al plan ${plan} para tener acceso a todo esto.`,
    upgradeButton: (plan) => `Subir a ${plan}`,
    content: {
      diagnostic: {
        title: "Plan Diagnostic",
        tagline: "La base de tu panel VIS IA: un diagnóstico completo de tu negocio.",
        items: [
          { label: "15 Preguntas internas de diagnóstico", href: "/panel/preguntas" },
          { label: "VIS Score — tu puntaje general", href: "/panel/vis-score" },
          { label: "Pérdida Invisible — lo que te está costando no resolver", href: "/panel/perdidas" },
          { label: "Valor Oculto — oportunidades detectadas", href: "/panel/oportunidades" },
          { label: "Reputación — reseñas y presencia online", href: "/panel/reputacion" },
          { label: "Experiencia del Cliente", href: "/panel/experiencia" },
          { label: "Competencia — cómo te comparas en tu zona", href: "/panel/competencia" },
          { label: "Evidencia Visual", href: "/panel/evidencia" },
          { label: "Plan de Acción con prioridades", href: "/panel/plan-accion" },
          { label: "Reportes descargables", href: "/panel/reportes" },
        ],
      },
      pro: {
        title: "Plan Pro",
        tagline: "Todo lo de Diagnostic, más el seguimiento de tu propio progreso mes a mes.",
        items: [
          { label: "Todo lo incluido en el plan Diagnostic" },
          { label: "Comparación Completa — tu negocio antes vs. ahora, reporte a reporte", href: "/panel/comparacion" },
          { label: "Presencia Web — análisis de tu propia página web", href: "/panel/presencia-web" },
          { label: "Redes Sociales — qué tan presente y activo estás en Instagram y Facebook", href: "/panel/redes-sociales" },
          { label: "Noticias y Menciones — qué se dice de ti fuera de tus propios canales", href: "/panel/noticias" },
          { label: "Evolución del Sitio Web — antes vs. ahora y tráfico de visitantes", href: "/panel/evolucion-web" },
          { label: "Evolución del VIS Score en el tiempo (gráfico histórico)", href: "/panel/vis-score" },
          { label: "1 mes gratis del Asistente VIS (IA) al activarlo por primera vez" },
          { label: "Análisis mensual garantizado — tu negocio se re-analiza todos los meses" },
        ],
      },
      intelligence: {
        title: "Plan Intelligence",
        tagline: "El plan más completo: inteligencia artificial y análisis de tendencias sin límite de tiempo.",
        items: [
          { label: "Todo lo incluido en los planes Diagnostic y Pro" },
          { label: "Asistente VIS (IA) con acceso permanente — pregúntale lo que quieras sobre tu negocio", href: "/panel/asistente" },
          { label: "Análisis de Tendencias — evolución de tu negocio en el tiempo", href: "/panel/tendencias" },
          { label: "Frecuencia de análisis más alta que Pro" },
        ],
        note: "Seguimos ampliando las funciones avanzadas de Intelligence — lo que ves arriba ya está disponible hoy en tu panel.",
      },
    },
  },
};

const en: Dictionary = {
  nav: {
    home: "Home",
    account: "My Account",
    groupLabels: {
      diagnostic: "Diagnostic",
      pro: "Pro",
      intelligence: "Intelligence",
    },
    yourPlan: "Your plan",
    seeEverythingIncluded: "See everything included",
    items: {
      "/panel/preguntas": "15 Questions",
      "/panel/vis-score": "VIS Score",
      "/panel/perdidas": "Invisible Loss",
      "/panel/oportunidades": "Hidden Value",
      "/panel/reputacion": "Reputation",
      "/panel/experiencia": "Customer Experience",
      "/panel/competencia": "Competition",
      "/panel/evidencia": "Visual Evidence",
      "/panel/plan-accion": "Action Plan",
      "/panel/reportes": "Reports",
      "/panel/comparacion": "Full Comparison",
      "/panel/presencia-web": "Web Presence",
      "/panel/redes-sociales": "Social Media",
      "/panel/noticias": "News & Mentions",
      "/panel/evolucion-web": "Website Evolution",
      "/panel/asistente": "AI Assistant",
      "/panel/tendencias": "Trend Analysis",
    },
    needHelp: "Need help?",
    writeUsOnWhatsapp: "Message us on WhatsApp",
    support: "VIS IA Support",
  },
  home: {
    welcomeTitle: "Welcome to VIS IA",
    noReportTitle: "No analysis has been published yet",
    noReportBody:
      "Your account is active. VIS IA is preparing your first report — in the meantime, help us by answering the 15 questions about your business; that information is part of the analysis.",
    answerQuestions: "Answer the 15 questions",
    alreadyAnsweredThanks:
      "You already answered the 15 questions — thank you. We'll let you know as soon as your first report is ready.",
    missingQuestionsBanner:
      "We're still missing your answers to the 15 questions about your business — take a few minutes to complete them",
    lastAnalysis: "Last analysis",
    downloadReport: (pdf) => `Download report${pdf ? " (PDF)" : ""}`,
    greeting: (name) => `Hi, ${name}`,
    visScorePendingBadge: "PENDING",
    visScorePendingOnboardingDone:
      "We already received your answers to the 15 questions — VIS IA is finishing the calculation of your VIS Score with that information.",
    visScorePendingOnboardingMissing:
      "The VIS Score is calculated once the 15 questions are completed — the external analysis is ready, we're still missing your internal information.",
    visIaDetected: "VIS IA detected:",
    invisibleLosses: (n) => `${n} INVISIBLE LOSSES`,
    invisibleLossesSubtitle: "They're affecting your results",
    areasNeedingAttention: (n) => `${n} AREAS NEEDING ATTENTION`,
    areasNeedingAttentionSubtitle: "Could turn into problems",
    hiddenValueOpportunities: (n) => `${n} HIDDEN VALUE OPPORTUNITIES`,
    hiddenValueOpportunitiesSubtitle: "You can use these to grow more",
    recommendedActionNumber1: "RECOMMENDED ACTION #1",
    seeDetailAndPlan: "See detail and plan",
    whatChangedTitle: "What changed since your last analysis?",
    seeFullComparison: "See full comparison",
    fullComparisonProOnly: "Full comparison — available on PRO",
    mainInvisibleLosses: "MAIN INVISIBLE LOSSES",
    impacto: "Impact",
    seeAllLosses: "See all losses",
    hiddenValueOpportunitiesTitle: "HIDDEN VALUE OPPORTUNITIES",
    potencial: "Potential",
    seeAllOpportunities: "See all opportunities",
    nextPriorityActions: "NEXT PRIORITY ACTIONS",
    seeFullActionPlan: "See full action plan",
    watchingBusiness: "VIS IA is watching your business 24/7",
    watchingBusinessBody:
      "We analyze, detect and show you what really matters so you can make better decisions.",
    nextAutomaticAnalysis: "Next automatic analysis",
    seeAllReports: "See all reports",
  },
  shareButton: {
    shareThisFinding: "Share this finding",
    copied: "Copied",
    share: "Share",
  },
  common: {
    noAnalysisAvailable: "There's no analysis available for your business yet.",
    impacto: "Impact",
    potencial: "Potential",
    certeza: "Certainty",
    evidencia: "Evidence",
    causaProbable: "Likely cause",
    problema: "Problem",
    notCalculable: "Not calculable with the information available",
    firstReport: "First report",
    before: "Before",
  },
  upgradeNotice: {
    availableFrom: (feature, plan) => `${feature} is available starting with the ${plan} plan`,
    writeUsOnWhatsapp: "Message us on WhatsApp if you'd like to upgrade your plan.",
  },
  lockedPreview: {
    availableFrom: (feature, plan) => `${feature} is available starting with the ${plan} plan`,
    sampleDataNotice:
      "What you see behind this is a sample with example data — this is what it would look like with your real business.",
    upgradeTo: (plan) => `Upgrade to ${plan}`,
  },
  visScore: {
    title: "VIS Score",
    lastAnalysis: (date) => `Last analysis: ${date}`,
    noAnalysis: "There's no analysis available for your business yet.",
    pendingBadge: "PENDING",
    pendingOnboardingDone:
      "We already received your answers to the 15 questions — VIS IA is finishing the calculation of your VIS Score with that information.",
    pendingOnboardingMissing:
      "The external analysis of your business is ready, but the VIS Score hasn't been calculated yet — you still need to complete the 15 internal questions. VIS IA won't assign a score without that information, so it's never based on incomplete data.",
    previousScore: (n) => `Previous score: ${n}/100`,
    whyThisScore: "Why this Score?",
    reputation: "Reputation",
    ratingOnGoogle: (rating, count) => `${rating}/5 on Google (${count} reviews)`,
    customerExperience: "Customer Experience",
    signalsAnalyzed: (n) => `${n} signal${n > 1 ? "s" : ""} analyzed`,
    digitalPresence: "Digital Presence",
    confirmedOnPlatforms: (count, names) =>
      `Confirmed profile on ${count} platform${count > 1 ? "s" : ""} (${names})`,
    competitiveness: "Competitiveness",
    competitorsCompared: (n) => `${n} competitor${n > 1 ? "s" : ""} compared`,
    frictionsDetected: "Frictions detected",
    invisibleLossesIdentified: (n) => `${n} invisible loss${n > 1 ? "es" : ""} identified`,
    noFrictionsDetected: "No frictions were detected in the last analysis",
    mainVisSignals: "Main VIS signals",
    frictionLabel: "Friction:",
    frictionResponseManagement: (prevRate, rate) =>
      `review response management has been abandoned — the review response rate dropped from ${prevRate}% to ${rate}%`,
    gapLabel: "Gap:",
    strengthLabel: "Strength:",
    evolutionTitle: "VIS Score evolution",
    evolutionUpgradeFeature: "See your VIS Score's evolution over time",
    evolutionEmpty:
      'The full history of your VIS Score over time will appear here as more reports are published. You can see all your past reports in the "Reports" section.',
  },
  perdidas: {
    title: "Invisible Loss",
    subtitle: "Everything VIS IA detected that's costing you money or customers",
    empty: "No invisible losses were detected in the last analysis. 🎉",
    shareTitle: (businessName) => `INVISIBLE LOSS — ${businessName}`,
  },
  oportunidades: {
    title: "Hidden Value",
    subtitle: "Opportunities VIS IA identified for you to grow more",
    empty: "No new opportunities were detected in the last analysis.",
    shareTitle: (businessName) => `HIDDEN VALUE — ${businessName}`,
    whyThisOpportunity: "Why this opportunity exists:",
    whyThisExists: "Why it exists:",
  },
  planAccion: {
    title: "Action Plan",
    subtitle:
      "The full analysis behind every priority: what we found, why it matters, and how to know if it worked",
    empty: "There are no pending actions right now.",
    shareTitle: (businessName) => `ACTION PLAN — ${businessName}`,
    problema: "Problem",
    evidencia: "Evidence",
    causaProbable: "Likely cause",
    impacto: "Impact",
    howWeWillKnowItWorked: "How we'll know it worked",
    successMetric: "Success metric",
    reviewDate: "Review date",
    priority: "Priority",
    footerNote:
      'When we mark "Certainty: Potential" or "Not calculable" it means a real signal exists, but there isn\'t enough evidence yet to turn it into an exact figure — we never invent a number where there isn\'t one.',
  },
  reputacion: {
    title: "Reputation",
    subtitle: "Google is your main reputation — other platforms are shown as context",
    emptyTitle: "No reputation data has been loaded yet",
    emptyBody: "Once VIS IA publishes the review detail for your business, it'll appear here.",
    whyThisAffectsYou: "Why this affects you so much",
    mainReputationGoogle: "Main reputation — Google",
    averageRating: "Average rating",
    totalReviews: "Total reviews",
    reviewsDistribution: "Reviews distribution",
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
    unrespondedNegative: (n) => `${n} unanswered negative reviews`,
    checkActionPlan: "Check the Action Plan to prioritize this",
    responseManagement: "Response Management",
    frictionResponseManagement: (prevRate, rate) =>
      `the response rate dropped from ${prevRate}% to ${rate}% compared to the previous report. This usually points to an operational change (fewer staff, change of ownership, or neglect) worth looking into before it affects your reputation further.`,
    responded: "Responded",
    unresponded: "Unanswered",
    responseRate: "Response rate",
    averageTime: "Average time",
    days: "days",
    otherReputations: "Other reputations",
    reputationGapSignal: (gap) =>
      `your business isn't perceived the same way across platforms (a ${gap}-point difference out of 5). It's worth investigating what's causing this gap.`,
    reviewsCount: (n) => `${n} reviews`,
  },
  experiencia: {
    title: "Customer Experience",
    subtitle:
      "Based on verifiable public sources — analyzed reviews and platform scores, never mixed together",
    emptyTitle: "No customer experience data has been loaded yet",
    emptyBody: "Once VIS IA publishes this detail, it'll appear here.",
    reviewsAnalyzedLabel: "Reviews analyzed",
    platformScoreLabel: "Platform score",
    reviewsAnalyzedCount: (n) => `${n} reviews analyzed`,
    detectedPattern: "Detected pattern:",
    analyzed: (date) => `Analyzed: ${date}`,
    footerNote:
      "Each signal keeps its origin: analyzed reviews and scores published by platforms (Booking, Expedia, etc.) are different types of evidence and are never presented as if they were the same.",
  },
  competencia: {
    title: "Competition",
    subtitle: "How you compare to similar businesses in your area",
    emptyTitle: "No competitor comparison has been loaded yet",
    emptyBody: "Once VIS IA publishes this detail, it'll appear here.",
    you: "You",
    reviewsCount: (n) => `${n} reviews`,
  },
  evidencia: {
    title: "Visual Evidence",
    subtitle:
      "Reference and analysis, with a direct link to the original public source — VIS IA never downloads or stores the content",
    emptyTitle: "No evidence has been loaded yet",
    emptyBody:
      "Once VIS IA identifies relevant reviews, photos or videos in public sources, they'll appear here — with a direct link to the original source, without copying the file.",
    visEvidence: "VIS Evidence",
    historicalEvidence: "Historical evidence",
    recentEvidence: "Recent evidence",
    persistentPublicExposure: "Persistent public exposure",
    ownerResponse: "Owner response",
    resolutionDemonstrated: "Resolution demonstrated",
    yes: "Yes",
    no: "No",
    notEvident: "Not evident",
    unknown: "Unknown",
    issuesDetected: "Issues Detected",
    visAnalysis: "VIS Analysis",
    requiresHumanReview: "Requires human review before being treated as conclusive.",
    respondToReview: "Respond to this review",
    visualEvidence: "Visual Evidence",
    seeOriginalEvidence: "See original evidence",
    seeOriginalReview: "See original review",
    otherVisualEvidence: "Other visual evidence",
    impactLabel: "Impact:",
    video: "Video",
    photo: "Photo",
    source: "Source:",
    category: "Category:",
    verified: "Verified",
    unverified: "Unverified",
    requiresHumanReviewLong:
      "The definitive interpretation of this evidence requires human review before being treated as conclusive.",
    impactLevels: { BAJO: "LOW", MEDIO: "MEDIUM", ALTO: "HIGH", CRÍTICO: "CRITICAL" },
  },
  reportes: {
    title: "Reports",
    subtitle: "All analyses published for your business",
    empty: "No reports have been published yet.",
    analysisFrom: (date) => `Analysis from ${date}`,
    pending: "Pending",
  },
  comparacion: {
    title: "Full Comparison",
    subtitle: "Your business before and after, report by report",
    subtitleWithDate: (date) => `Your business: before vs. now — compared to the analysis prior to ${date}`,
    noAnalysis: "There's no analysis available for your business yet.",
    overallScore: "Overall score",
    activityMetrics: "Activity metrics",
    reputation: "Reputation",
    averageRating: "Average rating",
    totalReviews: "Total reviews",
    webTrafficGoogle: "Google profile traffic",
    customerExperience: "Customer Experience",
    comparisonComingSoon:
      "Detailed comparison coming soon — for now the current state of each signal is shown.",
    positiveNegative: (pos, neg) => `${pos} positive / ${neg} negative`,
  },
  presenciaWeb: {
    title: "Web Presence",
    subtitle: "How well your own website is working for you — separate from your reviews and social media",
    emptyTitle: "No analysis of your website has been loaded yet",
    emptyBody: "Once VIS IA publishes this detail, it'll appear here.",
    hasWebsite: "Has a website?",
    mobileFriendly: "Mobile friendly",
    consistentContactInfo: "Consistent contact info",
    onlineBooking: "Online booking",
    notEvaluated: "Not evaluated",
    yes: "Yes",
    no: "No",
    lastContentUpdate: "Estimated last content update",
    overallAssessment: "Overall assessment",
    specificFindings: "Specific findings",
    evidencia: "Evidence:",
    sampleFindings: [
      {
        titulo: "The posted hours don't match Google",
        descripcion:
          "The website says they close at 6pm, but the Google Business Profile says 8pm — this inconsistency creates distrust and lost calls.",
        impacto: "High",
        categoria: "Contact information",
      },
      {
        titulo: "No direct booking button",
        descripcion:
          "Visitors have to call by phone to book — there's no way to book online from the website itself.",
        impacto: "Medium",
        categoria: "Online booking",
      },
    ],
  },
  redesSociales: {
    title: "Social Media",
    subtitle: "How present and active your business is on Instagram and Facebook — separate from your reviews",
    emptyTitle: "No analysis of your social media has been loaded yet",
    emptyBody: "Once VIS IA publishes this detail, it'll appear here.",
    followers: "Followers",
    frequency: "Frequency",
    lastPost: "Last post",
    respondsToComments: "Responds to comments",
    yes: "Yes",
    no: "No",
    overallAssessment: "Overall assessment",
    noProfileFound: "No Instagram or Facebook account managed specifically by this business was found.",
    specificFindings: "Specific findings",
    evidencia: "Evidence:",
    whatToDo: "What to do:",
    whyLabel: "Why:",
    sampleProfile: {
      platform: "Instagram",
      handle: "@sample_business",
      lastPostLabel: "6 weeks ago",
      postingFrequencyLabel: "~1 post per month",
    },
    sampleFindings: [
      {
        titulo: "No own presence on social media",
        descripcion:
          "No Instagram or Facebook account managed specifically by this business was found — only the generic brand/franchise account shows up.",
        impacto: "High",
        categoria: "Presence",
        accionRecomendada: "Create a dedicated account and post real content from the business every week.",
        porQue: "Customers decide based on recent photos, not the brand's generic ones.",
      },
    ],
  },
  noticias: {
    title: "News & Mentions",
    subtitle: "What's being said about your business outside your own channels — media, blogs and directories",
    emptyTitle: "No analysis of news and mentions has been loaded yet",
    emptyBody: "Once VIS IA publishes this detail, it'll appear here.",
    overallAssessment: "Overall assessment",
    noMentionsFound:
      "No mentions of this business were found in media, blogs or directories outside the standard booking/review pages.",
    seeSource: "See source",
    sampleMention: {
      titulo: "Local business featured in chamber of commerce directory",
      fuente: "Local Chamber of Commerce",
      fechaLabel: "4 months ago",
      resumen: "Brief mention in a local list of recommended businesses.",
    },
  },
  evolucionWeb: {
    title: "Website Evolution",
    subtitle: "How your site has changed over time and how well it's converting visitors into customers",
    emptyTitle: "No website evolution analysis has been loaded yet",
    emptyBody: "Once VIS IA publishes this detail, it'll appear here.",
    historicalEvolution: "Historical evolution (Wayback Machine)",
    trafficAndBehavior: "Traffic and visitor behavior",
    source: "Source:",
    whatToDo: "What to do:",
    whyLabel: "Why:",
    trendLabels: {
      Mejorando: "Improving",
      Empeorando: "Worsening",
      Estable: "Stable",
      "Sin datos suficientes": "Not enough data",
    },
    sample: {
      resumenEvolucion:
        "Comparing Wayback Machine snapshots from 2 years ago against today, the site updated its design and added online booking, but the services content is still nearly identical.",
      traficoEstimadoLabel: "~2,400 visits/month",
      traficoFuente: "SimilarWeb.com (free)",
      comportamientoVisitantes:
        "Average duration of 1:45 min and 2.1 pages per visit — a sign of moderate interest, not just an immediate bounce.",
      accionRecomendada: "Add testimonials and clear pricing on the homepage.",
      porQue: "Visitors are staying but don't always find the information they need to decide right away.",
    },
  },
  asistente: {
    title: "AI Assistant",
    noAnalysis: "There's no analysis available for your business yet.",
    subtitleFor: (businessName) => `${businessName}'s assistant`,
    trialEndedBody:
      "Your free trial month of VIS has ended. VIS is a feature of the Intelligence plan — upgrade your plan to keep permanent access to your assistant.",
    askAbout: (businessName) => `Ask about ${businessName}'s business`,
    trialNoticeWithDate: (date) =>
      `VIS is a feature of the Intelligence plan — you have free access until ${date}.`,
    trialNoticeNoDate:
      "VIS is a feature of the Intelligence plan — your business gets free access for one month, starting from your first message.",
  },
  tendencias: {
    title: "Trend Analysis",
    subtitle: "Exclusive to your Intelligence plan — built only from real, already-published reports",
    upgradeFeature:
      "Trend Analysis (the evolution of your reputation and pattern detection across your reports)",
    noHistory:
      "There's no report published for your business yet. Trends will appear here starting with your first report.",
    visScoreEvolution: "VIS Score evolution",
    visScoreReading: "VIS Score reading",
    averageRatingEvolution: "Average rating evolution",
    ratingReading: "Rating reading",
    reviewsCountEvolution: "Review count evolution",
    reviewsVolumeReading: "Review volume reading",
  },
  preguntas: {
    title: "15 Questions",
    emptyConfig: "The questionnaire isn't configured yet. Check back later.",
    alreadyAnsweredSubtitle: "You already answered this questionnaire — thank you",
    alreadyAnsweredBanner:
      "Your answers have already been received and VIS IA is using them as context for your analysis.",
    subtitle:
      "Internal information about your business that only you know — it helps us compare what you perceive against what the evidence shows",
    before: "Before",
    during: "During",
    after: "After",
    quantification: "Quantification",
    amount: "Amount",
    calculation: "Calculation",
  },
  miCuenta: {
    title: "My Account",
    paymentReceived:
      "Payment received — your plan will update in a few seconds. If you don't see the change right away, refresh the page.",
    paymentCancelled: "The payment was cancelled — no charge was made. You can try again anytime.",
    email: "Email",
    business: "Business",
    visId: "VIS IA ID",
    currentPlan: "Current plan",
    pastDueWarning: "Your last payment couldn't be processed. Check your payment method to avoid your plan being suspended.",
    planWillCancel: (date) => `Your plan will be cancelled${date ? ` on ${date}` : ""} and you'll go back to Diagnostic.`,
    undoCancellation: "Undo cancellation",
    planWillChange: (plan, date) => `You'll switch to ${plan}${date ? ` on ${date}` : ""}, once your current period ends.`,
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    upgradePlan: "Upgrade plan",
    securePaymentNote: "Payment is processed securely through Stripe.",
    upgradeTo: (plan) => `Upgrade to ${plan}`,
    changePlan: "Change plan",
    changePlanNote:
      "Upgrading applies immediately (prorated). Downgrading is scheduled for when your current period ends — you never lose what you already paid for.",
    changeTo: (plan) => `Switch to ${plan}`,
    noLongerWantPlan: "No longer want to continue with your plan?",
    cancelMyPlan: "Cancel my plan",
  },
  cancelarPlan: {
    title: "Cancel my plan",
    noActiveSubscription: (plan) => `You don't have an active subscription to cancel. Your current plan is ${plan}.`,
    backToAccount: "Back to My Account",
  },
  planDetail: {
    currentPlanBadge: "Your current plan",
    alreadyIncludedBadge: (plan) => `Already included in your ${plan} plan`,
    whatsIncluded: "What's included",
    open: "Open",
    upgradeToPlan: (plan) => `Upgrade to the ${plan} plan to get access to all of this.`,
    upgradeButton: (plan) => `Upgrade to ${plan}`,
    content: {
      diagnostic: {
        title: "Diagnostic Plan",
        tagline: "The foundation of your VIS IA panel: a complete diagnostic of your business.",
        items: [
          { label: "15 internal diagnostic questions", href: "/panel/preguntas" },
          { label: "VIS Score — your overall score", href: "/panel/vis-score" },
          { label: "Invisible Loss — what not solving this is costing you", href: "/panel/perdidas" },
          { label: "Hidden Value — detected opportunities", href: "/panel/oportunidades" },
          { label: "Reputation — reviews and online presence", href: "/panel/reputacion" },
          { label: "Customer Experience", href: "/panel/experiencia" },
          { label: "Competition — how you compare in your area", href: "/panel/competencia" },
          { label: "Visual Evidence", href: "/panel/evidencia" },
          { label: "Action Plan with priorities", href: "/panel/plan-accion" },
          { label: "Downloadable reports", href: "/panel/reportes" },
        ],
      },
      pro: {
        title: "Pro Plan",
        tagline: "Everything in Diagnostic, plus tracking your own progress month after month.",
        items: [
          { label: "Everything included in the Diagnostic plan" },
          { label: "Full Comparison — your business before vs. now, report by report", href: "/panel/comparacion" },
          { label: "Web Presence — analysis of your own website", href: "/panel/presencia-web" },
          { label: "Social Media — how present and active you are on Instagram and Facebook", href: "/panel/redes-sociales" },
          { label: "News & Mentions — what's being said about you outside your own channels", href: "/panel/noticias" },
          { label: "Website Evolution — before vs. now and visitor traffic", href: "/panel/evolucion-web" },
          { label: "VIS Score evolution over time (historical chart)", href: "/panel/vis-score" },
          { label: "1 free month of the VIS Assistant (AI) when you activate it for the first time" },
          { label: "Guaranteed monthly analysis — your business is re-analyzed every month" },
        ],
      },
      intelligence: {
        title: "Intelligence Plan",
        tagline: "The most complete plan: artificial intelligence and trend analysis with no time limit.",
        items: [
          { label: "Everything included in the Diagnostic and Pro plans" },
          { label: "VIS Assistant (AI) with permanent access — ask it anything about your business", href: "/panel/asistente" },
          { label: "Trend Analysis — the evolution of your business over time", href: "/panel/tendencias" },
          { label: "Higher analysis frequency than Pro" },
        ],
        note: "We're still expanding Intelligence's advanced features — what you see above is already available in your panel today.",
      },
    },
  },
};

const DICTIONARIES: Record<Language, Dictionary> = { es, en };

export function getDictionary(language: Language): Dictionary {
  return DICTIONARIES[language] ?? es;
}
