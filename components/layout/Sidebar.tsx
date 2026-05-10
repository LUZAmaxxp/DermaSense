"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Activity,
  TrendingUp,
  Bell,
  Settings,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useAlertStore } from "@/store/useAlertStore";

const NAV = [
  { id: "home",       icon: Home,       label: "Accueil",    route: "/" },
  { id: "monitoring", icon: Activity,   label: "Monitoring", route: "/monitoring" },
  { id: "pressure",   icon: TrendingUp, label: "Pression",   route: "/pressure" },
  { id: "alerts",     icon: Bell,       label: "Alertes",    route: "/alerts" },
  { id: "settings",   icon: Settings,   label: "Paramètres", route: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const activeCount = useAlertStore((s) => s.activeCount);

  return (
    <aside
      className="peer fixed left-0 top-20 bottom-0 z-40 flex flex-col bg-white border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,31,63,0.02)] transition-all duration-300 ease-in-out group hover:w-64 w-20 overflow-hidden"
    >
      <div className="flex flex-col flex-1 py-6 px-3 gap-2">
        {NAV.map(({ id, icon: Icon, label, route }) => {
          const isActive =
            route === "/" ? pathname === "/" : pathname.startsWith(route);
          return (
            <Link
              key={id}
              href={route}
              className={`group/item relative flex items-center h-12 rounded-xl transition-all duration-200 px-3 ${
                isActive
                  ? "bg-[#001f3f] text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-50 hover:text-[#001f3f]"
              }`}
            >
              <div className="flex items-center justify-center min-w-[32px] relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {id === "alerts" && activeCount > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 flex items-center justify-center text-[9px] font-black rounded-full w-4 h-4 ring-2 ${
                    isActive ? "bg-white text-[#001f3f] ring-[#001f3f]" : "bg-[#ba1a1a] text-white ring-white"
                  }`}>
                    {activeCount > 9 ? "9" : activeCount}
                  </span>
                )}
              </div>
              
              <span className={`ml-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-opacity duration-300 opacity-0 group-hover:opacity-100`} style={{ fontFamily: "Manrope, sans-serif" }}>
                {label}
              </span>

              {isActive && (
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="min-w-[24px] flex justify-center">
            <ShieldCheck size={18} className="text-emerald-500" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
            <p className="text-[10px] font-black text-[#001f3f] uppercase tracking-tighter leading-none">Sécurisé</p>
            <p className="text-[9px] text-slate-400 font-bold mt-0.5">V4.0.1 Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
