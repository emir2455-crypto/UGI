import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CHANNEL_COLORS, CHANNEL_LABELS } from "@/lib/constants";
import { dayCoversDate, getRange, isSameDay, parseAnchorDate, shiftAnchor, type CalendarView } from "@/lib/calendar";
import { findOverlaps } from "@/lib/reservations";
import { addDays } from "date-fns";

export const dynamic = "force-dynamic";

function fmtQueryDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { view?: string; date?: string };
}) {
  const view: CalendarView = searchParams.view === "month" ? "month" : "week";
  const anchor = parseAnchorDate(searchParams.date);
  const days = getRange(view, anchor);

  const [vehicles, reservations] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { plate: "asc" } }),
    prisma.reservation.findMany({ where: { state: "ACTIVE" }, include: { vehicle: true } }),
  ]);

  const overlaps = findOverlaps(reservations);
  const overlapIds = new Set(overlaps.flatMap(([a, b]) => [a.id, b.id]));

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const returnsToday = reservations.filter((r) => isSameDay(r.endDate, today));
  const returnsTomorrow = reservations.filter((r) => isSameDay(r.endDate, tomorrow));

  const prevAnchor = shiftAnchor(view, anchor, -1);
  const nextAnchor = shiftAnchor(view, anchor, 1);
  const todayStr = fmtQueryDate(today);

  const periodLabel =
    view === "week"
      ? `${days[0].toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} — ${days[days.length - 1].toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`
      : anchor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold">Calendrier</h1>
        <div className="flex gap-2">
          <Link href={`/calendar?view=week&date=${todayStr}`} className={`btn ${view === "week" ? "btn-primary" : "btn-secondary"}`}>
            Semaine
          </Link>
          <Link href={`/calendar?view=month&date=${todayStr}`} className={`btn ${view === "month" ? "btn-primary" : "btn-secondary"}`}>
            Mois
          </Link>
        </div>
      </div>

      {(returnsToday.length > 0 || returnsTomorrow.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {returnsToday.length > 0 && (
            <div className="card border-amber/60 bg-amber-500/10">
              <p className="font-semibold text-amber mb-1">🔁 Retours aujourd&apos;hui</p>
              {returnsToday.map((r) => (
                <p key={r.id} className="text-sm">
                  {r.vehicle.plate} — {r.clientName}
                </p>
              ))}
            </div>
          )}
          {returnsTomorrow.length > 0 && (
            <div className="card">
              <p className="font-semibold mb-1">🔁 Retours demain</p>
              {returnsTomorrow.map((r) => (
                <p key={r.id} className="text-sm">
                  {r.vehicle.plate} — {r.clientName}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {overlaps.length > 0 && (
        <div className="card border-red-500/40 bg-red-500/10 text-red-300 text-sm">
          ⚠ Double réservation détectée sur{" "}
          {[...new Set(overlaps.flatMap(([a, b]) => [a.vehicle.plate, b.vehicle.plate]))].join(", ")}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link href={`/calendar?view=${view}&date=${fmtQueryDate(prevAnchor)}`} className="btn btn-secondary">
          ← Précédent
        </Link>
        <span className="font-semibold capitalize text-sm">{periodLabel}</span>
        <Link href={`/calendar?view=${view}&date=${fmtQueryDate(nextAnchor)}`} className="btn btn-secondary">
          Suivant →
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(CHANNEL_LABELS).map(([k, label]) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CHANNEL_COLORS[k as keyof typeof CHANNEL_COLORS] }}
            />
            {label}
          </span>
        ))}
      </div>

      <div className="table-wrap card p-0">
        <table>
          <thead>
            <tr>
              <th className="sticky left-0 bg-base-panel">Véhicule</th>
              {days.map((d) => (
                <th key={d.toISOString()} className={isSameDay(d, today) ? "text-amber" : ""}>
                  {d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const vehicleReservations = reservations.filter((r) => r.vehicleId === v.id);
              return (
                <tr key={v.id}>
                  <td className="sticky left-0 bg-base-panel font-mono font-semibold">{v.plate}</td>
                  {days.map((d) => {
                    const res = vehicleReservations.find((r) => dayCoversDate(d, r.startDate, r.endDate));
                    const isOverlapCell = res && overlapIds.has(res.id);
                    return (
                      <td key={d.toISOString()} className="p-0.5">
                        {res ? (
                          <Link
                            href={`/reservations/${res.id}`}
                            title={`${res.clientName} — ${CHANNEL_LABELS[res.channel as keyof typeof CHANNEL_LABELS]}`}
                            className={`block h-8 rounded text-[10px] leading-8 text-center text-black font-semibold overflow-hidden px-1 ${
                              isOverlapCell ? "ring-2 ring-red-500" : ""
                            }`}
                            style={{ backgroundColor: CHANNEL_COLORS[res.channel as keyof typeof CHANNEL_COLORS] }}
                          >
                            {res.clientName.split(" ")[0]}
                          </Link>
                        ) : (
                          <div className="h-8 rounded bg-base-panel2/50" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={days.length + 1} className="text-zinc-500">
                  Aucun véhicule.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
