import { db } from "@/lib/db";
import PropertyForm from "@/components/admin/PropertyForm";

export const dynamic = "force-dynamic";

export default async function AdminNewPropertyPage() {
  // Buscar todas as comodidades ativas do banco
  const amenities = await db.amenity.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="py-6">
      <PropertyForm availableAmenities={amenities} />
    </div>
  );
}
