"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Star,
  Sparkles,
  Users,
  BarChart3,
  CheckSquare,
  FileText,
  UserCircle,
  ClipboardList,
  Camera,
  Menu,
  X,
  TrendingUp,
  MessageCircle,
  GitCompare,
  Globe,
  Share2,
  ChevronDown,
  Lock,
  ArrowRight,
  Newspaper,
  History,
  type LucideIcon,
} from "lucide-react";
import { planAtLeast, type PlanTier } from "@/lib/plan";
import { getDictionary, type Language } from "@/lib/i18n";

// Número de WhatsApp del negocio, en formato internacional sin signos:
// +1 678 400 7344 -> 16784007344
const WHATSAPP_NUMBER = "16784007344";

interface NavLeaf {
  icon: LucideIcon;
  href: string;
}

interface NavGroup {
  tier: PlanTier;
  items: NavLeaf[];
}

// Cada botón de contenido va agrupado bajo el plan al que pertenece.
// "Diagnostic" siempre está disponible (es la base que todo cliente ya
// tiene). Los grupos "Pro" e "Intelligence" se pueden abrir igual aunque
// el cliente no tenga ese plan — así ve qué incluye cada uno, con
// candado, y puede entrar a "Ver todo lo que incluye" para el detalle
// completo y el botón de actualizar. Las etiquetas (label) viven en el
// diccionario de idioma (lib/i18n.ts), no acá — esto solo define el
// orden, los íconos y a qué href va cada botón.
const NAV_GROUPS: NavGroup[] = [
  {
    tier: "diagnostic",
    items: [
      { icon: ClipboardList, href: "/panel/preguntas" },
      { icon: BarChart3, href: "/panel/vis-score" },
      { icon: Star, href: "/panel/perdidas" },
      { icon: Sparkles, href: "/panel/oportunidades" },
      { icon: Star, href: "/panel/reputacion" },
      { icon: Users, href: "/panel/experiencia" },
      { icon: BarChart3, href: "/panel/competencia" },
      { icon: Camera, href: "/panel/evidencia" },
      { icon: CheckSquare, href: "/panel/plan-accion" },
      { icon: FileText, href: "/panel/reportes" },
    ],
  },
  {
    tier: "pro",
    items: [
      { icon: GitCompare, href: "/panel/comparacion" },
      { icon: Globe, href: "/panel/presencia-web" },
      { icon: Share2, href: "/panel/redes-sociales" },
      { icon: Newspaper, href: "/panel/noticias" },
      { icon: History, href: "/panel/evolucion-web" },
    ],
  },
  {
    tier: "intelligence",
    items: [
      { icon: MessageCircle, href: "/panel/asistente" },
      { icon: TrendingUp, href: "/panel/tendencias" },
    ],
  },
];

/**
 * PanelSidebarNav
 * -------------
 * Desktop: barra lateral fija, siempre visible.
 * Celular: se esconde fuera de pantalla; un botón de hamburguesa en una
 * barra superior la despliega encima del contenido.
 * Recibe el plan del cliente como prop — quien la usa (PanelLayout, o
 * VisIaPanelInicio en la portada) ya lo tiene disponible del lado del
 * servidor y solo lo pasa hacia abajo.
 */
export default function PanelSidebarNav({ plan, language }: { plan: PlanTier; language: Language }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = getDictionary(language);
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    language === "en"
      ? "Hi, I need help with my VIS IA panel"
      : "Hola, necesito ayuda con mi panel VIS IA"
  )}`;

  const activeGroupTier = NAV_GROUPS.find((g) =>
    g.items.some((item) => item.href === pathname)
  )?.tier;

  const [expanded, setExpanded] = useState<Record<PlanTier, boolean>>({
    diagnostic: true,
    pro: activeGroupTier === "pro" || planAtLeast(plan, "pro"),
    intelligence: activeGroupTier === "intelligence" || planAtLeast(plan, "intelligence"),
  });

  function toggleGroup(tier: PlanTier) {
    setExpanded((prev) => ({ ...prev, [tier]: !prev[tier] }));
  }

  const sidebarContent = (
    <>
      <div>
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between lg:justify-center">
          <div className="bg-white rounded-xl p-2">
            <Image
              src="/logo-vis-ia.png"
              alt="VIS IA Federal Consulting"
              width={140}
              height={140}
              className="w-full h-auto max-w-[120px] lg:max-w-none"
              priority
            />
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-slate-400 p-2"
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          <Link
            href="/panel"
            onClick={() => setOpen(false)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === "/panel"
                ? "bg-blue-600 text-white font-medium"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Home size={18} /> {t.nav.home}
          </Link>

          <div className="pt-3 space-y-1">
            {NAV_GROUPS.map((group) => {
              const locked = !planAtLeast(plan, group.tier);
              const isCurrentTier = plan === group.tier;
              const isExpanded = expanded[group.tier];

              return (
                <div key={group.tier}>
                  <button
                    onClick={() => toggleGroup(group.tier)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-300"
                  >
                    <span className="flex items-center gap-2">
                      {t.nav.groupLabels[group.tier]}
                      {isCurrentTier && (
                        <span className="bg-blue-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                          {t.nav.yourPlan}
                        </span>
                      )}
                      {locked && <Lock size={11} className="text-slate-600" />}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="space-y-0.5 mb-1">
                      {group.items.map(({ icon: Icon, href }) => {
                        const active = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={`w-full flex items-center gap-3 pl-6 pr-3 py-2 rounded-lg text-sm transition-colors ${
                              active
                                ? "bg-blue-600 text-white font-medium"
                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                            }`}
                          >
                            <Icon size={16} className="shrink-0" />
                            <span className="truncate">{t.nav.items[href] ?? href}</span>
                            {locked && (
                              <Lock size={11} className="ml-auto shrink-0 text-slate-600" />
                            )}
                          </Link>
                        );
                      })}
                      <Link
                        href={`/panel/planes/${group.tier}`}
                        onClick={() => setOpen(false)}
                        className="w-full flex items-center gap-1.5 pl-6 pr-3 py-2 text-xs text-blue-400 hover:text-blue-300"
                      >
                        {t.nav.seeEverythingIncluded} {t.nav.groupLabels[group.tier]} <ArrowRight size={11} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 mt-2 border-t border-white/10">
            <Link
              href="/panel/mi-cuenta"
              onClick={() => setOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === "/panel/mi-cuenta"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <UserCircle size={18} /> {t.nav.account}
            </Link>
          </div>
        </nav>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-sm font-medium text-slate-200">{t.nav.needHelp}</p>
          <p className="text-xs text-slate-500 mt-1">{t.nav.writeUsOnWhatsapp}</p>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 text-sm text-slate-300 border border-white/10 rounded-lg py-2.5 hover:bg-white/5"
        >
          {t.nav.support}
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Barra superior solo en celular */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#0b1220] text-white flex items-center justify-between px-4 py-3">
        <button onClick={() => setOpen(true)} aria-label="Abrir menú" className="p-1.5 -ml-1.5">
          <Menu size={22} />
        </button>
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-base tracking-tight">VIS</span>
          <span className="text-blue-400 font-bold text-base tracking-tight">IA</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Fondo oscuro al abrir el menú en celular */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar: fijo en desktop, deslizable en celular */}
      <aside
        className={`
          w-72 lg:w-64 shrink-0 bg-[#0b1220] text-slate-300 flex flex-col justify-between
          fixed lg:static inset-y-0 left-0 z-50 overflow-y-auto overscroll-contain
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
