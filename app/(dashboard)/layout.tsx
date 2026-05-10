import { TopAppBar } from "@/components/layout/TopAppBar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <TopAppBar />
      <Sidebar />
      <main
        className="min-h-[calc(100vh-80px)] ml-20 peer-hover:ml-64 transition-[margin] duration-300 ease-in-out"
        style={{ marginTop: 80, padding: 20 }}
      >
        {children}
      </main>
    </div>
  );
}
