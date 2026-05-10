"use client";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bluetooth, Wifi, Activity, Bell, User, ChevronRight, Server } from "lucide-react";
import { useMqttStatus } from "@/hooks/useMqttStatus";
import Link from "next/link";

export default function SettingsPage() {
  const { connected, broker } = useMqttStatus();
  const [threshold, setThreshold] = useState([32]);
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyWarning, setNotifyWarning]   = useState(true);
  const [notifyInfo, setNotifyInfo]         = useState(false);

  const handleThresholdChange = (val: number | readonly number[]) => {
    const arr = Array.isArray(val) ? [...val] as number[] : [val as number];
    setThreshold(arr);
  };

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>

      {/* Col 1 */}
      <div className="space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-[#003f7b]/10 text-[#003f7b] font-bold text-base">NS</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "Manrope, sans-serif" }}>
              Nadia Sekkouri
            </p>
            <p className="text-xs text-gray-500">Infirmiere - Service Geriatrie</p>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>

        {/* Threshold slider */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#003f7b]" />
            <p className="text-sm font-semibold text-gray-800">Seuil d&apos;Alerte</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Pression critique</span>
              <span className="text-2xl font-bold text-[#003f7b]" style={{ fontFamily: "Manrope, sans-serif" }}>
                {threshold[0]} <span className="text-sm font-normal text-gray-400">mmHg</span>
              </span>
            </div>
            <Slider min={20} max={60} step={1} value={threshold} onValueChange={handleThresholdChange} className="w-full" />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>20 mmHg</span>
              <span>60 mmHg</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[#003f7b]" />
            <p className="text-sm font-semibold text-gray-800">Notifications</p>
          </div>
          {[
            { label: "Alertes critiques", sub: "Vibration + son",       value: notifyCritical, set: setNotifyCritical },
            { label: "Avertissements",    sub: "Notification visuelle", value: notifyWarning,  set: setNotifyWarning },
            { label: "Informations",      sub: "Badge uniquement",      value: notifyInfo,     set: setNotifyInfo },
          ].map(({ label, sub, value, set }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-500">{sub}</p>
              </div>
              <Switch checked={value} onCheckedChange={set} />
            </div>
          ))}
        </div>
      </div>

      {/* Col 2 */}
      <div className="space-y-4">
        {/* Connectivity */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-gray-800">Connectivite</p>
          {[
            { icon: Activity, label: "MQTT",      sub: broker || "Non configure", active: connected, color: connected ? "#006e11" : "#ba1a1a" },
            { icon: Wifi,     label: "Wi-Fi",     sub: "Reseau hopital",          active: true,      color: "#006e11" },
            { icon: Bluetooth,label: "Bluetooth", sub: "Capteur DS-7724",         active: true,      color: "#003f7b" },
          ].map(({ icon: Icon, label, sub, active, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "15" }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-[10px] text-gray-500 max-w-[140px] truncate">{sub}</p>
                </div>
              </div>
              <div className={"w-2 h-2 rounded-full " + (active ? "animate-pulse" : "")} style={{ background: active ? color : "#d1d5db" }} />
            </div>
          ))}
        </div>

        {/* MQTT config (read-only) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Server size={16} className="text-[#003f7b]" />
            <p className="text-sm font-semibold text-gray-800">Configuration MQTT</p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Broker",     value: "HiveMQ Cloud - TLS 8883" },
              { label: "Topic",      value: "dermasense/{id}/sensors" },
              { label: "Client",     value: "dermasense-nextjs-server" },
              { label: "Intervalle", value: "5 secondes" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</span>
                <span className="text-xs font-medium text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dossier medical */}
        <Link href="/settings/patient" className="block">
          <div
            className="rounded-2xl p-5 flex items-center gap-3 transition-opacity hover:opacity-90"
            style={{ background: "#003f7b" }}
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Dossier Medical</p>
              <p className="text-xs text-white/60">Ouiame Salimi - Chambre 7724</p>
            </div>
            <ChevronRight size={16} className="text-white/60" />
          </div>
        </Link>
      </div>
    </div>
  );
}
