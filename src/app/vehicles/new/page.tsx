import VehicleForm from "@/components/VehicleForm";
import { createVehicle } from "@/app/actions/vehicles";

export default function NewVehiclePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Nouveau véhicule</h1>
      <VehicleForm action={createVehicle} submitLabel="Créer le véhicule" />
    </div>
  );
}
