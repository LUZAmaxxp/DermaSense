"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Activity, Shield, BarChart2, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoginSchema, type LoginInput } from "@/lib/validations/settings.schema";

/**
 * DermaSense LoginPage
 * 
 * Recreated with exact visual fidelity to the reference image.
 * Maintains form logic, Next-Auth integration, and Lucide icons.
 */
export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ 
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.replace("/");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50" style={{ fontFamily: "'Manrope', sans-serif" }}>
      
      {/* ── Background Image Layer ───────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/patient.png"
          alt="DermaSense patient monitoring"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/65 via-white/30 to-transparent" />
      </div>

      {/* ── Left panel: absolute, logo + tagline + icons ── hidden on mobile */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 z-20 w-[44%] flex-col justify-start pl-14 pr-8 pt-10 pb-16 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">

          {/* Logo */}
          <div>
            <img
              src="/WhatsApp_Image_2026-05-10_at_10.43.42-removebg-preview.png"
              alt="DermaSense Logo"
              className="h-64 w-auto"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <h1 className="text-[#001f3f] text-[1.75rem] font-black leading-snug tracking-tight uppercase">
              TECHNOLOGIE AU SERVICE DE LA<br />
              <span className="text-[#006e11]">PRÉVENTION DES ESCARRES</span>
            </h1>
            <p className="text-slate-600 text-base leading-relaxed max-w-[420px]">
              Surveillance intelligente, confort optimal et meilleure prise en charge des patients.
            </p>
          </div>

          {/* Three icons */}
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

      {/* ── Main: full-screen centered form ─────────────────────────── */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center py-8 lg:py-0">

        {/* ── Mobile logo header — only shown below lg breakpoint ── */}
        <div className="flex lg:hidden flex-col items-center w-full px-5 mb-5 animate-in fade-in slide-in-from-top-6 duration-600">
          {/* Brand card */}
          <div className="w-full max-w-[380px] bg-white/80 backdrop-blur-xl rounded-[2rem] px-6 pt-6 pb-5 flex flex-col items-center gap-3 shadow-2xl shadow-black/15 border border-white/70">

            {/* Logo with glow halo */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#006e11]/10 blur-2xl scale-150" />
              <img
                src="/WhatsApp_Image_2026-05-10_at_10.43.42-removebg-preview.png"
                alt="DermaSense Logo"
                className="relative h-24 w-auto drop-shadow-lg"
              />
            </div>

            {/* Brand name */}
            <div className="flex items-baseline leading-none">
              <span className="text-[2rem] font-black text-[#001f3f] tracking-tight">DERMA</span>
              <span className="text-[2rem] font-black text-[#006e11] tracking-tight">SENSE</span>
            </div>

            {/* Green accent bar */}
            <div className="flex items-center gap-2 w-full justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#006e11]/40" />
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#006e11] uppercase">Surveillance des escarres</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#006e11]/40" />
            </div>

            {/* Three feature badges */}
            <div className="flex gap-3 w-full justify-center pt-1">
              {[
                { icon: Shield, label: "PRÉVENIR" },
                { icon: Activity, label: "SURVEILLER" },
                { icon: BarChart2, label: "PROTÉGER" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#001f3f]/5 border border-[#001f3f]/8 flex items-center justify-center">
                    <Icon size={18} className="text-[#001f3f]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[8px] font-bold tracking-[0.15em] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full px-5 sm:px-0 sm:w-auto">
          <div className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-2xl shadow-black/10 p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-[#001f3f] tracking-tight">Connexion</h2>
              <p className="text-slate-400 mt-2">Accédez à votre espace Dermasense</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
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

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Mot de passe</Label>
                  <button type="button" className="text-xs font-bold text-[#001f3f] hover:underline underline-offset-4">
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#001f3f] transition-colors" size={18} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
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
                    Connexion...
                  </span>
                ) : "Se connecter"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-medium">ou</span>
              </div>
            </div>

            {/* SSO Action */}
            <button
              type="button"
              className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all"
            >
              <Shield size={18} className="text-[#001f3f]/40" />
              Se connecter via SSO
            </button>

            {/* Footer Registration */}
            <p className="text-center text-sm text-slate-400 mt-8">
              Vous n'avez pas de compte ?{" "}
              <button className="text-[#001f3f] font-bold hover:underline underline-offset-4">
                Contactez votre administrateur
              </button>
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
