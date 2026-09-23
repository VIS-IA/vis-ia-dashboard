"use client";

import React from "react";
import Link from "next/link";
import {
  Star,
  Sparkles,
  MessageSquare,
  TrendingUp,
  CheckSquare,
  FileText,
  ArrowUp,
  ChevronRight,
  Shield,
  Download,
  Calendar,
  Users,
} from "lucide-react";
import { ICON_MAP } from "@/lib/icons";
import { jsPDF } from "jspdf";
import PanelSidebarNav from "@/components/PanelSidebarNav";
import ScoreGauge from "@/components/ScoreGauge";
import NotificationsBell from "@/components/NotificationsBell";
import EconomicImpactSummary from "@/components/EconomicImpactSummary";
import { planAtLeast, PLAN_LABELS, type PlanTier } from "@/lib/plan";
import { getVisStatusPresentation } from "@/lib/visStatus";
import type { DashboardData } from "@/lib/types";

/**
 * VisIaPanelInicio
 * -----------------
 * Same approved visual design as the original static demo — only the
 * data source changed. All content now comes from the `data` prop
 * (fetched server-side from Supabase for the signed-in client) instead
 * of a hardcoded DEMO_DATA object. JSX/styling is untouched.
 */

const accentClasses: Record<string, string> = {
  blue: "text-blue-600",
  green: "text-emerald-600",
  purple: "text-purple-600",
};

