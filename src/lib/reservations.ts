import type { ComputedReservationStatus } from "@/lib/constants";

export type ReservationLike = {
  startDate: Date;
  endDate: Date;
  state: string;
};

export function computeReservationStatus(r: ReservationLike, now = new Date()): ComputedReservationStatus {
  if (r.state === "ANNULEE") return "ANNULEE";
  if (now < r.startDate) return "A_VENIR";
  if (now > r.endDate) return "TERMINEE";
  return "EN_COURS";
}

export function reservationDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

export function reservationTotal(start: Date, end: Date, dailyRate: number): number {
  return reservationDays(start, end) * dailyRate;
}

export function reservationsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function findOverlaps<T extends { id: string; startDate: Date; endDate: Date; vehicleId: string; state: string }>(
  reservations: T[]
): Array<[T, T]> {
  const pairs: Array<[T, T]> = [];
  const active = reservations.filter((r) => r.state !== "ANNULEE");
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      if (a.vehicleId !== b.vehicleId) continue;
      if (reservationsOverlap(a.startDate, a.endDate, b.startDate, b.endDate)) {
        pairs.push([a, b]);
      }
    }
  }
  return pairs;
}
