"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  CHANNELS,
  CHANNEL_LABELS,
  DEPOSIT_METHODS,
  DEPOSIT_METHOD_LABELS,
} from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";

type VehicleOption = { id: string; plate: string; brand: string; model: string };

type ReservationData = {
  vehicleId?: string;
  clientName?: string;
  clientPhone?: string;
  channel?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  dailyRate?: number;
  deposit?: number;
  depositMethod?: string;
  notes?: string | null;
  startMileage?: number | null;
  endMileage?: number | null;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Enregistrement..." : label}
    </button>
  );
}

export default function ReservationForm({
  action,
  vehicles,
  reservation,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  vehicles: VehicleOption[];
  reservation?: ReservationData;
  submitLabel: string;
}) {
  const [startDate, setStartDate] = useState(toDateInputValue(reservation?.startDate) || "");
  const [endDate, setEndDate] = useState(toDateInputValue(reservation?.endDate) || "");
  const [dailyRate, setDailyRate] = useState(reservation?.dailyRate ?? 0);

  const { days, total } = useMemo(() => {
    if (!startDate || !endDate) return { days: 0, total: 0 };
    const s = new Date(startDate);
    const e = new Date(endDate);
    const ms = e.getTime() - s.getTime();
    const d = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    return { days: d, total: d * dailyRate };
  }, [startDate, endDate, dailyRate]);

  return (
    <form action={action} className="card flex flex-col gap-4 max-w-xl">
      <div>
        <label htmlFor="vehicleId">Véhicule</label>
        <select id="vehicleId" name="vehicleId" defaultValue={reservation?.vehicleId} required>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.plate} — {v.brand} {v.model}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="clientName">Nom du client</label>
          <input id="clientName" name="clientName" defaultValue={reservation?.clientName} required />
        </div>
        <div>
          <label htmlFor="clientPhone">Téléphone</label>
          <input id="clientPhone" name="clientPhone" type="tel" defaultValue={reservation?.clientPhone} required />
        </div>
      </div>
      <div>
        <label htmlFor="channel">Canal de réservation</label>
        <select id="channel" name="channel" defaultValue={reservation?.channel || CHANNELS[0]} required>
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {CHANNEL_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="startDate">Début</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="endDate">Fin</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dailyRate">Tarif journalier (€)</label>
          <input
            id="dailyRate"
            name="dailyRate"
            type="number"
            step="0.01"
            min="0"
            value={dailyRate}
            onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
            required
          />
        </div>
        <div>
          <label>Total estimé</label>
          <p className="py-2 text-amber font-semibold">
            {days > 0 ? `${days} jour(s) — ${total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}` : "—"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="deposit">Montant de la caution (€)</label>
          <input id="deposit" name="deposit" type="number" step="0.01" min="0" defaultValue={reservation?.deposit ?? 0} />
        </div>
        <div>
          <label htmlFor="depositMethod">Mode de paiement caution</label>
          <select id="depositMethod" name="depositMethod" defaultValue={reservation?.depositMethod || DEPOSIT_METHODS[0]}>
            {DEPOSIT_METHODS.map((m) => (
              <option key={m} value={m}>
                {DEPOSIT_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="startMileage">Kilométrage de départ</label>
          <input id="startMileage" name="startMileage" type="number" min="0" defaultValue={reservation?.startMileage ?? ""} />
        </div>
        <div>
          <label htmlFor="endMileage">Kilométrage de retour</label>
          <input id="endMileage" name="endMileage" type="number" min="0" defaultValue={reservation?.endMileage ?? ""} />
        </div>
      </div>
      <div>
        <label htmlFor="notes">Notes (état du véhicule, remarques...)</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={reservation?.notes || ""} />
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