function PriorityPill({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Alta: "bg-red-50 text-red-600",
    Alto: "bg-red-50 text-red-600",
    Media: "bg-amber-50 text-amber-600",
    Medio: "bg-amber-50 text-amber-600",
    Baja: "bg-emerald-50 text-emerald-600",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
        styles[level] || "bg-slate-100 text-slate-600"
      }`}
    >
      {level}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <span className="inline-flex gap-0.5 ml-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={14}
          className={i < full ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
    </span>
  );
}

export default function VisIaPanelInicio({
  data: d,
  onboardingCompleted = false,
  plan = "diagnostic",
}: {
  data: DashboardData;
  onboardingCompleted?: boolean;
  plan?: PlanTier;
}) {
  const canCompare = planAtLeast(plan, "pro");
  const statusPresentation = getVisStatusPresentation(d.visScore.status);

  function downloadReport() {
    const lines = [
      `VIS IA — Reporte de ${d.business.name}`,
      `${d.business.location}  •  ID: ${d.business.visId}`,
      `Último análisis: ${d.lastAnalysis}`,
      "",
      d.visScore.current !== null
        ? `VIS SCORE: ${d.visScore.current}/100 (${d.visScore.status})`
        : "VIS SCORE: PENDIENTE — falta completar las 15 preguntas internas",
      d.visScore.previous !== null && d.visScore.delta !== null
        ? `Anterior: ${d.visScore.previous}/100  •  Cambio: ${d.visScore.delta > 0 ? "+" : ""}${d.visScore.delta}`
        : "",
      `${d.visScore.statusNote}`,
      "",
      `ACCIÓN RECOMENDADA #1: ${d.accionRecomendada.titulo}`,
      d.accionRecomendada.motivo,
      "",
      "MÉTRICAS:",
      ...d.metrics.map(
        (m) => `- ${m.label}: ${m.value}${m.suffix ?? ""} (${m.previous}, ${m.delta})`
      ),
      "",
      "PÉRDIDAS INVISIBLES:",
      ...d.perdidas.map((p) => `- [${p.impacto}] ${p.titulo}: ${p.descripcion}`),
      "",
      "OPORTUNIDADES DE VALOR OCULTO:",
      ...d.oportunidades.map((o) => `- [${o.potencial}] ${o.titulo}: ${o.descripcion}`),
      "",
      "PLAN DE ACCIÓN:",
      ...d.acciones.flatMap((a, i) => {
        const item = [`${i + 1}. [${a.prioridad}] ${a.texto}`];
        if (a.problema) item.push(`   Problema: ${a.problema}`);
        if (a.evidencia) item.push(`   Evidencia: ${a.evidencia}`);
        if (a.causaProbable) item.push(`   Causa probable: ${a.causaProbable}`);
        if (a.detalle) item.push(`   Impacto: ${a.detalle}`);
        if (a.nivelCerteza) item.push(`   Certeza: ${a.nivelCerteza}`);
        if (a.metrica) item.push(`   Métrica de éxito: ${a.metrica}`);
        return item;
      }),
      "",
      "— Este es un resumen del análisis. Para el detalle completo de cada",
      "  sección (Reputación, Experiencia del Cliente, Competencia), entra",
      "  a tu panel VIS IA en línea.",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VIS-IA-reporte-${d.business.visId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Reporte en PDF con marca VIS IA — beneficio de los planes Pro e
  // Intelligence. El .txt de arriba se queda como está para Diagnostic.
  // Diseño tipo "tarjetas" (igual look & feel que el panel), no un bloque
  // de texto plano — banda de marca, insignia de color para el VIS
  // Score, etiquetas de color por prioridad/impacto, y pie de página con
  // numeración.
  async function downloadReportPdf() {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 40;
    const contentWidth = pageWidth - marginX * 2;
    const footerY = pageHeight - 28;
    let y = 0;
    let page = 1;

    // Paleta — igual a la del panel (Tailwind slate/blue/emerald/amber/red)
    const C = {
      brand: [37, 99, 235] as [number, number, number],
      ink: [15, 23, 42] as [number, number, number],
      body: [51, 65, 85] as [number, number, number],
      muted: [100, 116, 139] as [number, number, number],
      faint: [148, 163, 184] as [number, number, number],
      line: [226, 232, 240] as [number, number, number],
      bgSoft: [248, 250, 252] as [number, number, number],
      white: [255, 255, 255] as [number, number, number],
      emerald: [5, 150, 105] as [number, number, number],
      emeraldBg: [220, 252, 231] as [number, number, number],
      amber: [180, 83, 9] as [number, number, number],
      amberBg: [254, 243, 199] as [number, number, number],
      red: [220, 38, 38] as [number, number, number],
      redBg: [254, 226, 226] as [number, number, number],
      blue: [29, 78, 216] as [number, number, number],
      blueBg: [219, 234, 254] as [number, number, number],
      slateTag: [71, 85, 105] as [number, number, number],
      slateTagBg: [226, 232, 240] as [number, number, number],
    };
    const setColor = (fn: (r: number, g: number, b: number) => void, rgb: [number, number, number]) =>
      fn(rgb[0], rgb[1], rgb[2]);

    function statusColors(status: string): [[number, number, number], [number, number, number]] {
      if (status === "MEJORANDO") return [C.emerald, C.emeraldBg];
      if (status === "DECLINANDO") return [C.red, C.redBg];
      if (status === "REVISAR_TENDENCIA") return [C.amber, C.amberBg];
      if (status === "ESTABLE") return [C.blue, C.blueBg];
      return [C.slateTag, C.slateTagBg];
    }
    function priorityColors(p: string | null | undefined): [[number, number, number], [number, number, number]] {
      const k = (p || "").toLowerCase();
      if (k === "alta" || k === "alto") return [C.red, C.redBg];
      if (k === "media" || k === "medio") return [C.amber, C.amberBg];
      return [C.slateTag, C.slateTagBg];
    }
    function potencialColors(p: string | null | undefined): [[number, number, number], [number, number, number]] {
      const k = (p || "").toLowerCase();
      if (k === "alto") return [C.emerald, C.emeraldBg];
      if (k === "medio") return [C.blue, C.blueBg];
      return [C.slateTag, C.slateTagBg];
    }

    function drawFooter() {
      setColor(doc.setDrawColor.bind(doc), C.line);
      doc.setLineWidth(0.75);
      doc.line(marginX, footerY - 10, pageWidth - marginX, footerY - 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setColor(doc.setTextColor.bind(doc), C.faint);
      doc.text("VIS IA · Reporte generado automáticamente", marginX, footerY);
      doc.text(`Página ${page}`, pageWidth - marginX, footerY, { align: "right" });
    }

    function newPage() {
      drawFooter();
      doc.addPage();
      page += 1;
      y = 40;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      setColor(doc.setTextColor.bind(doc), C.ink);
      doc.text(d.business.name, marginX, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setColor(doc.setTextColor.bind(doc), C.faint);
      doc.text("Reporte VIS IA", pageWidth - marginX, y, { align: "right" });
      y += 10;
      setColor(doc.setDrawColor.bind(doc), C.line);
      doc.setLineWidth(0.75);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 22;
    }

    function ensureSpace(next: number) {
      if (y + next > footerY - 16) newPage();
    }

    function wrapped(text: string, size: number, font: "normal" | "bold" = "normal") {
      doc.setFont("helvetica", font);
      doc.setFontSize(size);
      return doc.splitTextToSize(text, contentWidth - 32) as string[];
    }

    function pill(text: string, x: number, yTop: number, colors: [[number, number, number], [number, number, number]]) {
      const [fg, bg] = colors;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      const w = doc.getTextWidth(text) + 12;
      setColor(doc.setFillColor.bind(doc), bg);
      doc.roundedRect(x, yTop, w, 14, 7, 7, "F");
      setColor(doc.setTextColor.bind(doc), fg);
      doc.text(text, x + w / 2, yTop + 10, { align: "center" });
      return w;
    }

    // ---------- Encabezado (banda de marca, página 1) ----------
    setColor(doc.setFillColor.bind(doc), C.brand);
    doc.rect(0, 0, pageWidth, 108, "F");
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(marginX, 24, 48, 48, 8, 8, "F");
    try {
      const logoRes = await fetch("/logo-vis-ia.png");
      const logoBlob = await logoRes.blob();
      const logoDataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(logoBlob);
      });
      doc.addImage(logoDataUrl, "PNG", marginX + 6, 30, 36, 36);
    } catch {
      // Si el logo no carga, el PDF se genera igual sin él.
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    setColor(doc.setTextColor.bind(doc), C.white);
    doc.text(d.business.name, marginX + 62, 44);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(219, 234, 254);
    doc.text(`${d.business.location}  ·  ID: ${d.business.visId}`, marginX + 62, 60);
    doc.text(`Último análisis: ${d.lastAnalysis}`, marginX + 62, 74);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("REPORTE VIS IA", pageWidth - marginX, 40, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(191, 219, 254);
    doc.text(`Plan ${PLAN_LABELS[plan]}`, pageWidth - marginX, 52, { align: "right" });
    y = 132;

    function sectionLabel(text: string) {
      ensureSpace(24);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      setColor(doc.setTextColor.bind(doc), C.ink);
      doc.text(text.toUpperCase(), marginX, y);
      y += 6;
      setColor(doc.setDrawColor.bind(doc), C.brand);
      doc.setLineWidth(2);
      doc.line(marginX, y, marginX + 28, y);
      y += 16;
    }

    // ---------- VIS Score ----------
    {
      if (d.visScore.current !== null) {
        const [fg, bg] = statusColors(d.visScore.status);
        const noteLines = wrapped(d.visScore.statusNote, 9);
        const cardH = 64 + noteLines.length * 12;
        ensureSpace(cardH + 14);
        setColor(doc.setFillColor.bind(doc), C.bgSoft);
        doc.roundedRect(marginX, y, contentWidth, cardH, 8, 8, "F");
        setColor(doc.setFillColor.bind(doc), fg);
        doc.roundedRect(marginX, y, 5, cardH, 2.5, 2.5, "F");

        const badgeX = marginX + 24;
        const badgeY = y + 14;
        const badgeSize = 56;
        setColor(doc.setFillColor.bind(doc), fg);
        doc.circle(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        setColor(doc.setTextColor.bind(doc), C.white);
        doc.text(String(d.visScore.current), badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 1, {
          align: "center",
          baseline: "middle",
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text("/ 100", badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 14, {
          align: "center",
          baseline: "middle",
        });

        const txtX = badgeX + badgeSize + 20;
        let ty = y + 20;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        setColor(doc.setTextColor.bind(doc), C.muted);
        doc.text("VIS SCORE", txtX, ty);
        ty += 16;
        pill(d.visScore.status.replace(/_/g, " "), txtX, ty - 10, [fg, bg]);
        if (d.visScore.previous !== null && d.visScore.delta !== null) {
          const upDelta = d.visScore.delta > 0;
          const triX = txtX + 78;
          const triY = ty - 7;
          setColor(doc.setFillColor.bind(doc), upDelta ? C.emerald : C.red);
          if (upDelta) doc.triangle(triX, triY + 6, triX + 5, triY, triX + 10, triY + 6, "F");
          else doc.triangle(triX, triY, triX + 5, triY + 6, triX + 10, triY, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          setColor(doc.setTextColor.bind(doc), upDelta ? C.emerald : C.red);
          doc.text(
            `${upDelta ? "+" : ""}${d.visScore.delta} vs. anterior (${d.visScore.previous}/100)`,
            triX + 15,
            ty
          );
        }
        ty += 16;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setColor(doc.setTextColor.bind(doc), C.body);
        noteLines.forEach((line) => {
          doc.text(line, txtX, ty);
          ty += 12;
        });

        y += cardH + 22;
      } else {
        ensureSpace(50);
        setColor(doc.setFillColor.bind(doc), C.bgSoft);
        doc.roundedRect(marginX, y, contentWidth, 40, 8, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        setColor(doc.setTextColor.bind(doc), C.muted);
        doc.text("VIS Score pendiente — falta completar las 15 preguntas internas.", marginX + 16, y + 24);
        y += 40 + 22;
      }
    }

    // ---------- Acción recomendada ----------
    if (d.accionRecomendada.titulo) {
      const motivoLines = wrapped(d.accionRecomendada.motivo, 9.5);
      const tituloLines = wrapped(d.accionRecomendada.titulo, 11, "bold");
      const cardH = 28 + tituloLines.length * 14 + motivoLines.length * 12 + 10;
      ensureSpace(cardH + 14);
      setColor(doc.setFillColor.bind(doc), C.amberBg);
      doc.roundedRect(marginX, y, contentWidth, cardH, 8, 8, "F");
      setColor(doc.setFillColor.bind(doc), C.amber);
      doc.roundedRect(marginX, y, 5, cardH, 2.5, 2.5, "F");
      let ty = y + 20;
      setColor(doc.setFillColor.bind(doc), C.amber);
      doc.circle(marginX + 24, ty - 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setColor(doc.setTextColor.bind(doc), C.amber);
      doc.text("ACCIÓN PRIORITARIA #1", marginX + 32, ty);
      ty += 16;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      setColor(doc.setTextColor.bind(doc), C.ink);
      tituloLines.forEach((line) => {
        doc.text(line, marginX + 20, ty);
        ty += 14;
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      setColor(doc.setTextColor.bind(doc), C.body);
      motivoLines.forEach((line) => {
        doc.text(line, marginX + 20, ty);
        ty += 12;
      });
      y += cardH + 26;
    }

    // ---------- Métricas (2 columnas, filas dinámicas) ----------
    if (d.metrics.length > 0) {
      sectionLabel("Métricas");
      const colW = (contentWidth - 12) / 2;
      const cardH = 54;
      for (let i = 0; i < d.metrics.length; i += 2) {
        ensureSpace(cardH + 12);
        const rowMetrics = d.metrics.slice(i, i + 2);
        rowMetrics.forEach((m, idx) => {
          const cx = marginX + idx * (colW + 12);
          setColor(doc.setFillColor.bind(doc), C.bgSoft);
          doc.roundedRect(cx, y, colW, cardH, 8, 8, "F");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          setColor(doc.setTextColor.bind(doc), C.muted);
          doc.text(m.label, cx + 14, y + 18);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          setColor(doc.setTextColor.bind(doc), C.ink);
          doc.text(`${m.value}${m.suffix ?? ""}`, cx + 14, y + 38);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          setColor(doc.setTextColor.bind(doc), C.emerald);
          doc.text(`${m.delta}  (antes: ${m.previous})`, cx + 14, y + 48);
        });
        y += cardH + 12;
      }
      y += 12;
    }

    // ---------- Tarjetas de lista (pérdidas / oportunidades) ----------
    function listCard(
      title: string,
      items: { titulo: string; descripcion: string; tag: string }[],
      accent: [number, number, number],
      tagColors: (tag: string) => [[number, number, number], [number, number, number]]
    ) {
      if (items.length === 0) return;
      sectionLabel(title);
      items.forEach((item) => {
        const colors = tagColors(item.tag);
        const tituloLines = wrapped(item.titulo, 9.5, "bold");
        const descLines = wrapped(item.descripcion, 9);
        const cardH = 30 + tituloLines.length * 12 + descLines.length * 11.5;
        ensureSpace(cardH + 12);
        setColor(doc.setFillColor.bind(doc), C.white);
        setColor(doc.setDrawColor.bind(doc), C.line);
        doc.setLineWidth(0.75);
        doc.roundedRect(marginX, y, contentWidth, cardH, 8, 8, "FD");
        setColor(doc.setFillColor.bind(doc), accent);
        doc.roundedRect(marginX, y, 4, cardH, 2, 2, "F");

        let ty = y + 16;
        const pw = pill(item.tag, marginX + 18, ty - 10, colors);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        setColor(doc.setTextColor.bind(doc), C.ink);
        doc.text(tituloLines[0], marginX + 18 + pw + 8, ty);
        ty += 14;
        for (let i = 1; i < tituloLines.length; i++) {
          doc.text(tituloLines[i], marginX + 18, ty);
          ty += 12;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setColor(doc.setTextColor.bind(doc), C.body);
        descLines.forEach((line) => {
          doc.text(line, marginX + 18, ty);
          ty += 11.5;
        });

        y += cardH + 10;
      });
      y += 12;
    }

    listCard(
      "Pérdidas Invisibles",
      d.perdidas.map((p) => ({ titulo: p.titulo, descripcion: p.descripcion, tag: p.impacto })),
      C.red,
      priorityColors
    );
    listCard(
      "Oportunidades de Valor Oculto",
      d.oportunidades.map((o) => ({ titulo: o.titulo, descripcion: o.descripcion, tag: o.potencial })),
      C.emerald,
      potencialColors
    );

    // ---------- Plan de acción ----------
    if (d.acciones.length > 0) {
      sectionLabel("Plan de Acción");
      d.acciones.forEach((a, i) => {
        const colors = priorityColors(a.prioridad);
        const tituloLines = wrapped(a.texto, 10, "bold");
        const fields: [string, string][] = [
          ["Problema", a.problema],
          ["Evidencia", a.evidencia],
          ["Causa probable", a.causaProbable],
          ["Impacto", a.detalle],
          ["Métrica de éxito", a.metrica],
        ].filter((f): f is [string, string] => Boolean(f[1]));

        let fieldsHeight = 0;
        const fieldLines = fields.map(([label, val]) => {
          const lines = wrapped(`${label}: ${val}`, 8.8);
          fieldsHeight += lines.length * 11.5 + 2;
          return lines;
        });
        const cardH = 34 + tituloLines.length * 13 + fieldsHeight + 8;
        ensureSpace(cardH + 14);

        setColor(doc.setFillColor.bind(doc), C.white);
        setColor(doc.setDrawColor.bind(doc), C.line);
        doc.setLineWidth(0.75);
        doc.roundedRect(marginX, y, contentWidth, cardH, 8, 8, "FD");
        setColor(doc.setFillColor.bind(doc), colors[0]);
        doc.roundedRect(marginX, y, 4, cardH, 2, 2, "F");

        let ty = y + 18;
        setColor(doc.setFillColor.bind(doc), colors[0]);
        doc.circle(marginX + 26, ty - 4, 9, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        setColor(doc.setTextColor.bind(doc), C.white);
        doc.text(String(i + 1), marginX + 26, ty - 3.5, { align: "center", baseline: "middle" });
        const pw = pill(a.prioridad, marginX + 42, ty - 10, colors);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        setColor(doc.setTextColor.bind(doc), C.ink);
        doc.text(tituloLines[0], marginX + 42 + pw + 8, ty);
        ty += 13;
        for (let k = 1; k < tituloLines.length; k++) {
          doc.text(tituloLines[k], marginX + 42, ty);
          ty += 13;
        }
        ty += 4;

        fieldLines.forEach((lines, idx) => {
          const label = fields[idx][0];
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.8);
          setColor(doc.setTextColor.bind(doc), C.muted);
          const labelPrefix = `${label}: `;
          doc.text(labelPrefix, marginX + 18, ty);
          const labelW = doc.getTextWidth(labelPrefix);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.8);
          setColor(doc.setTextColor.bind(doc), C.body);
          const valLines = doc.splitTextToSize(fields[idx][1], contentWidth - 36 - labelW) as string[];
          doc.text(valLines[0], marginX + 18 + labelW, ty);
          ty += 11.5;
          for (let k = 1; k < valLines.length; k++) {
            doc.text(valLines[k], marginX + 18, ty);
            ty += 11.5;
          }
        });

        y += cardH + 12;
      });
    }

    drawFooter();
    doc.save(`VIS-IA-reporte-${d.business.visId}.pdf`);
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col lg:flex-row text-slate-800">
      {/* Sidebar */}
      <PanelSidebarNav plan={plan} />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-4 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 font-semibold text-lg overflow-hidden shrink-0">
              {d.business.logoInitial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900 truncate">
                  {d.business.name}
                </h1>
                <CheckSquare size={16} className="text-emerald-500 shrink-0" />
              </div>
              <p className="text-sm text-slate-500">
                {d.business.location} &nbsp;•&nbsp; ID: {d.business.visId}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-6 flex-wrap">
            <div className="text-left lg:text-right order-3 lg:order-1 w-full lg:w-auto">
              <p className="text-xs text-slate-400">Último análisis</p>
              <p className="text-sm font-medium text-slate-700">{d.lastAnalysis}</p>
            </div>
            <button
              onClick={canCompare ? downloadReportPdf : downloadReport}
              className="order-1 lg:order-2 flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 whitespace-nowrap"
            >
              <Download size={15} />{" "}
              <span className="hidden sm:inline">
                Descargar reporte{canCompare ? " (PDF)" : ""}
              </span>
            </button>
            <div className="order-2 lg:order-3">
              {canCompare && <NotificationsBell />}
            </div>
            <div className="order-4 flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  Hola, {d.user.name}
                </p>
                <p className="text-xs text-slate-400">{d.user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 space-y-6">
          {/* Resumen ejecutivo */}
          {d.resumenEjecutivo && (
            <section className="bg-slate-900 text-white rounded-2xl p-5 lg:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                Resumen ejecutivo
              </p>
              <p className="text-sm lg:text-base leading-relaxed text-slate-100">
                {d.resumenEjecutivo}
              </p>
            </section>
          )}

          {/* Impacto Económico — resumen agregado, clasificado por certeza */}
          <EconomicImpactSummary perdidas={d.perdidas} oportunidades={d.oportunidades} />

          {/* Hero: VIS IA Intelligence */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Score */}
            <div>
              <p className="text-blue-600 font-semibold text-sm mb-3">
                VIS IA INTELLIGENCE
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Tu negocio está actualmente en:
              </p>
              <div className="flex items-center gap-5">
                {d.visScore.current !== null ? (
                  <>
                    <ScoreGauge score={d.visScore.current} />
                    <div>
                      <span
                        className={`${statusPresentation.badgeClass} text-white text-xs font-semibold px-3 py-1 rounded-full inline-block`}
                      >
                        {statusPresentation.label}
                      </span>
                      <p className="text-xs text-slate-500 mt-2">
                        {d.visScore.statusNote}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2">
                      PENDIENTE
                    </span>
                    <p className="text-sm text-amber-900">
                      {onboardingCompleted
                        ? "Ya recibimos tus respuestas a las 15 preguntas — VIS IA está terminando de calcular tu VIS Score con esa información."
                        : "El VIS Score se calcula cuando se completen las 15 preguntas — el análisis externo ya está listo, falta tu información interna."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detected */}
            <div>
              <p className="text-slate-700 font-semibold text-sm mb-4">
                VIS IA detectó:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <ArrowUp className="rotate-180 text-red-500" size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {d.detected.perdidas} PÉRDIDAS INVISIBLES
                    </p>
                    <p className="text-xs text-slate-500">
                      Están afectando tus resultados
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <Sparkles className="text-amber-500" size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {d.detected.areas} ÁREAS QUE REQUIEREN ATENCIÓN
                    </p>
                    <p className="text-xs text-slate-500">
                      Podrían convertirse en problemas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Star className="text-emerald-500" size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {d.detected.oportunidades} OPORTUNIDADES DE VALOR OCULTO
                    </p>
                    <p className="text-xs text-slate-500">
                      Puedes aprovechar para crecer más
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended action */}
            <div className="bg-emerald-50 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <CheckSquare className="text-emerald-600" size={16} />
                  </div>
                  <p className="text-emerald-700 font-semibold text-xs tracking-wide">
                    ACCIÓN RECOMENDADA #1
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {d.accionRecomendada.titulo}
                </p>
                <p className="text-sm text-slate-600">{d.accionRecomendada.motivo}</p>
              </div>
              <Link
                href="/panel/plan-accion"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg py-2.5 flex items-center justify-center gap-1"
              >
                Ver detalle y plan <ChevronRight size={15} />
              </Link>
            </div>
          </section>

          {/* What changed */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-800">
                  ¿Qué cambió desde tu último análisis?
                </h2>
              </div>
              {canCompare ? (
                <Link
                  href="/panel/comparacion"
                  className="text-xs text-blue-600 font-medium flex items-center gap-1"
                >
                  Ver comparación completa <ChevronRight size={13} />
                </Link>
              ) : (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  Comparación completa — disponible en PRO
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {d.metrics.map((m, idx) => {
                const Icon = ICON_MAP[m.icon_key] ?? TrendingUp;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <Icon size={13} className={accentClasses[m.accent]} />
                      {m.label}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">
                        {m.value}
                      </span>
                      {m.suffix && (
                        <span className="text-sm text-slate-400">{m.suffix}</span>
                      )}
                      {m.stars != null && <Stars rating={m.stars} />}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">{m.previous}</span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                        <ArrowUp size={11} /> {m.delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Three columns */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pérdidas invisibles */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-red-600 mb-4">
                PÉRDIDAS INVISIBLES PRINCIPALES
              </h3>
              <div className="space-y-4">
                {d.perdidas.map((p, idx) => {
                  const Icon = ICON_MAP[p.icon_key] ?? Users;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {p.titulo}
                        </p>
                        <p className="text-xs text-slate-500">{p.descripcion}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-slate-400">Impacto</p>
                        <p className="text-xs font-semibold text-red-600">
                          {p.impacto}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/panel/perdidas"
                className="mt-5 text-sm text-red-600 font-medium flex items-center gap-1"
              >
                Ver todas las pérdidas <ChevronRight size={14} />
              </Link>
            </div>

            {/* Oportunidades de valor oculto */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-emerald-600 mb-4">
                OPORTUNIDADES DE VALOR OCULTO
              </h3>
              <div className="space-y-4">
                {d.oportunidades.map((o, idx) => {
                  const Icon = ICON_MAP[o.icon_key] ?? Sparkles;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {o.titulo}
                        </p>
                        <p className="text-xs text-slate-500">{o.descripcion}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-slate-400">Potencial</p>
                        <p
                          className={`text-xs font-semibold ${
                            o.potencial === "Alto"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {o.potencial}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/panel/oportunidades"
                className="mt-5 text-sm text-emerald-600 font-medium flex items-center gap-1"
              >
                Ver todas las oportunidades <ChevronRight size={14} />
              </Link>
            </div>

            {/* Próximas acciones prioritarias */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-blue-600 mb-4">
                PRÓXIMAS ACCIONES PRIORITARIAS
              </h3>
              <div className="space-y-4">
                {d.acciones.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <p className="flex-1 text-sm text-slate-800">{a.texto}</p>
                    <PriorityPill level={a.prioridad} />
                  </div>
                ))}
              </div>
              <Link
                href="/panel/plan-accion"
                className="mt-5 text-sm text-blue-600 font-medium flex items-center gap-1"
              >
                Ver plan de acción completo <ChevronRight size={14} />
              </Link>
            </div>
          </section>

          {/* Footer banner */}
          <section className="bg-blue-50 rounded-2xl border border-blue-100 p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
                <Shield className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  VIS IA está vigilando tu negocio 24/7
                </p>
                <p className="text-xs text-blue-700/80 mt-0.5">
                  Analizamos, detectamos y te mostramos lo que realmente
                  importa para que tomes mejores decisiones.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs text-blue-700/70 flex items-center gap-1 justify-end">
                  <Calendar size={12} /> Próximo análisis automático
                </p>
                <p className="text-sm font-semibold text-blue-900">
                  {d.nextAnalysis}
                </p>
              </div>
              <Link
                href="/panel/reportes"
                className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg px-4 py-2.5"
              >
                <FileText size={15} /> Ver todos los reportes{" "}
                <ChevronRight size={14} />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
