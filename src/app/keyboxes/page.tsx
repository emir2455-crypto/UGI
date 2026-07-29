import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Badge from "@/components/Badge";
import { formatDate } from "@/lib/format";
import { isCodeStale, lastEndedReservation } from "@/lib/keyboxes";

export const dynamic = "force-dynamic";

export default async function KeyBoxesPage() {
  const [user, keyBoxes, reservations] = await Promise.all([
    getSession(),
    prisma.keyBox.findMany({ include: { vehicle: true }, orderBy: { name: "asc" } }),
    prisma.reservation.findMany(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Boîtiers à clés</h1>
        {user?.role === "ADMIN" && (
          <Link href="/keyboxes/new" className="btn btn-primary">
            + Ajouter
          </Link>
        )}
      </div>

      {keyBoxes.length === 0 && <p className="text-zinc-500 text-sm">Aucun boîtier enregistré pour le moment.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {keyBoxes.map((kb) => {
          const lastEnded = kb.vehicleId ? lastEndedReservation(reservations, kb.vehicleId) : null;
          const stale = isCodeStale(kb, lastEnded);
          return (
            <Link key={kb.id} href={`/keyboxes/${kb.id}`} className="card flex flex-col gap-2 hover:border-amber transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold">{kb.name}</span>
                {stale && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/40">⚠ Code à changer</Badge>
                )}
              </div>
              <p className="text-sm text-zinc-400">{kb.location}</p>
              <p className="text-xs text-zinc-500">
                Véhicule : {kb.vehicle ? kb.vehicle.plate : "aucun"}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-lg text-amber tracking-widest">{kb.currentCode}</span>
                <span className="text-xs text-zinc-500">changé le {formatDate(kb.codeChangedAt)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
