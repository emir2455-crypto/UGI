import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Badge from "@/components/Badge";
import ConfirmButton from "@/components/ConfirmButton";
import {
  CHANNEL_LABELS,
  DEPOSIT_METHOD_LABELS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
} from "@/lib/constants";
import { formatDate, formatEUR } from "@/lib/format";
import { computeReservationStatus, reservationDays, reservationTotal } from "@/lib/reservations";
import { cancelReservation, completeHandover, deleteReservation } from "@/app/actions/reservations";

export const dynamic = "force-dynamic";

export default async function ReservationDetailPage({ params }: { params: { id: string } }) {
  const [user, reservation] = await Promise.all([
    getSession(),
    prisma.reservation.findUnique({ where: { id: params.id }, include: { vehicle: true } }),
  ]);
  if (!reservation) notFound();

  const isAdmin = user?.role === "ADMIN";
  const status = computeReservationStatus(reservation);
  const days = reservationDays(reservation.startDate, reservation.endDate);
  const total = reservationTotal(reservation.startDate, reservation.endDate, reservation.dailyRate);

  const cancelWithId = cancelReservation.bind(null, reservation.id);
  const completeWithId = completeHandover.bind(null, reservation.id);
  const deleteWithId = deleteReservation.bind(null, reservation.id);

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold font-mono">{reservation.vehicle.plate}</h1>
            <Badge className={RESERVATION_STATUS_COLORS[status]}>{RESERVATION_STATUS_LABELS[status]}</Badge>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            {reservation.vehicle.brand} {reservation.vehicle.model}
          </p>
        </div>
        {isAdmin && reservation.state === "ACTIVE" && (
          <div className="flex gap-2">
            <Link href={`/reservations/${reservation.id}/edit`} className="btn btn-secondary">
              Modifier
            </Link>
          </div>
        )}
      </div>

      <div className="card grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-zinc-500">Client</p>
          <p className="font-semibold">{reservation.clientName}</p>
        </div>
        <div>
          <p className="text-zinc-500">Téléphone</p>
          <p className="font-semibold">{reservation.clientPhone}</p>
        </div>
        <div>
          <p className="text-zinc-500">Canal</p>
          <p className="font-semibold">{CHANNEL_LABELS[reservation.channel as keyof typeof CHANNEL_LABELS]}</p>
        </div>
        <div>
          <p className="text-zinc-500">Durée</p>
          <p className="font-semibold">{days} jour(s)</p>
        </div>
        <div>
          <p className="text-zinc-500">Début</p>
          <p className="font-semibold">{formatDate(reservation.startDate)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Fin</p>
          <p className="font-semibold">{formatDate(reservation.endDate)}</p>
        </div>
        {isAdmin && (
          <>
            <div>
              <p className="text-zinc-500">Tarif journalier</p>
              <p className="font-semibold">{formatEUR(reservation.dailyRate)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Total</p>
              <p className="font-semibold text-amber">{formatEUR(total)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Caution</p>
              <p className="font-semibold">{formatEUR(reservation.deposit)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Mode de paiement caution</p>
              <p className="font-semibold">
                {DEPOSIT_METHOD_LABELS[reservation.depositMethod as keyof typeof DEPOSIT_METHOD_LABELS]}
              </p>
            </div>
          </>
        )}
        <div>
          <p className="text-zinc-500">Km départ</p>
          <p className="font-semibold">{reservation.startMileage ?? "—"}</p>
        </div>
        <div>
          <p className="text-zinc-500">Km retour</p>
          <p className="font-semibold">{reservation.endMileage ?? "—"}</p>
        </div>
      </div>

      {reservation.notes && (
        <div className="card">
          <p className="text-zinc-500 text-sm mb-1">Notes</p>
          <p className="whitespace-pre-wrap text-sm">{reservation.notes}</p>
        </div>
      )}

      {reservation.state === "ANNULEE" && (
        <div className="card border-red-500/40 bg-red-500/10 text-red-300 text-sm">
          Réservation annulée{reservation.cancelReason ? ` — motif : ${reservation.cancelReason}` : ""}
        </div>
      )}

      {reservation.state === "ACTIVE" && (
        <section className="card flex flex-col gap-3">
          <h2 className="font-semibold">Remise / retour véhicule</h2>
          <form action={completeWithId} className="flex flex-col gap-3">
            <div>
              <label htmlFor="endMileage">Kilométrage de retour</label>
              <input id="endMileage" name="endMileage" type="number" min="0" defaultValue={reservation.endMileage ?? ""} />
            </div>
            <div>
              <label htmlFor="handoverNotes">Remarques (état des lieux, remise de clés...)</label>
              <textarea id="handoverNotes" name="handoverNotes" rows={2} />
            </div>
            <button type="submit" className="btn btn-primary">
              ✓ Marquer la réservation comme terminée
            </button>
          </form>
        </section>
      )}

      {isAdmin && reservation.state === "ACTIVE" && (
        <section className="card flex flex-col gap-3 border-red-500/30">
          <h2 className="font-semibold">Annuler la réservation</h2>
          <form action={cancelWithId} className="flex flex-col gap-3">
            <div>
              <label htmlFor="cancelReason">Motif d&apos;annulation</label>
              <input id="cancelReason" name="cancelReason" required />
            </div>
            <ConfirmButton confirmMessage="Confirmer l'annulation de cette réservation ?">
              Annuler la réservation
            </ConfirmButton>
          </form>
        </section>
      )}

      {isAdmin && (
        <form action={deleteWithId}>
          <ConfirmButton confirmMessage="Supprimer définitivement cette réservation ?" className="btn btn-danger">
            Supprimer définitivement
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
