import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReservationForm from "@/components/ReservationForm";
import { updateReservation } from "@/app/actions/reservations";

export default async function EditReservationPage({ params }: { params: { id: string } }) {
  const [reservation, vehicles] = await Promise.all([
    prisma.reservation.findUnique({ where: { id: params.id } }),
    prisma.vehicle.findMany({ orderBy: { plate: "asc" } }),
  ]);
  if (!reservation) notFound();

  const action = updateReservation.bind(null, reservation.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Modifier la réservation</h1>
      <ReservationForm action={action} vehicles={vehicles} reservation={reservation} submitLabel="Enregistrer" />
    </div>
  );
}
