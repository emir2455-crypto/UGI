import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Badge from "@/components/Badge";
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_COLORS,
  VEHICLE_TYPE_LABELS,
  ALERT_WINDOW_DAYS,
} from "@/lib/constants";
import { daysUntil, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const [user, vehicles] = await Promise.all([
    getSession(),
    prisma.vehicle.findMany({ orderBy: { plate: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Véhicules</h1>
        {user?.role === "ADMIN" && (
          <Link href="/vehicles/new" className="btn btn-primary">
            + Ajouter
          </Link>
        )}
      </div>

      {vehicles.length === 0 && (
        <p className="text-zinc-500 text-sm">Aucun véhicule enregistré pour le moment.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {vehicles.map((v) => {
          const ctDays = daysUntil(v.nextTechnicalCtrl);
          const maintDays = daysUntil(v.nextMaintenance);
          const ctAlert = ctDays !== null && ctDays <= ALERT_WINDOW_DAYS;
          const maintAlert = maintDays !== null && maintDays <= ALERT_WINDOW_DAYS;
          return (
            <Link
              key={v.id}
              href={`/vehicles/${v.id}`}
              className="card flex flex-col gap-2 hover:border-amber transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold tracking-wide">{v.plate}</span>
                <Badge className={VEHICLE_STATUS_COLORS[v.status as keyof typeof VEHICLE_STATUS_COLORS]}>
                  {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS]}
                </Badge>
              </div>
              <p className="text-sm text-zinc-300">
                {v.brand} {v.model} · {v.year} · {VEHICLE_TYPE_LABELS[v.type as keyof typeof VEHICLE_TYPE_LABELS]}
              </p>
              <p className="text-xs text-zinc-500">{v.mileage.toLocaleString("fr-FR")} km</p>
              {(ctAlert || maintAlert) && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {ctAlert && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/40">
                      ⚠ Contrôle technique {formatDate(v.nextTechnicalCtrl)}
                    </Badge>
                  )}
                  {maintAlert && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/40">
                      ⚠ Révision {formatDate(v.nextMaintenance)}
                    </Badge>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
