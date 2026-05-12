import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ZoneName } from "@/types/sensor.types";

const ZONE_LABELS: Record<ZoneName, string> = {
  sacrum:    "Sacrum",
  shoulders: "Épaules",
  heels:     "Talons",
  thorax:    "Thorax",
  legs:      "Jambes",
};

interface ZoneRow {
  name: ZoneName;
  avg: number;
  max: number;
  count_over_32: number;
}

interface ZoneRiskTableProps {
  zones: ZoneRow[] | null;
}

function statusBadge(avg: number) {
  if (avg >= 40) return <span className="text-xs font-bold text-white bg-[#ba1a1a] px-2 py-0.5 rounded-full">URGENCE</span>;
  if (avg >= 32) return <span className="text-xs font-bold text-[#ba1a1a] bg-red-100 px-2 py-0.5 rounded-full">Critique</span>;
  if (avg >= 30) return <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Prévention</span>;
  return <span className="text-xs font-bold text-[#006e11] bg-green-100 px-2 py-0.5 rounded-full">OK</span>;
}

export function ZoneRiskTable({ zones }: ZoneRiskTableProps) {
  if (!zones || zones.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Zones \u00e0 Risque</p>
        <div className="flex items-center justify-center h-16 text-gray-400 text-xs">En attente des capteurs\u2026</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
        Zones à Risque
      </p>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className="text-[10px] text-gray-400 font-semibold">Zone</TableHead>
            <TableHead className="text-[10px] text-gray-400 font-semibold text-right">Moy.</TableHead>
            <TableHead className="text-[10px] text-gray-400 font-semibold text-right">Max</TableHead>
            <TableHead className="text-[10px] text-gray-400 font-semibold text-right">Capteurs&nbsp;&gt;32</TableHead>
            <TableHead className="text-[10px] text-gray-400 font-semibold text-right">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zones.map((z) => (
            <TableRow key={z.name} className="border-gray-50">
              <TableCell className="text-sm font-medium text-gray-800">{ZONE_LABELS[z.name]}</TableCell>
              <TableCell className="text-sm text-right text-gray-700">{z.avg} mmHg</TableCell>
              <TableCell className="text-sm text-right text-gray-700">{z.max} mmHg</TableCell>
              <TableCell className="text-sm text-right">
                <span className={z.count_over_32 > 0 ? "font-bold text-[#ba1a1a]" : "text-gray-400"}>
                  {z.count_over_32}/2
                </span>
              </TableCell>
              <TableCell className="text-right">{statusBadge(z.avg)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
