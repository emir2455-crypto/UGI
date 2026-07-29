"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export async function createExpense(formData: FormData) {
  await requireAdmin();
  const category = String(formData.get("category"));
  if (!EXPENSE_CATEGORIES.includes(category as any)) throw new Error("Catégorie invalide");

  await prisma.expense.create({
    data: {
      vehicleId: String(formData.get("vehicleId")),
      category,
      date: new Date(String(formData.get("date"))),
      amount: parseFloat(String(formData.get("amount") || "0")),
      description: String(formData.get("description") || "").trim() || null,
    },
  });
  revalidatePath("/finances");
}

export async function deleteExpense(expenseId: string) {
  await requireAdmin();
  await prisma.expense.delete({ where: { id: expenseId } });
  revalidatePath("/finances");
}
