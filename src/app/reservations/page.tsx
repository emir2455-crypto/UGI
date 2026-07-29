import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Badge from "@/components/Badge";
import {
  CHANNEL_LABELS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
} from "@/lib/constants";
import { formatDate, formatEUR } from "@/lib/format";
import { computeReservationStatus, findOverlaps, reservationTotal } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const [user, reservations] = await Promise.all([
    getSession(),
    prisma.reservation.findMany({
      include: { vehicle: true },
      orderBy: { startDate: "desc" },
    }),
  ]);

  const overlaps = findOverlaps(reservations);
  const overlapIds = new Set(overlaps.flatMap(([a, b]) => [a.id, b.id]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Réservations</h1>
        {user?.role === "ADMIN" && (
          <Link href="/reservations/new" className="btn btn-primary">
            + Nouvelle réservation
          </Link>
        )}
      </div>

      {overlaps.length > 0 && (
        <div className="card border-red-500/40 bg-red-500/10 text-red-300 text-sm">
          ⚠ {overlaps.length} chevauchement(s) détecté(s) — plusieurs réservations sur le même véhicule aux mêmes
          dates. Vérifiez les lignes surlignées ci-dessous.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {reservations.map((r) => {
          const status = computeReservationStatus(r);
          const total = reservationTotal(r.startDate, r.endDate, r.dailyRate);
          const isOverlap = overlapIds.has(r.id);
          return (
            <Link
              key={r.id}
              href={`/reservations/${r.id}`}
              className={`card flex flex-col gap-1.5 hover:border-amber transition-colors ${
                isOverlap ? "border-red-500/60" : ""
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <span className="font-mono font-bold">{r.vehicle.plate}</span>
                <div className="flex gap-1.5">
                  {isOverlap && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/40">⚠ Chevauchement</Badge>
                  )}
                  <Badge className={RESERVATION_STATUS_COLORS[status]}>{RESERVATION_STATUS_LABELS[status]}</Badge>
                </div>
              </div>
              <p className="text-sm text-zinc-300">
                {r.clientName} · {CHANNEL_LABELS[r.channel as keyof typeof CHANNEL_LABELS]}
              </p>
              <p className="text-xs text-zinc-500">
                {formatDate(r.startDate)} → {formatDate(r.endDate)}
                {user?.role === "ADMIN" && <> · {formatEUR(total)}</>}
              </p>
            </Link>
          );
        })}
        {reservations.length === 0 && <p className="text-zinc-500 text-sm">Aucune réservation pour le moment.</p>}
      </div>
    </div>
  );
}
