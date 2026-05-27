import { db } from "@/lib/db";
import AmenitiesManagerClient from "@/components/admin/AmenitiesManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminAmenitiesPage() {
  const amenities = await db.amenity.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900">
          Comodidades
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie as comodidades disponíveis para associar aos imóveis cadastrados.
        </p>
      </div>
      <AmenitiesManagerClient initialAmenities={amenities} />
    </div>
  );
}
