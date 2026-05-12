"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, UserPlus, Search, Check, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePatientStore } from "@/store/usePatientStore";
import type { Patient } from "@/types/patient.types";

/* ── tiny schema for the create form ── */
const QuickPatientSchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères"),
  age: z.number().int().min(1).max(130),
  ward: z.string().min(1, "Requis"),
  diagnosis: z.string().min(1, "Requis"),
  braden_score: z.number().int().min(6).max(23),
  mobility_status: z.string().min(1),
  repositioning_interval_min: z.number().int().min(15).max(240),
  skin_condition: z.string().min(1),
  clinical_notes: z.string().optional(),
});
type QuickPatientInput = z.infer<typeof QuickPatientSchema>;

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function PatientSwitcher() {
  const patient = usePatientStore((s) => s.patient);
  const setPatient = usePatientStore((s) => s.setPatient);

  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* close dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* fetch patients list when dropdown opens */
  useEffect(() => {
    if (!open) return;
    setLoadingList(true);
    fetch("/api/patients")
      .then((r) => r.json())
      .then((d) => setPatients(d.patients ?? []))
      .catch(() => setPatients([]))
      .finally(() => setLoadingList(false));
  }, [open]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuickPatientInput>({
    resolver: zodResolver(QuickPatientSchema),
    defaultValues: {
      name: "",
      age: undefined as unknown as number,
      ward: "",
      diagnosis: "",
      braden_score: 18,
      mobility_status: "limited",
      repositioning_interval_min: 120,
      skin_condition: "intact",
      clinical_notes: "",
    },
  });

  const onSelect = (p: Patient) => {
    setPatient(p);
    setOpen(false);
    setSearch("");
    // persist for page refreshes
    localStorage.setItem("dermasense_patient", JSON.stringify(p));
  };

  const onCreateSubmit = async (data: QuickPatientInput) => {
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          diagnosis: data.diagnosis.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setCreateError(json.error ?? "Erreur"); return; }
      setPatient(json.patient);
      localStorage.setItem("dermasense_patient", JSON.stringify(json.patient));
      setShowModal(false);
      setOpen(false);
      reset();
    } catch {
      setCreateError("Impossible de contacter le serveur.");
    } finally {
      setCreating(false);
    }
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* ── Trigger pill ── */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-1.5 pr-3 shadow-sm hover:bg-slate-100 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200">
            <span className="text-blue-700 text-xs font-black">
              {patient ? initials(patient.name) : "?"}
            </span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#001f3f] leading-none" style={{ fontFamily: "Manrope, sans-serif" }}>
                {patient?.name ?? "Sélectionner un patient"}
              </span>
              {patient?.patient_id && (
                <span className="bg-[#001f3f]/5 text-[#001f3f] text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  {patient.patient_id}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
              {patient ? `${patient.ward} • Braden ${patient.braden_score}` : "Aucun patient actif"}
            </p>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {/* ── Dropdown panel ── */}
        {open && (
          <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search */}
            <div className="p-2 border-b border-slate-50">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un patient…"
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#001f3f]/40"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-52 overflow-y-auto">
              {loadingList ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={18} className="animate-spin text-slate-300" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-5">Aucun résultat</p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => onSelect(p)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-[10px] font-black">{initials(p.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#001f3f] truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{p.patient_id} • {p.ward}</p>
                    </div>
                    {patient?._id === p._id && <Check size={14} className="text-[#006e11] flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>

            {/* New patient button */}
            <div className="p-2 border-t border-slate-50">
              <button
                onClick={() => { setShowModal(true); setOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#001f3f] hover:bg-[#002d5c] text-white text-xs font-bold uppercase tracking-widest transition-all"
              >
                <UserPlus size={14} />
                Nouveau patient
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Patient Modal — rendered in document.body via portal ── */}
      {showModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[999]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          {/* Scrollable card wrapper */}
          <div className="relative z-10 h-full overflow-y-auto flex justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-7 animate-in fade-in zoom-in-95 duration-200 self-start">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-[#001f3f]">Nouveau patient</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Nom complet *</label>
                    <input {...register("name")} placeholder="ex: Ouiame Salimi" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-[#001f3f]/50" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Âge *</label>
                    <input {...register("age", { valueAsNumber: true })} type="number" placeholder="ex: 74" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-[#001f3f]/50" />
                    {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Service *</label>
                    <input {...register("ward")} placeholder="ex: Gériatrie" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-[#001f3f]/50" />
                    {errors.ward && <p className="text-xs text-red-500">{errors.ward.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Diagnostics * <span className="normal-case font-normal text-slate-400">(séparés par virgule)</span></label>
                    <input {...register("diagnosis")} placeholder="ex: Escarre stade 2, Diabète" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-[#001f3f]/50" />
                    {errors.diagnosis && <p className="text-xs text-red-500">{errors.diagnosis.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Score Braden</label>
                    <input {...register("braden_score", { valueAsNumber: true })} type="number" min={6} max={23} placeholder="6–23" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-[#001f3f]/50" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Intervalle repos. (min)</label>
                    <input {...register("repositioning_interval_min", { valueAsNumber: true })} type="number" placeholder="120" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-[#001f3f]/50" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Mobilité</label>
                    <select {...register("mobility_status")} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-[#001f3f]/50">
                      <option value="limited">Limitée</option>
                      <option value="very_limited">Très limitée</option>
                      <option value="completely_immobile">Immobile</option>
                      <option value="no_limitation">Normale</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">État cutané</label>
                    <select {...register("skin_condition")} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-[#001f3f]/50">
                      <option value="intact">Intact</option>
                      <option value="vulnerable">Vulnérable</option>
                      <option value="compromised">Compromis</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Notes cliniques</label>
                    <textarea {...register("clinical_notes")} rows={2} placeholder="Observations…" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:outline-none focus:border-[#001f3f]/50" />
                  </div>
                </div>

                {createError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-4 py-3">{createError}</div>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full h-12 bg-[#001f3f] hover:bg-[#002d5c] text-white font-bold rounded-xl text-sm uppercase tracking-widest shadow-lg shadow-[#001f3f]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {creating ? <><Loader2 size={16} className="animate-spin" /> Création…</> : "Créer le patient"}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
