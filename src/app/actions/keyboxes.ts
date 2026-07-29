"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";

function parseKeyBoxForm(formData: FormData) {
  const vehicleId = String(formData.get("vehicleId") || "");
  return {
    name: String(formData.get("name") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    vehicleId: vehicleId || null,
    notes: String(formData.get("notes") || "").trim() || null,
  };
}

export async function createKeyBox(formData: FormData) {
  await requireAdmin();
  const data = parseKeyBoxForm(formData);
  const initialCode = String(formData.get("initialCode") || "0000").trim();
  const keyBox = await prisma.keyBox.create({
    data: { ...data, currentCode: initialCode, codeChangedAt: new Date() },
  });
  revalidatePath("/keyboxes");
  redirect(`/keyboxes/${keyBox.id}`);
}

export async function updateKeyBox(keyBoxId: string, formData: FormData) {
  await requireAdmin();
  const data = parseKeyBoxForm(formData);
  await prisma.keyBox.update({ where: { id: keyBoxId }, data });
  revalidatePath("/keyboxes");
  revalidatePath(`/keyboxes/${keyBoxId}`);
  redirect(`/keyboxes/${keyBoxId}`);
}

export async function deleteKeyBox(keyBoxId: string) {
  await requireAdmin();
  await prisma.keyBox.delete({ where: { id: keyBoxId } });
  revalidatePath("/keyboxes");
  redirect("/keyboxes");
}

// Available to both roles: changing the code is an operational task done at handover time.
export async function changeKeyBoxCode(keyBoxId: string, formData: FormData) {
  await requireUser();
  const newCode = String(formData.get("newCode") || "").trim();
  if (!newCode) throw new Error("Code requis");
  const reservationId = String(formData.get("reservationId") || "") || null;

  const keyBox = await prisma.keyBox.findUnique({ where: { id: keyBoxId } });
  if (!keyBox) throw new Error("Boîtier introuvable");

  await prisma.$transaction([
    prisma.keyBoxCodeHistory.create({
      data: {
        keyBoxId,
        oldCode: keyBox.currentCode,
        newCode,
        reservationId,
      },
    }),
    prisma.keyBox.update({
      where: { id: keyBoxId },
      data: { currentCode: newCode, codeChangedAt: new Date() },
    }),
  ]);

  revalidatePath("/keyboxes");
  revalidatePath(`/keyboxes/${keyBoxId}`);
}
