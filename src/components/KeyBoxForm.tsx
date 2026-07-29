"use client";

import { useFormStatus } from "react-dom";

type VehicleOption = { id: string; plate: string; brand: string; model: string };

type KeyBoxData = {
  name?: string;
  location?: string;
  vehicleId?: string | null;
  notes?: string | null;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Enregistrement..." : label}
    </button>
  );
}

export default function KeyBoxForm({
  action,
  vehicles,
  keyBox,
  submitLabel,
  isNew,
}: {
  action: (formData: FormData) => void;
  vehicles: VehicleOption[];
  keyBox?: KeyBoxData;
  submitLabel: string;
  isNew?: boolean;
}) {
  return (
    <form action={action} className="card flex flex-col gap-4 max-w-xl">
      <div>
        <label htmlFor="name">Identifiant / nom du boîtier</label>
        <input id="name" name="name" defaultValue={keyBox?.name} required placeholder="Boîtier Entrée Immeuble" />
      </div>
      <div>
        <label htmlFor="location">Emplacement physique</label>
        <input id="location" name="location" defaultValue={keyBox?.location} required placeholder="12 rue des Lilas, Paris" />
      </div>
      <div>
        <label htmlFor="vehicleId">Véhicule assigné</label>
        <select id="vehicleId" name="vehicleId" defaultValue={keyBox?.vehicleId || ""}>
          <option value="">— Aucun —</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.plate} — {v.brand} {v.model}
            </option>
          ))}
        </select>
      </div>
      {isNew && (
        <div>
          <label htmlFor="initialCode">Code d&apos;accès initial</label>
          <input id="initialCode" name="initialCode" required placeholder="1234" />
        </div>
      )}
      <div>
        <label htmlFor="notes">Notes (marque/modèle, instructions d&apos;accès...)</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={keyBox?.notes || ""} />
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
