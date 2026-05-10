"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Fingerprint, Activity, Shield, Heart, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoginSchema, type LoginInput } from "@/lib/validations/settings.schema";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

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
    <div className="min-h-screen flex bg-[#f8fafc] font-sans selection:bg-primary/10">
      {/* Left panel — immersive clinical visual */}
      <div className="hidden lg:flex relative w-[520px] flex-shrink-0 overflow-hidden">
        <img
          src="/pexels-photo-7659571.jpeg"
          alt="DermaSense clinical monitoring"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#001f3f]/80 via-[#001f3f]/40 to-transparent" />
        
        {/* Branding & Features overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 py-16">
          <div className="flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-white backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-2xl transition-transform group-hover:scale-105">
              <span className="text-white text-xl font-extrabold tracking-tighter" style={{ fontFamily: "Manrope, sans-serif" }}>
                <img
                  src="/WhatsApp_Image_2026-05-10_at_10.43.42-removebg-preview.png"
                  alt="DermaSense"
                  className="h-12 w-auto object-contain"
                />
              </span>
            </div>
            <div>
              <span className="text-white text-3xl font-bold tracking-tight block leading-none" style={{ fontFamily: "Manrope, sans-serif" }}>
                DERMASENSE
              </span>
              <p className="text-blue-200/80 text-[11px] uppercase tracking-[0.2em] mt-1 font-semibold">Surveillance Clinique</p>
            </div>
          </div>

          <div className="space-y-6 max-w-[320px] p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-inner">
            {[
              { icon: Shield,   label: "Temps réel",         sub: "Données live toutes les 5s" },
              { icon: Activity, label: "MQTT IoT",            sub: "ESP32 + HiveMQ Cloud" },
              { icon: Heart,    label: "Prévention escarre",  sub: "Protocoles cliniques intégrés" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-5 group/item">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover/item:bg-white/20 transition-colors">
                  <Icon size={20} className="text-blue-100" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>{label}</p>
                  <p className="text-blue-200/60 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — refined form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-[#001f3f] tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
              Connexion
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Accédez à votre tableau de bord clinique</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest text-slate-400 font-bold ml-1">Adresse email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input
                  type="email"
                  placeholder="infirmier@clinique.ma"
                  autoComplete="email"
                  className="h-13 pl-11 rounded-2xl bg-white border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Mot de passe</Label>
                <button type="button" className="text-[11px] font-bold text-primary hover:underline underline-offset-4">Mot de passe oublié ?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-13 pl-11 pr-12 rounded-2xl bg-white border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-[#001f3f] hover:bg-[#002d5c] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/10 active:scale-[0.98] transition-all text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Activity className="animate-pulse" size={18} />
                  Connexion...
                </span>
              ) : "Se connecter"}
            </Button>
          </form>

          {/* Biometric row */}
          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#f8fafc] px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">BIOMÉTRIE</span>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-6">
            <button type="button" className="group flex flex-col items-center gap-2 p-5 w-28 rounded-2xl border border-slate-100 bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all active:scale-95" aria-label="Empreinte digitale">
              <Fingerprint size={28} className="text-slate-300 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Empreinte</span>
            </button>
            <button type="button" className="group flex flex-col items-center gap-2 p-5 w-28 rounded-2xl border border-slate-100 bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all active:scale-95" aria-label="Face ID">
              <div className="relative">
                 <Activity size={28} className="text-slate-300 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Face ID</span>
            </button>
          </div>

          <footer className="mt-12 text-center">
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Système sécurisé ClinicaPulse v4.0.1<br/>
              © 2024 ClinicaPulse Systems. HIPAA Compliant.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}