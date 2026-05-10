"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Activity,
  TrendingUp,
  Bell,
  Settings,
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
      className="fixed left-0 top-14 bottom-0 z-40 flex flex-col items-center py-3 gap-1"
      style={{ width: 64, background: "#ffffff", borderRight: "1px solid #f1f5f9" }}
    >
      {NAV.map(({ id, icon: Icon, label, route }) => {
        const isActive =
          route === "/" ? pathname === "/" : pathname.startsWith(route);
        return (
          <Link
            key={id}
            href={route}
            className={`relative w-full flex flex-col items-center py-3 gap-1 mx-1 rounded-xl transition-colors ${
              isActive
                ? "text-[#003f7b] bg-[#eff6ff]"
                : "text-gray-400 hover:text-[#003f7b] hover:bg-gray-50"
            }`}
          >
            {/* active indicator bar */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#003f7b] rounded-r-full" />
            )}
            <div className="relative">
              <Icon size={20} />
              {id === "alerts" && activeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ba1a1a] text-white text-[8px] font-bold rounded-full w-[13px] h-[13px] flex items-center justify-center">
                  {activeCount > 9 ? "9" : activeCount}
                </span>
              )}
            </div>
            <span className="text-[9px]" style={{ fontFamily: "Inter, sans-serif" }}>
              {label}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}
