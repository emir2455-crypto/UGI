import { prisma } from "@/lib/prisma";
import ReservationForm from "@/components/ReservationForm";
import { createReservation } from "@/app/actions/reservations";

export const dynamic = "force-dynamic";

export default async function NewReservationPage() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Nouvelle réservation</h1>
      {vehicles.length === 0 ? (
        <p className="text-zinc-500 text-sm">Ajoutez d&apos;abord un véhicule avant de créer une réservation.</p>
      ) : (
        <ReservationForm action={createReservation} vehicles={vehicles} submitLabel="Créer la réservation" />
      )}
    </div>
  );
}
