import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CHANNEL_LABELS, DEPOSIT_METHOD_LABELS } from "@/lib/constants";
import { toCsv } from "@/lib/csv";
import { reservationDays, reservationTotal } from "@/lib/reservations";
import { formatDate } from "@/lib/format";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const reservations = await prisma.reservation.findMany({
    include: { vehicle: true },
    orderBy: { startDate: "desc" },
  });

  const rows = reservations.map((r) => [
    r.vehicle.plate,
    r.clientName,
    r.clientPhone,
    CHANNEL_LABELS[r.channel as keyof typeof CHANNEL_LABELS] || r.channel,
    formatDate(r.startDate),
    formatDate(r.endDate),
    reservationDays(r.startDate, r.endDate),
    r.dailyRate.toFixed(2),
    reservationTotal(r.startDate, r.endDate, r.dailyRate).toFixed(2),
    r.deposit.toFixed(2),
    DEPOSIT_METHOD_LABELS[r.depositMethod as keyof typeof DEPOSIT_METHOD_LABELS] || r.depositMethod,
    r.state === "ANNULEE" ? "Annulée" : "Active",
    r.cancelReason || "",
    r.startMileage ?? "",
    r.endMileage ?? "",
    (r.notes || "").replace(/\n/g, " | "),
  ]);

  const csv = toCsv(
    [
      "Véhicule",
      "Client",
      "Téléphone",
      "Canal",
      "Début",
      "Fin",
      "Jours",
      "Tarif journalier",
      "Total",
      "Caution",
      "Mode paiement caution",
      "Statut",
      "Motif annulation",
      "Km départ",
      "Km retour",
      "Notes",
    ],
    rows
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reservations.csv"`,
    },
  });
}
