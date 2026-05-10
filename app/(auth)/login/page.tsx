"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Fingerprint, Wifi, Shield, Activity, Heart } from "lucide-react";
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
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-center px-16 w-[480px] flex-shrink-0"
        style={{ background: "#003f7b" }}
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-white text-lg font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>DS</span>
          </div>
          <span className="text-white text-3xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
            DERMASENSE
          </span>
        </div>
        <p className="text-[#93c5fd] text-sm mb-10">Surveillance de Pression Clinique</p>
        <div className="space-y-4">
          {[
            { icon: Shield,   label: "Temps r\u00e9el",      sub: "Donn\u00e9es live toutes les 5s" },
            { icon: Activity, label: "MQTT IoT",         sub: "ESP32 + HiveMQ Cloud" },
            { icon: Heart,    label: "Pr\u00e9vention escarre", sub: "Protocoles cliniques int\u00e9gr\u00e9s" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold" style={{ fontFamily: "Manrope, sans-serif" }}>{label}</p>
                <p className="text-[#93c5fd] text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-[#f9fafb] p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#003f7b]" style={{ fontFamily: "Manrope, sans-serif" }}>
              Connexion
            </h1>
            <p className="text-sm text-gray-500 mt-1">Acc\u00e9dez \u00e0 votre tableau de bord clinique</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-gray-500 font-medium">Adresse email</Label>
              <Input
                type="email"
                placeholder="infirmier@clinique.ma"
                autoComplete="email"
                className="h-11 rounded-xl bg-white border-gray-200"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-[#ba1a1a]">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-gray-500 font-medium">Mot de passe</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  autoComplete="current-password"
                  className="h-11 pr-10 rounded-xl bg-white border-gray-200"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#ba1a1a]">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-[#ba1a1a] text-sm rounded-xl px-3 py-2.5">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#003f7b] hover:bg-[#1a5c9e] text-white font-semibold rounded-xl"
            >
              {loading ? "Connexion\u2026" : "Se connecter"}
            </Button>
          </form>

          {/* Biometric row */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <button type="button" className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors" aria-label="Empreinte digitale">
              <Fingerprint size={22} className="text-[#003f7b]" />
              <span className="text-[10px] text-gray-500">Empreinte</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors" aria-label="Face ID">
              <Wifi size={22} className="text-[#003f7b]" />
              <span className="text-[10px] text-gray-500">Face ID</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
