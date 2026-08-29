"use client";

import Link from "next/link";
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
} from "lucide-react";

export const NAV_ITEMS = [
  { icon: Home, label: "Inicio", href: "/panel" },
  { icon: BarChart3, label: "VIS Score", href: "/panel/vis-score" },
  { icon: Star, label: "Pérdida Invisible", href: "/panel/perdidas" },
  { icon: Sparkles, label: "Valor Oculto", href: "/panel/oportunidades" },
  { icon: Star, label: "Reputación", href: "/panel/reputacion" },
  { icon: Users, label: "Experiencia del Cliente", href: "/panel/experiencia" },
  { icon: BarChart3, label: "Competencia", href: "/panel/competencia" },
  { icon: CheckSquare, label: "Plan de Acción", href: "/panel/plan-accion" },
  { icon: FileText, label: "Reportes", href: "/panel/reportes" },
  { icon: UserCircle, label: "Mi Cuenta", href: "/panel/mi-cuenta" },
];

export function PanelSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-[#0b1220] text-slate-300 flex flex-col justify-between">
      <div>
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-baseline gap-1">
            <span className="text-white font-bold text-xl tracking-tight">VIS</span>
            <span className="text-blue-400 font-bold text-xl tracking-tight">IA</span>
          </div>
          <div className="text-[10px] tracking-[0.2em] text-slate-500 mt-0.5">
            INTELLIGENCE
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-sm font-medium text-slate-200">¿Necesitas ayuda?</p>
          <p className="text-xs text-slate-500 mt-1">Escríbenos por WhatsApp</p>
        </div>
        <button className="w-full flex items-center justify-center gap-2 text-sm text-slate-300 border border-white/10 rounded-lg py-2.5 hover:bg-white/5">
          Soporte VIS IA
        </button>
      </div>
    </aside>
  );
}

/**
 * Standard shell for every /panel/* sub-page: sidebar + a simple content
 * header, so pages feel like part of the same app instead of a jump to
 * a different design.
 */
export default function PanelLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex text-slate-800">
      <PanelSidebar />
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
