import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KeyBoxForm from "@/components/KeyBoxForm";
import { updateKeyBox } from "@/app/actions/keyboxes";

export default async function EditKeyBoxPage({ params }: { params: { id: string } }) {
  const [keyBox, vehicles] = await Promise.all([
    prisma.keyBox.findUnique({ where: { id: params.id } }),
    prisma.vehicle.findMany({ orderBy: { plate: "asc" } }),
  ]);
  if (!keyBox) notFound();

  const action = updateKeyBox.bind(null, keyBox.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Modifier {keyBox.name}</h1>
      <KeyBoxForm action={action} vehicles={vehicles} keyBox={keyBox} submitLabel="Enregistrer" />
    </div>
  );
}
