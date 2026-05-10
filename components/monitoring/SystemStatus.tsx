import { useMqttStatus } from "@/hooks/useMqttStatus";
import { Wifi, WifiOff } from "lucide-react";

export function SystemStatus() {
  const { connected, broker, isLoading } = useMqttStatus();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        <span className="text-xs text-gray-500">Connexion…</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        connected
          ? "bg-green-100 text-[#006e11]"
          : "bg-red-100 text-[#ba1a1a]"
      }`}
    >
      {connected ? (
        <Wifi size={12} className="text-[#006e11]" />
      ) : (
        <WifiOff size={12} className="text-[#ba1a1a]" />
      )}
      <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#006e11] animate-pulse" : "bg-[#ba1a1a]"}`} />
      {connected ? `Connecté · ${broker}` : "Déconnecté"}
    </div>
  );
}
