"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Activity, Shield, BarChart2, Lock, Mail, User, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RegisterSchema, type RegisterInput } from "@/lib/validations/settings.schema";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", role: "nurse", ward: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Une erreur est survenue.");
      } else {
        router.replace("/login?registered=1");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50" style={{ fontFamily: "'Manrope', sans-serif" }}>

      {/* ── Background Image Layer ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/patient.png"
          alt="DermaSense patient monitoring"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/65 via-white/30 to-transparent" />
      </div>

      {/* ── Left panel — desktop only ── */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 z-20 w-[44%] flex-col justify-start pl-14 pr-8 pt-10 pb-16 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
        <div>
          <img
            src="/WhatsApp_Image_2026-05-10_at_10.43.42-removebg-preview.png"
            alt="DermaSense Logo"
            className="h-64 w-auto"
          />
        </div>
        <div className="space-y-3">
          <h1 className="text-[#001f3f] text-[1.75rem] font-black leading-snug tracking-tight uppercase">
            TECHNOLOGIE AU SERVICE DE LA<br />
            <span className="text-[#006e11]">PRÉVENTION DES ESCARRES</span>
          </h1>
          <p className="text-slate-600 text-base leading-relaxed max-w-[420px]">
            Surveillance intelligente, confort optimal et meilleure prise en charge des patients.
          </p>
        </div>
        <div className="flex gap-10">
          {[
            { icon: Shield, label: "PRÉVENIR" },
            { icon: Activity, label: "SURVEILLER" },
            { icon: BarChart2, label: "PROTÉGER" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white/80 border border-[#001f3f]/10 flex items-center justify-center shadow-sm backdrop-blur-sm">
                <Icon size={28} className="text-[#001f3f]" strokeWidth={1.5} />
              </div>
              <span className="text-[#001f3f] text-[10px] font-bold tracking-[0.2em]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center py-8 lg:py-0">

        {/* ── Mobile logo header ── */}
        <div className="flex lg:hidden flex-col items-center w-full px-5 mb-5 animate-in fade-in slide-in-from-top-6 duration-600">
          <div className="w-full max-w-[380px] flex flex-col items-center gap-0.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#006e11]/10 blur-2xl scale-150" />
              <img
                src="/WhatsApp_Image_2026-05-10_at_10.43.42-removebg-preview.png"
                alt="DermaSense Logo"
                className="relative h-44 w-auto drop-shadow-xl"
              />
            </div>
            <div className="flex items-center gap-2 w-full justify-center -mt-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#006e11]/40" />
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#006e11] uppercase">Surveillance des escarres</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#006e11]/40" />
            </div>
            <div className="flex gap-5 w-full justify-center pt-1">
              {[
                { icon: Shield, label: "PRÉVENIR" },
                { icon: Activity, label: "SURVEILLER" },
                { icon: BarChart2, label: "PROTÉGER" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 flex items-center justify-center shadow-md">
                    <Icon size={20} className="text-[#001f3f]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[8px] font-bold tracking-[0.15em] text-[#001f3f]/60">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="w-full px-5 sm:px-0 sm:w-auto">
          <div className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-2xl shadow-black/10 p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-[#001f3f] tracking-tight">Créer un compte</h2>
              <p className="text-slate-400 mt-2">Rejoignez l&apos;équipe DermaSense</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Nom complet</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#001f3f] transition-colors" size={18} />
                  <Input
                    type="text"
                    placeholder="Votre nom et prénom"
                    className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:border-[#001f3f] focus:ring-4 focus:ring-[#001f3f]/5 transition-all"
                    {...register("name")}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 font-medium pl-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#001f3f] transition-colors" size={18} />
                  <Input
                    type="email"
                    placeholder="Entrez votre email"
                    className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:border-[#001f3f] focus:ring-4 focus:ring-[#001f3f]/5 transition-all"
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email.message}</p>}
              </div>

              {/* Role + Ward row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Rôle</Label>
                  <select
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm px-4 text-slate-700 focus:border-[#001f3f] focus:outline-none focus:ring-4 focus:ring-[#001f3f]/5 transition-all"
                    {...register("role")}
                  >
                    <option value="nurse">Infirmier(ère)</option>
                    <option value="doctor">Médecin</option>
                    <option value="admin">Admin</option>
                  </select>
                  {errors.role && <p className="text-xs text-red-500 font-medium pl-1">{errors.role.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Service</Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#001f3f] transition-colors" size={16} />
                    <Input
                      type="text"
                      placeholder="ex: Bloc A"
                      className="pl-10 h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:border-[#001f3f] focus:ring-4 focus:ring-[#001f3f]/5 transition-all"
                      {...register("ward")}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Mot de passe</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#001f3f] transition-colors" size={18} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    className="pl-12 pr-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:border-[#001f3f] focus:ring-4 focus:ring-[#001f3f]/5 transition-all"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 font-medium pl-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Confirmer</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#001f3f] transition-colors" size={18} />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Répétez le mot de passe"
                    className="pl-12 pr-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:border-[#001f3f] focus:ring-4 focus:ring-[#001f3f]/5 transition-all"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 font-medium pl-1">{errors.confirmPassword.message}</p>}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl px-4 py-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#001f3f] hover:bg-[#002d5c] text-white font-bold rounded-2xl text-base shadow-xl shadow-[#001f3f]/20 active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Activity className="animate-spin" size={18} />
                    Création du compte...
                  </span>
                ) : "Créer mon compte"}
              </Button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-slate-400 mt-8">
              Vous avez déjà un compte ?{" "}
              <Link href="/login" className="text-[#001f3f] font-bold hover:underline underline-offset-4">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Decorative Blur Elements */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#001f3f]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-64 h-64 bg-green-600/5 rounded-full blur-[80px] pointer-events-none" />
    </div>
  );
}
