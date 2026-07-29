import { prisma } from "@/lib/prisma";
import KeyBoxForm from "@/components/KeyBoxForm";
import { createKeyBox } from "@/app/actions/keyboxes";

export const dynamic = "force-dynamic";

export default async function NewKeyBoxPage() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Nouveau boîtier à clés</h1>
      <KeyBoxForm action={createKeyBox} vehicles={vehicles} submitLabel="Créer le boîtier" isNew />
    </div>
  );
}
