import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VehicleForm from "@/components/VehicleForm";
import { updateVehicle } from "@/app/actions/vehicles";

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!vehicle) notFound();

  const action = updateVehicle.bind(null, vehicle.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Modifier {vehicle.plate}</h1>
      <VehicleForm action={action} vehicle={vehicle} submitLabel="Enregistrer" />
    </div>
  );
}
