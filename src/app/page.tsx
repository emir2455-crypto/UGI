import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Badge from "@/components/Badge";
import { CHANNEL_LABELS, VEHICLE_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatEUR } from "@/lib/format";
import { occupancyRate, periodRevenue, revenueByChannel } from "@/lib/stats";
import { addDays } from "date-fns";

export const dynamic = "force-dynamic";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getSession();
  const isAdmin = user?.role === "ADMIN";

  const [vehicles, reservations] = await Promise.all([
    prisma.vehicle.findMany(),
    prisma.reservation.findMany({ include: { vehicle: true } }),
  ]);

  const disponible = vehicles.filter((v) => v.status === "DISPONIBLE").length;
  const enLocation = vehicles.filter((v) => v.status === "EN_LOCATION").length;
  const enPanne = vehicles.filter((v) => v.status === "EN_PANNE").length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = monthStart;

  const monthRevenue = periodRevenue(reservations, monthStart, monthEnd);
  const prevMonthRevenue = periodRevenue(reservations, prevMonthStart, prevMonthEnd);
  const deltaPct = prevMonthRevenue > 0 ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : monthRevenue > 0 ? 100 : 0;

  const channelRevenue = revenueByChannel(reservations, monthStart, monthEnd);
  const channelEntries = Object.entries(channelRevenue).sort((a, b) => b[1] - a[1]);
  const maxChannelRevenue = channelEntries.length > 0 ? channelEntries[0][1] : 0;

  const occStart = addDays(now, -30);
  const occ = occupancyRate(reservations, vehicles.length, occStart, now);

  const revenuePerVehicle = vehicles.length > 0 ? monthRevenue / vehicles.length : 0;

  const upcomingReturns = reservations
    .filter((r) => r.state === "ACTIVE" && r.endDate >= now)
    .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Tableau de bord</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Disponibles maintenant" value={String(disponible)} />
        <StatCard label="En location maintenant" value={String(enLocation)} />
        <StatCard label="En panne" value={String(enPanne)} />
      </div>

      {isAdmin && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard
              label="Chiffre d'affaires — mois en cours"
              value={formatEUR(monthRevenue)}
              sub={`${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}% vs mois précédent (${formatEUR(prevMonthRevenue)})`}
            />
            <StatCard label="Taux d'occupation flotte (30j)" value={`${occ.toFixed(0)}%`} />
            <StatCard label="Revenu moyen par véhicule (mois)" value={formatEUR(revenuePerVehicle)} />
          </div>

          <div className="card">
            <p className="font-semibold mb-3">Chiffre d&apos;affaires par canal — mois en cours</p>
            <div className="flex flex-col gap-2">
              {channelEntries.length === 0 && <p className="text-zinc-500 text-sm">Aucun revenu ce mois-ci.</p>}
              {channelEntries.map(([channel, amount]) => (
                <div key={channel} className="flex items-center gap-3">
                  <span className="text-sm w-24 shrink-0">{CHANNEL_LABELS[channel as keyof typeof CHANNEL_LABELS]}</span>
                  <div className="flex-1 bg-base-panel2 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber h-full rounded-full"
                      style={{ width: `${maxChannelRevenue > 0 ? (amount / maxChannelRevenue) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-24 text-right shrink-0">{formatEUR(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="card">
        <p className="font-semibold mb-3">Prochains retours</p>
        <div className="flex flex-col gap-2">
          {upcomingReturns.length === 0 && <p className="text-zinc-500 text-sm">Aucun retour à venir.</p>}
          {upcomingReturns.map((r) => (
            <Link
              key={r.id}
              href={`/reservations/${r.id}`}
              className="flex items-center justify-between text-sm hover:text-amber"
            >
              <span>
                <span className="font-mono font-semibold">{r.vehicle.plate}</span> — {r.clientName}
              </span>
              <Badge className="border-transparent bg-base-panel2 text-zinc-300">{formatDate(r.endDate)}</Badge>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(VEHICLE_STATUS_LABELS).map(([status, label]) => {
          const count = vehicles.filter((v) => v.status === status).length;
          return (
            <div key={status} className="card flex items-center justify-between">
              <span className="text-sm text-zinc-400">{label}</span>
              <span className="font-bold">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
