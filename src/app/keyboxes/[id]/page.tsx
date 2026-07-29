import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ConfirmButton from "@/components/ConfirmButton";
import { formatDate, formatDateTime } from "@/lib/format";
import { isCodeStale, lastEndedReservation } from "@/lib/keyboxes";
import { computeReservationStatus } from "@/lib/reservations";
import { changeKeyBoxCode, deleteKeyBox } from "@/app/actions/keyboxes";

export const dynamic = "force-dynamic";

export default async function KeyBoxDetailPage({ params }: { params: { id: string } }) {
  const [user, keyBox] = await Promise.all([
    getSession(),
    prisma.keyBox.findUnique({
      where: { id: params.id },
      include: {
        vehicle: true,
        codeHistory: { include: { reservation: true }, orderBy: { date: "desc" } },
      },
    }),
  ]);
  if (!keyBox) notFound();

  const isAdmin = user?.role === "ADMIN";

  const vehicleReservations = keyBox.vehicleId
    ? await prisma.reservation.findMany({ where: { vehicleId: keyBox.vehicleId } })
    : [];

  const lastEnded = keyBox.vehicleId ? lastEndedReservation(vehicleReservations, keyBox.vehicleId) : null;
  const stale = isCodeStale(keyBox, lastEnded);

  const activeReservation = vehicleReservations
    .filter((r) => r.state === "ACTIVE")
    .find((r) => ["A_VENIR", "EN_COURS"].includes(computeReservationStatus(r)));

  const changeCodeWithId = changeKeyBoxCode.bind(null, keyBox.id);
  const deleteWithId = deleteKeyBox.bind(null, keyBox.id);

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">{keyBox.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">{keyBox.location}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href={`/keyboxes/${keyBox.id}/edit`} className="btn btn-secondary">
              Modifier
            </Link>
            <form action={deleteWithId}>
              <ConfirmButton confirmMessage="Supprimer ce boîtier et son historique de codes ?">
                Supprimer
              </ConfirmButton>
            </form>
          </div>
        )}
      </div>

      {stale && (
        <div className="card border-red-500/40 bg-red-500/10 text-red-300 text-sm">
          ⚠ Le code n&apos;a pas été changé depuis la fin de la dernière location
          {lastEnded ? ` (terminée le ${formatDate(lastEnded.endDate)})` : ""}. L&apos;ancien client pourrait
          encore connaître le code.
        </div>
      )}

      <div className="card flex items-center justify-between">
        <div>
          <p className="text-zinc-500 text-sm">Code d&apos;accès actuel</p>
          <p className="font-mono text-3xl text-amber tracking-widest mt-1">{keyBox.currentCode}</p>
          <p className="text-xs text-zinc-500 mt-1">Changé le {formatDateTime(keyBox.codeChangedAt)}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-zinc-500">Véhicule assigné</p>
          <p className="font-semibold font-mono">{keyBox.vehicle ? keyBox.vehicle.plate : "—"}</p>
        </div>
      </div>

      {activeReservation && (
        <div className="card border-amber/50 bg-amber-500/10">
          <p className="text-sm text-amber font-semibold mb-1">
            Réservation {computeReservationStatus(activeReservation) === "EN_COURS" ? "en cours" : "à venir"} pour ce
            véhicule
          </p>
          <p className="text-sm text-zinc-300">
            {activeReservation.clientName} · {formatDate(activeReservation.startDate)} →{" "}
            {formatDate(activeReservation.endDate)}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Générez et affichez un nouveau code à communiquer à ce client ci-dessous.
          </p>
        </div>
      )}

      <section className="card flex flex-col gap-3">
        <p className="font-semibold">Changer le code</p>
        <form action={changeCodeWithId} className="flex flex-col sm:flex-row gap-3 items-end">
          {activeReservation && <input type="hidden" name="reservationId" value={activeReservation.id} />}
          <div className="flex-1 w-full">
            <label htmlFor="newCode">Nouveau code</label>
            <input id="newCode" name="newCode" required placeholder="Ex: 4821" />
          </div>
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            Valider le nouveau code
          </button>
        </form>
      </section>

      {keyBox.notes && (
        <div className="card">
          <p className="text-zinc-500 text-sm mb-1">Notes</p>
          <p className="whitespace-pre-wrap text-sm">{keyBox.notes}</p>
        </div>
      )}

      <section className="card">
        <p className="font-semibold mb-3">Historique des changements de code</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Ancien code</th>
                <th>Nouveau code</th>
                <th>Client concerné</th>
              </tr>
            </thead>
            <tbody>
              {keyBox.codeHistory.map((h) => (
                <tr key={h.id}>
                  <td>{formatDateTime(h.date)}</td>
                  <td className="font-mono">{h.oldCode}</td>
                  <td className="font-mono">{h.newCode}</td>
                  <td>{h.reservation ? h.reservation.clientName : "—"}</td>
                </tr>
              ))}
              {keyBox.codeHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-zinc-500">
                    Aucun changement enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
