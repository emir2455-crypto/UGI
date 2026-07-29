"use client";

import { useFormStatus } from "react-dom";
import {
  VEHICLE_TYPES,
  VEHICLE_TYPE_LABELS,
  VEHICLE_STATUSES,
  VEHICLE_STATUS_LABELS,
} from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";

type VehicleData = {
  id?: string;
  plate?: string;
  brand?: string;
  model?: string;
  type?: string;
  year?: number;
  status?: string;
  mileage?: number;
  nextTechnicalCtrl?: Date | string | null;
  nextMaintenance?: Date | string | null;
  keysLocation?: string | null;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Enregistrement..." : label}
    </button>
  );
}

export default function VehicleForm({
  action,
  vehicle,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  vehicle?: VehicleData;
  submitLabel: string;
}) {
  return (
    <form action={action} className="card flex flex-col gap-4 max-w-xl">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="plate">Plaque d&apos;immatriculation</label>
          <input id="plate" name="plate" defaultValue={vehicle?.plate} required placeholder="AA-123-BB" />
        </div>
        <div>
          <label htmlFor="year">Année</label>
          <input id="year" name="year" type="number" min={1980} max={2100} defaultValue={vehicle?.year} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="brand">Marque</label>
          <input id="brand" name="brand" defaultValue={vehicle?.brand} required />
        </div>
        <div>
          <label htmlFor="model">Modèle</label>
          <input id="model" name="model" defaultValue={vehicle?.model} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={vehicle?.type || VEHICLE_TYPES[0]} required>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {VEHICLE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status">Statut actuel</label>
          <select id="status" name="status" defaultValue={vehicle?.status || VEHICLE_STATUSES[0]} required>
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {VEHICLE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="mileage">Kilométrage actuel</label>
        <input id="mileage" name="mileage" type="number" min={0} defaultValue={vehicle?.mileage ?? 0} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="nextTechnicalCtrl">Prochain contrôle technique</label>
          <input
            id="nextTechnicalCtrl"
            name="nextTechnicalCtrl"
            type="date"
            defaultValue={toDateInputValue(vehicle?.nextTechnicalCtrl)}
          />
        </div>
        <div>
          <label htmlFor="nextMaintenance">Prochaine révision/entretien</label>
          <input
            id="nextMaintenance"
            name="nextMaintenance"
            type="date"
            defaultValue={toDateInputValue(vehicle?.nextMaintenance)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="keysLocation">Emplacement actuel des clés</label>
        <input
          id="keysLocation"
          name="keysLocation"
          defaultValue={vehicle?.keysLocation || ""}
          placeholder='ex: "chez moi", "dans le véhicule"'
        />
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
