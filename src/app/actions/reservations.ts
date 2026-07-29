"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { CHANNELS, DEPOSIT_METHODS } from "@/lib/constants";

function parseReservationForm(formData: FormData) {
  const channel = String(formData.get("channel"));
  const depositMethod = String(formData.get("depositMethod"));
  if (!CHANNELS.includes(channel as any)) throw new Error("Canal invalide");
  if (!DEPOSIT_METHODS.includes(depositMethod as any)) throw new Error("Mode de paiement invalide");

  const startMileageRaw = formData.get("startMileage");
  const endMileageRaw = formData.get("endMileage");

  return {
    vehicleId: String(formData.get("vehicleId")),
    clientName: String(formData.get("clientName") || "").trim(),
    clientPhone: String(formData.get("clientPhone") || "").trim(),
    channel,
    startDate: new Date(String(formData.get("startDate"))),
    endDate: new Date(String(formData.get("endDate"))),
    dailyRate: parseFloat(String(formData.get("dailyRate") || "0")),
    deposit: parseFloat(String(formData.get("deposit") || "0")),
    depositMethod,
    notes: String(formData.get("notes") || "").trim() || null,
    startMileage: startMileageRaw ? parseInt(String(startMileageRaw), 10) : null,
    endMileage: endMileageRaw ? parseInt(String(endMileageRaw), 10) : null,
  };
}

export async function createReservation(formData: FormData) {
  await requireAdmin();
  const data = parseReservationForm(formData);
  if (data.endDate <= data.startDate) throw new Error("La date de fin doit être après la date de début");
  const reservation = await prisma.reservation.create({ data });
  revalidatePath("/reservations");
  revalidatePath("/calendar");
  revalidatePath("/");
  redirect(`/reservations/${reservation.id}`);
}

export async function updateReservation(reservationId: string, formData: FormData) {
  await requireAdmin();
  const data = parseReservationForm(formData);
  if (data.endDate <= data.startDate) throw new Error("La date de fin doit être après la date de début");
  await prisma.reservation.update({ where: { id: reservationId }, data });
  revalidatePath("/reservations");
  revalidatePath(`/reservations/${reservationId}`);
  revalidatePath("/calendar");
  revalidatePath("/");
  redirect(`/reservations/${reservationId}`);
}

export async function cancelReservation(reservationId: string, formData: FormData) {
  await requireAdmin();
  const reason = String(formData.get("cancelReason") || "").trim();
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { state: "ANNULEE", cancelReason: reason || null },
  });
  revalidatePath("/reservations");
  revalidatePath(`/reservations/${reservationId}`);
  revalidatePath("/calendar");
  revalidatePath("/");
  redirect(`/reservations/${reservationId}`);
}

export async function deleteReservation(reservationId: string) {
  await requireAdmin();
  await prisma.reservation.delete({ where: { id: reservationId } });
  revalidatePath("/reservations");
  revalidatePath("/calendar");
  revalidatePath("/");
  redirect("/reservations");
}

// Available to both roles: the helper marks the handover/return as done,
// recording return mileage and notes, and frees up the vehicle.
export async function completeHandover(reservationId: string, formData: FormData) {
  const user = await requireUser();
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw new Error("Introuvable");

  const endMileageRaw = formData.get("endMileage");
  const extraNotes = String(formData.get("handoverNotes") || "").trim();

  const mergedNotes = [reservation.notes, extraNotes ? `[Retour] ${extraNotes}` : null]
    .filter(Boolean)
    .join("\n");

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservationId },
      data: {
        endMileage: endMileageRaw ? parseInt(String(endMileageRaw), 10) : reservation.endMileage,
        notes: mergedNotes || null,
        doneByHelper: user.role === "HELPER" ? true : reservation.doneByHelper,
      },
    }),
    prisma.vehicle.update({
      where: { id: reservation.vehicleId },
      data: { status: "DISPONIBLE", ...(endMileageRaw ? { mileage: parseInt(String(endMileageRaw), 10) } : {}) },
    }),
  ]);

  revalidatePath("/reservations");
  revalidatePath(`/reservations/${reservationId}`);
  revalidatePath("/vehicles");
  revalidatePath("/calendar");
  revalidatePath("/");
}
