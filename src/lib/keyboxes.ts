export type KeyBoxLike = { codeChangedAt: Date };
export type ReservationLike = { vehicleId: string; endDate: Date; state: string };

export function lastEndedReservation<T extends ReservationLike>(
  reservations: T[],
  vehicleId: string,
  now = new Date()
): T | null {
  const ended = reservations
    .filter((r) => r.vehicleId === vehicleId && r.state === "ACTIVE" && r.endDate < now)
    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
  return ended[0] || null;
}

export function isCodeStale(keyBox: KeyBoxLike, lastEnded: ReservationLike | null): boolean {
  if (!lastEnded) return false;
  return lastEnded.endDate > keyBox.codeChangedAt;
}
