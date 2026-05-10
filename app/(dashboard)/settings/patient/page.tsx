"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PatientSchema, type PatientInput } from "@/lib/validations/patient.schema";

const PATIENT_ID = "7724";

export default function PatientFilePage() {
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<PatientInput>({
    resolver: zodResolver(PatientSchema),
  });

  useEffect(() => {
    fetch("/api/patients/" + PATIENT_ID)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.patient) reset(data.patient); })
      .catch(() => {});
  }, [reset]);

  const onSubmit = async (data: PatientInput) => {
    await fetch("/api/patients/" + PATIENT_ID, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Manrope, sans-serif" }}>
          Dossier Medical
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">

          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Informations Generales
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Nom complet</Label>
                <Input {...register("name")} className="h-10" />
                {errors.name && <p className="text-xs text-[#ba1a1a]">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Age</Label>
                <Input type="number" {...register("age", { valueAsNumber: true })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Service</Label>
                <Input {...register("ward")} className="h-10" />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Donnees Cliniques
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Score de Braden</Label>
                <Input type="number" {...register("braden_score", { valueAsNumber: true })} min={6} max={23} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Repositionnement (min)</Label>
                <Input type="number" {...register("repositioning_interval_min", { valueAsNumber: true })} min={15} max={240} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Mobilite</Label>
                <Input {...register("mobility_status")} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Etat de la peau</Label>
                <Input {...register("skin_condition")} className="h-10" />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-1.5">
            <Label className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Notes Cliniques</Label>
            <textarea
              {...register("clinical_notes")}
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#003f7b]/30"
              placeholder="Notes et observations..."
            />
          </div>

          <Button
            type="submit"
            disabled={!isDirty && !saved}
            className="w-full h-11 bg-[#003f7b] hover:bg-[#1a5c9e] text-white font-semibold rounded-xl"
          >
            <Save size={16} className="mr-2" />
            {saved ? "Enregistre" : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}
