"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2 } from "lucide-react";
import AdminSignOutButton from "./AdminSignOutButton";

// Los ítems de navegación del admin viven acá, no en NAV_ITEMS del
// panel de clientes — son secciones completamente distintas, con
// distintos permisos, y no deben mezclarse ni por accidente.
const ADMIN_NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Vista General", href: "/admin" },
  { icon: Building2, label: "Clientes", href: "/admin/clientes" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col justify-between min-h-screen">
      <div>
        <div className="px-6 py-6 border-b border-white/10 flex items-center gap-3">
          <div className="bg-white rounded-lg p-1.5">
            <Image
              src="/logo-vis-ia.png"
              alt="VIS IA"
              width={32}
              height={32}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              VIS IA
            </p>
            <p className="text-[11px] text-amber-400 font-medium leading-tight">
              Administrador
            </p>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {ADMIN_NAV_ITEMS.map(({ icon: Icon, label, href }) => {
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

      <div className="p-4">
        <div className="border-t border-white/10 pt-4">
          <AdminSignOutButton />
        </div>
      </div>
    </aside>
  );
}
