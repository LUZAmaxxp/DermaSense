import { TopAppBar } from "@/components/layout/TopAppBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <TopAppBar />
      {/* Sidebar: visible only on lg+ */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main
        className="min-h-[calc(100vh-80px)] lg:ml-20 transition-[margin] duration-300 ease-in-out px-3 sm:px-5 pb-20 lg:pb-5"
        style={{ marginTop: 80 }}
      >
        {children}
      </main>
      {/* BottomNav: visible only on mobile */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
