import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Badge from "@/components/Badge";
import ConfirmButton from "@/components/ConfirmButton";
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_COLORS,
  VEHICLE_TYPE_LABELS,
  ALERT_WINDOW_DAYS,
} from "@/lib/constants";
import { daysUntil, formatDate, formatEUR } from "@/lib/format";
import { addIncident, addMaintenance, deleteIncident, deleteMaintenance, deleteVehicle } from "@/app/actions/vehicles";

export const dynamic = "force-dynamic";

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const [user, vehicle] = await Promise.all([getSession(), prisma.vehicle.findUnique({
    where: { id: params.id },
    include: {
      incidents: { orderBy: { date: "desc" } },
      maintenances: { orderBy: { date: "desc" } },
    },
  })]);

  if (!vehicle) notFound();

  const isAdmin = user?.role === "ADMIN";
  const ctDays = daysUntil(vehicle.nextTechnicalCtrl);
  const maintDays = daysUntil(vehicle.nextMaintenance);
  const ctAlert = ctDays !== null && ctDays <= ALERT_WINDOW_DAYS;
  const maintAlert = maintDays !== null && maintDays <= ALERT_WINDOW_DAYS;

  const incidentTotal = vehicle.incidents.reduce((s, i) => s + i.cost, 0);
  const maintTotal = vehicle.maintenances.reduce((s, m) => s + m.cost, 0);

  const deleteVehicleWithId = deleteVehicle.bind(null, vehicle.id);
  const addIncidentWithId = addIncident.bind(null, vehicle.id);
  const addMaintenanceWithId = addMaintenance.bind(null, vehicle.id);

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold font-mono">{vehicle.plate}</h1>
            <Badge className={VEHICLE_STATUS_COLORS[vehicle.status as keyof typeof VEHICLE_STATUS_COLORS]}>
              {VEHICLE_STATUS_LABELS[vehicle.status as keyof typeof VEHICLE_STATUS_LABELS]}
            </Badge>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            {vehicle.brand} {vehicle.model} · {vehicle.year} ·{" "}
            {VEHICLE_TYPE_LABELS[vehicle.type as keyof typeof VEHICLE_TYPE_LABELS]}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href={`/vehicles/${vehicle.id}/edit`} className="btn btn-secondary">
              Modifier
            </Link>
            <form action={deleteVehicleWithId}>
              <ConfirmButton confirmMessage="Supprimer ce véhicule et tout son historique ?">
                Supprimer
              </ConfirmButton>
            </form>
          </div>
        )}
      </div>

      {(ctAlert || maintAlert) && (
        <div className="flex flex-col gap-2">
          {ctAlert && (
            <div className="card border-red-500/40 bg-red-500/10 text-red-300 text-sm">
              ⚠ Contrôle technique {ctDays !== null && ctDays < 0 ? "dépassé depuis" : "prévu dans"}{" "}
              {Math.abs(ctDays!)} jour(s) — {formatDate(vehicle.nextTechnicalCtrl)}
            </div>
          )}
          {maintAlert && (
            <div className="card border-red-500/40 bg-red-500/10 text-red-300 text-sm">
              ⚠ Révision {maintDays !== null && maintDays < 0 ? "dépassée depuis" : "prévue dans"}{" "}
              {Math.abs(maintDays!)} jour(s) — {formatDate(vehicle.nextMaintenance)}
            </div>
          )}
        </div>
      )}

      <div className="card grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-zinc-500">Kilométrage</p>
          <p className="font-semibold">{vehicle.mileage.toLocaleString("fr-FR")} km</p>
        </div>
        <div>
          <p className="text-zinc-500">Emplacement des clés</p>
          <p className="font-semibold">{vehicle.keysLocation || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-500">Prochain contrôle technique</p>
          <p className="font-semibold">{formatDate(vehicle.nextTechnicalCtrl)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Prochaine révision</p>
          <p className="font-semibold">{formatDate(vehicle.nextMaintenance)}</p>
        </div>
      </div>

      {/* Incidents / pannes */}
      <section className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Historique des pannes</h2>
          <span className="text-xs text-zinc-500">Total {formatEUR(incidentTotal)}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Coût</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {vehicle.incidents.map((i) => {
                const del = deleteIncident.bind(null, vehicle.id, i.id);
                return (
                  <tr key={i.id}>
                    <td>{formatDate(i.date)}</td>
                    <td className="whitespace-normal">{i.description}</td>
                    <td>{formatEUR(i.cost)}</td>
                    {isAdmin && (
                      <td>
                        <form action={del}>
                          <button className="text-xs text-red-400" type="submit">
                            Suppr.
                          </button>
                        </form>
                      </td>
                    )}
                  </tr>
                );
              })}
              {vehicle.incidents.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-zinc-500">
                    Aucune panne enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isAdmin && (
          <form action={addIncidentWithId} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end pt-2 border-t border-base-border">
            <div>
              <label>Date</label>
              <input type="date" name="date" required />
            </div>
            <div className="sm:col-span-2">
              <label>Description</label>
              <input type="text" name="description" required />
            </div>
            <div>
              <label>Coût (€)</label>
              <input type="number" step="0.01" min="0" name="cost" required />
            </div>
            <button type="submit" className="btn btn-secondary sm:col-span-4">
              + Ajouter une panne
            </button>
          </form>
        )}
      </section>

      {/* Maintenance */}
      <section className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Historique des entretiens</h2>
          <span className="text-xs text-zinc-500">Total {formatEUR(maintTotal)}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Coût</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {vehicle.maintenances.map((m) => {
                const del = deleteMaintenance.bind(null, vehicle.id, m.id);
                return (
                  <tr key={m.id}>
                    <td>{formatDate(m.date)}</td>
                    <td className="whitespace-normal">{m.type}</td>
                    <td>{formatEUR(m.cost)}</td>
                    {isAdmin && (
                      <td>
                        <form action={del}>
                          <button className="text-xs text-red-400" type="submit">
                            Suppr.
                          </button>
                        </form>
                      </td>
                    )}
                  </tr>
                );
              })}
              {vehicle.maintenances.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-zinc-500">
                    Aucun entretien enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isAdmin && (
          <form action={addMaintenanceWithId} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end pt-2 border-t border-base-border">
            <div>
              <label>Date</label>
              <input type="date" name="date" required />
            </div>
            <div className="sm:col-span-2">
              <label>Type</label>
              <input type="text" name="type" required placeholder="Vidange, pneus..." />
            </div>
            <div>
              <label>Coût (€)</label>
              <input type="number" step="0.01" min="0" name="cost" required />
            </div>
            <button type="submit" className="btn btn-secondary sm:col-span-4">
              + Ajouter un entretien
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
