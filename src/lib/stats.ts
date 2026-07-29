export type StatsReservation = {
  id: string;
  vehicleId: string;
  channel: string;
  startDate: Date;
  endDate: Date;
  dailyRate: number;
  state: string;
};

function overlapDays(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): number {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  return ms / (1000 * 60 * 60 * 24);
}

export function periodRevenue(reservations: StatsReservation[], periodStart: Date, periodEnd: Date): number {
  return reservations
    .filter((r) => r.state === "ACTIVE")
    .reduce((sum, r) => sum + overlapDays(r.startDate, r.endDate, periodStart, periodEnd) * r.dailyRate, 0);
}

export function revenueByChannel(
  reservations: StatsReservation[],
  periodStart: Date,
  periodEnd: Date
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const r of reservations) {
    if (r.state !== "ACTIVE") continue;
    const days = overlapDays(r.startDate, r.endDate, periodStart, periodEnd);
    if (days <= 0) continue;
    result[r.channel] = (result[r.channel] || 0) + days * r.dailyRate;
  }
  return result;
}

export function occupancyRate(
  reservations: StatsReservation[],
  vehicleCount: number,
  windowStart: Date,
  windowEnd: Date
): number {
  if (vehicleCount === 0) return 0;
  const totalWindowDays = (windowEnd.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24);
  const rentedVehicleDays = reservations
    .filter((r) => r.state === "ACTIVE")
    .reduce((sum, r) => sum + overlapDays(r.startDate, r.endDate, windowStart, windowEnd), 0);
  const capacity = vehicleCount * totalWindowDays;
  if (capacity <= 0) return 0;
  return (rentedVehicleDays / capacity) * 100;
}
