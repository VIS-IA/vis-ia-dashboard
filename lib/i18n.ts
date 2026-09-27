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
  },
};

const DICTIONARIES: Record<Language, Dictionary> = { es, en };

export function getDictionary(language: Language): Dictionary {
  return DICTIONARIES[language] ?? es;
}
