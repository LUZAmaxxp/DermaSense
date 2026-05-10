import { TopAppBar } from "@/components/layout/TopAppBar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <TopAppBar />
      <Sidebar />
      <main
        className="min-h-[calc(100vh-56px)]"
        style={{ marginTop: 56, marginLeft: 64, padding: 20 }}
      >
        {children}
      </main>
    </div>
  );
}
