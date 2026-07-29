"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { VEHICLE_STATUSES, VEHICLE_TYPES } from "@/lib/constants";

function parseVehicleForm(formData: FormData) {
  const type = String(formData.get("type"));
  const status = String(formData.get("status"));
  if (!VEHICLE_TYPES.includes(type as any)) throw new Error("Type invalide");
  if (!VEHICLE_STATUSES.includes(status as any)) throw new Error("Statut invalide");

  const nextTechnicalCtrl = formData.get("nextTechnicalCtrl");
  const nextMaintenance = formData.get("nextMaintenance");

  return {
    plate: String(formData.get("plate") || "").trim().toUpperCase(),
    brand: String(formData.get("brand") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    type,
    year: parseInt(String(formData.get("year") || "0"), 10),
    status,
    mileage: parseInt(String(formData.get("mileage") || "0"), 10),
    nextTechnicalCtrl: nextTechnicalCtrl ? new Date(String(nextTechnicalCtrl)) : null,
    nextMaintenance: nextMaintenance ? new Date(String(nextMaintenance)) : null,
    keysLocation: String(formData.get("keysLocation") || "").trim() || null,
  };
}

export async function createVehicle(formData: FormData) {
  await requireAdmin();
  const data = parseVehicleForm(formData);
  const vehicle = await prisma.vehicle.create({ data });
  revalidatePath("/vehicles");
  redirect(`/vehicles/${vehicle.id}`);
}

export async function updateVehicle(vehicleId: string, formData: FormData) {
  await requireAdmin();
  const data = parseVehicleForm(formData);
  await prisma.vehicle.update({ where: { id: vehicleId }, data });
  revalidatePath("/vehicles");
  revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}`);
}

export async function deleteVehicle(vehicleId: string) {
  await requireAdmin();
  await prisma.vehicle.delete({ where: { id: vehicleId } });
  revalidatePath("/vehicles");
  redirect("/vehicles");
}

export async function addIncident(vehicleId: string, formData: FormData) {
  await requireAdmin();
  await prisma.incident.create({
    data: {
      vehicleId,
      date: new Date(String(formData.get("date"))),
      description: String(formData.get("description") || "").trim(),
      cost: parseFloat(String(formData.get("cost") || "0")),
    },
  });
  revalidatePath(`/vehicles/${vehicleId}`);
}

export async function deleteIncident(vehicleId: string, incidentId: string) {
  await requireAdmin();
  await prisma.incident.delete({ where: { id: incidentId } });
  revalidatePath(`/vehicles/${vehicleId}`);
}

export async function addMaintenance(vehicleId: string, formData: FormData) {
  await requireAdmin();
  await prisma.maintenance.create({
    data: {
      vehicleId,
      date: new Date(String(formData.get("date"))),
      type: String(formData.get("type") || "").trim(),
      cost: parseFloat(String(formData.get("cost") || "0")),
    },
  });
  revalidatePath(`/vehicles/${vehicleId}`);
}

export async function deleteMaintenance(vehicleId: string, maintenanceId: string) {
  await requireAdmin();
  await prisma.maintenance.delete({ where: { id: maintenanceId } });
  revalidatePath(`/vehicles/${vehicleId}`);
}

export async function quickUpdateStatus(vehicleId: string, status: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  if (!VEHICLE_STATUSES.includes(status as any)) throw new Error("Statut invalide");
  await prisma.vehicle.update({ where: { id: vehicleId }, data: { status } });
  revalidatePath("/vehicles");
  revalidatePath(`/vehicles/${vehicleId}`);
}
