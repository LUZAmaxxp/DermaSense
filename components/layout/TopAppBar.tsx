"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Settings, HelpCircle, ChevronDown, Menu, X, Home, Activity, TrendingUp, BarChart2, ShieldAlert } from "lucide-react";
import { useAlertStore } from "@/store/useAlertStore";
import { useMqttStatus } from "@/hooks/useMqttStatus";

const NAV = [
  { label: "Accueil",         href: "/" },
  { label: "Monitoring",      href: "/monitoring" },
  { label: "Pression",        href: "/pressure" },
  { label: "Alertes",         href: "/alerts" },
  { label: "Recommandations", href: "/recommendations" },
  { label: "Paramètres",      href: "/settings" },
];

export function TopAppBar() {
  const activeCount = useAlertStore((s) => s.activeCount);
  const { connected } = useMqttStatus();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 px-4 sm:px-8 flex items-center justify-between">
        {/* Left: Branding + burger on mobile */}
        <div className="flex items-center gap-4 sm:gap-12">
          {/* Burger — visible only below lg */}
          <button
            className="lg:hidden p-2 rounded-xl text-[#001f3f] hover:bg-slate-100 transition-all"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center group cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/WhatsApp_Image_2026-05-10_at_10.43.42-removebg-preview.png"
              alt="DermaSense"
              className="h-20 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </div>

          <nav className="hidden xl:flex items-center gap-8">
            {["alerts", "monitoring", "pressure"].map((item) => (
              <Link
                key={item}
                href={`/${item}`}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${pathname.startsWith("/" + item) ? "text-[#001f3f]" : "text-slate-400 hover:text-[#001f3f]"}`}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Patient Context — hidden on mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-1.5 pr-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200">
                <span className="text-blue-700 text-xs font-black">OS</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#001f3f]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Ouiame Salimi
                  </span>
                  <span className="bg-[#001f3f]/5 text-[#001f3f] text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    #7724
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Gériatrie • Unité Alpha</p>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live</span>
              </div>
              <ChevronDown size={14} className="text-slate-300" />
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="hidden sm:flex p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#001f3f] transition-all relative">
              <HelpCircle size={20} />
            </button>
            <button className="hidden sm:flex p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#001f3f] transition-all relative">
              <Settings size={20} />
            </button>
            <Link href="/alerts" className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#001f3f] transition-all relative">
              <Bell size={20} />
              {activeCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black rounded-full min-w-[16px] h-[16px] flex items-center justify-center ring-4 ring-white">
                  {activeCount > 9 ? "9+" : activeCount}
                </span>
              )}
            </Link>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#001f3f]" style={{ fontFamily: "Manrope, sans-serif" }}>Dr. N. Salimi</p>
              <p className="text-[10px] text-slate-400 font-medium">Chef de Service</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#001f3f]/10 transition-all cursor-pointer">
              <span className="text-slate-400 text-xs font-bold uppercase">NS</span>
            </div>
          </div>

          <button className="hidden sm:block bg-[#ba1a1a] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-900/10 active:scale-95 transition-all">
            Emergency
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ───────────────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-[70] w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/WhatsApp_Image_2026-05-10_at_10.43.42-removebg-preview.png"
            alt="DermaSense"
            className="h-14 w-auto object-contain"
          />
          <button
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"
            onClick={() => setMenuOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Patient info */}
        <div className="mx-4 mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200 flex-shrink-0">
            <span className="text-blue-700 text-xs font-black">OS</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#001f3f]">Ouiame Salimi</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">Gériatrie • #7724</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
            <span className="text-[10px] font-bold text-slate-400">Live</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 mt-4 flex-1">
          {NAV.map(({ label, href }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#001f3f] text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#001f3f]"
                }`}
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {label}
                {href === "/alerts" && activeCount > 0 && (
                  <span className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-full ${isActive ? "bg-white text-[#001f3f]" : "bg-[#ba1a1a] text-white"}`}>
                    {activeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Emergency button */}
        <div className="p-4 border-t border-slate-100">
          <button className="w-full bg-[#ba1a1a] hover:bg-red-700 text-white py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-red-900/10 active:scale-95 transition-all">
            Emergency
          </button>
        </div>
      </div>
    </>
  );
}
