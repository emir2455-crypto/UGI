import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { toCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const expenses = await prisma.expense.findMany({
    include: { vehicle: true },
    orderBy: { date: "desc" },
  });

  const rows = expenses.map((e) => [
    e.vehicle.plate,
    EXPENSE_CATEGORY_LABELS[e.category as keyof typeof EXPENSE_CATEGORY_LABELS] || e.category,
    formatDate(e.date),
    e.amount.toFixed(2),
    e.description || "",
  ]);

  const csv = toCsv(["Véhicule", "Catégorie", "Date", "Montant", "Description"], rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="depenses.csv"`,
    },
  });
}
