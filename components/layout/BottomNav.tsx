"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, LayoutGrid, Bell, Settings } from "lucide-react";
import { useAlertStore } from "@/store/useAlertStore";

const tabs = [
  { href: "/",           label: "Accueil",    icon: Home },
  { href: "/monitoring", label: "Monitoring", icon: Activity },
  { href: "/pressure",   label: "Pression",   icon: LayoutGrid },
  { href: "/alerts",     label: "Alertes",    icon: Bell },
  { href: "/settings",   label: "Paramètres", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const activeCount = useAlertStore((s) => s.activeCount);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                isActive
                  ? "text-[#003f7b]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? "fill-[#003f7b]/10" : ""}
                />
                {href === "/alerts" && activeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ba1a1a] text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                    {activeCount > 9 ? "9+" : activeCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-[#003f7b]" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
