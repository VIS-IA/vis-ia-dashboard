import Link from "next/link";
import { Sparkles } from "lucide-react";
import VisIaPanelInicio from "@/components/VisIaPanelInicio";
import type { DashboardData } from "@/lib/types";

export const metadata = {
  title: "Demo — VIS IA Client Intelligence Dashboard",
};

// Datos de ejemplo, claramente ficticios, para que cualquier visitante
// pueda ver el panel sin necesidad de una cuenta. No representan a un
// cliente real.
const DEMO_DATA: DashboardData = {
  business: {
    name: "Bistro El Manantial (Demo)",
    location: "Austin, Texas",
    visId: "VIS-DEMO-000000",
    logoInitial: "B",
  },
  user: { name: "Visitante", role: "Demo" },
  lastAnalysis: "30 de agosto de 2026",
  resumenEjecutivo:
    "Bistro El Manantial mejoró su reputación este mes, pero el hallazgo principal es que las reservas tardan demasiado en confirmarse — esto está generando fricción con clientes potenciales antes de que lleguen a probar el servicio.",
  nextAnalysis: "30 de septiembre de 2026",
  visScore: {
    current: 68,
    previous: 59,
    delta: 9,
    status: "MEJORANDO",
    statusNote: "pero existen 2 riesgos que requieren atención",
  },
  detected: { perdidas: 2, areas: 3, oportunidades: 3 },
  accionRecomendada: {
    titulo: "Estandarizar el tiempo de respuesta a reservas",
    motivo:
      "porque varios clientes potenciales mencionan no haber recibido confirmación a tiempo.",
  },
  metrics: [
    {
      icon_key: "trending-up",
      label: "VIS Score",
      value: "68",
      suffix: "/100",
      stars: null,
      previous: "Anterior: 59/100",
      delta: "+9",
      accent: "blue",
    },
    {
      icon_key: "star",
      label: "Reputación (Google)",
      value: "4.3",
      suffix: null,
      stars: 4.3,
      previous: "Anterior: 4.0",
      delta: "+0.3",
      accent: "green",
    },
    {
      icon_key: "message-square",
      label: "Reseñas Totales",
      value: "312",
      suffix: null,
      stars: null,
      previous: "Anterior: 287",
      delta: "+9%",
      accent: "blue",
    },
    {
      icon_key: "users",
      label: "Tráfico Perfil Google",
      value: "2,140",
      suffix: null,
      stars: null,
      previous: "Anterior: 1,890",
      delta: "+13%",
      accent: "purple",
    },
  ],
  perdidas: [
    {
      icon_key: "clock",
      titulo: "Reservas sin confirmar a tiempo",
      descripcion:
        "Varias reseñas recientes mencionan esperar más de un día por confirmación.",
      impacto: "Alto",
      evidencia: "6 reseñas de los últimos 2 meses mencionan demoras en la confirmación.",
      causaProbable: "Posible falta de un proceso claro de seguimiento a solicitudes.",
      nivelCerteza: "Estimado",
      montoEstimado: 850,
      moneda: "USD",
      supuestos: "6 reservas mencionadas en reseñas, con un ticket promedio estimado de $140 cada una.",
    },
    {
      icon_key: "thumbs-down",
      titulo: "Fricción antes de la reserva",
      descripcion:
        "La calificación pública puede influir en decisiones de clientes potenciales.",
      impacto: "Media",
      evidencia: "No es posible cuantificar cuántas reservas se pierden por esto.",
      causaProbable: "Señal de riesgo, no una pérdida confirmada.",
      nivelCerteza: "Potencial",
      montoEstimado: null,
      moneda: "USD",
      supuestos: null,
    },
  ],
  oportunidades: [
    {
      icon_key: "megaphone",
      titulo: "Clientes satisfechos no dejan reseña",
      descripcion: "Puedes aumentar tu reputación fácilmente pidiéndola en el momento correcto.",
      potencial: "Alto",
      evidencia: null,
      causaProbable: null,
      nivelCerteza: null,
      montoEstimado: null,
      moneda: "USD",
      supuestos: null,
    },
    {
      icon_key: "camera",
      titulo: "Fotos desactualizadas",
      descripcion: "Las fotos del perfil tienen más de un año.",
      potencial: "Medio",
      evidencia: null,
      causaProbable: null,
      nivelCerteza: null,
      montoEstimado: null,
      moneda: "USD",
      supuestos: null,
    },
  ],
  acciones: [
    {
      texto: "Definir un tiempo máximo de respuesta a reservas",
      prioridad: "Alta",
      detalle: "Reduce directamente la causa más mencionada de fricción en las reseñas recientes.",
      problema: "Tiempo de respuesta inconsistente a solicitudes de reserva.",
      evidencia: "6 reseñas recientes mencionan demoras.",
      causaProbable: "Falta de un proceso definido de seguimiento.",
      nivelCerteza: "Confirmado",
      metrica: "Reducir menciones de demora en reseñas nuevas durante 60 días.",
      fechaRevision: "30 de octubre de 2026",
    },
    {
      texto: "Actualizar fotos del perfil de Google",
      prioridad: "Media",
      detalle: null,
      problema: null,
      evidencia: null,
      causaProbable: null,
      nivelCerteza: null,
      metrica: null,
      fechaRevision: null,
    },
  ],
};

export default function DemoPage() {
  return (
    <div>
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 flex-wrap">
        <Sparkles size={15} />
        Estás viendo una demostración con datos de ejemplo — no es un negocio real
        <Link
          href="https://wa.me/16784007344?text=Quiero%20saber%20m%C3%A1s%20sobre%20VIS%20IA"
          target="_blank"
          className="underline font-semibold"
        >
          Quiero esto para mi negocio →
        </Link>
      </div>
      <VisIaPanelInicio data={DEMO_DATA} plan="intelligence" />
    </div>
  );
}
