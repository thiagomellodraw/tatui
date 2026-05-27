import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";

export const dynamic = "force-dynamic";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;

  // Buscar imóvel por ID com imagens e comodidades vinculadas
  const property = await db.property.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
      amenities: true,
    },
  });

  if (!property) {
    notFound();
  }

  // Buscar todas as comodidades ativas do banco
  const amenities = await db.amenity.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="py-6">
      <PropertyForm initialData={property} availableAmenities={amenities} />
    </div>
  );
}
