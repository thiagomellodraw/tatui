import { db } from "@/lib/db";
import { cookies } from "next/headers";
import PropertyListPublicClient from "@/components/PropertyListPublicClient";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "Imóveis de Temporada | Tatuí" };
}

export default async function ImoveisPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value || "pt") as "pt" | "en" | "es";

  const properties = await db.property.findMany({
    where: { active: true },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      amenities: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const cities = await db.property
    .findMany({ where: { active: true }, select: { city: true }, distinct: ["city"] })
    .then((r) => r.map((c) => c.city));

  const amenities = await db.amenity.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="text-xs font-extrabold tracking-widest text-luxury-bronze uppercase block mb-2">
          {lang === "en" ? "Our Portfolio" : lang === "es" ? "Nuestro Portfolio" : "Nosso Portfólio"}
        </span>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 leading-tight">
          {lang === "en" ? "Vacation Properties" : lang === "es" ? "Propiedades de Temporada" : "Imóveis de Temporada"}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          {lang === "en"
            ? "Explore our curated selection of exclusive retreats. Filter by city, guests or amenities to find your perfect accommodation."
            : lang === "es"
            ? "Explore nuestra selección curada de refugios exclusivos. Filtre por ciudad, huéspedes o servicios para encontrar su alojamiento perfecto."
            : "Explore nossa curadoria de refúgios exclusivos. Filtre por comodidades, localização ou capacidade para encontrar sua hospedagem perfeita."}
        </p>
      </div>
      <PropertyListPublicClient
        initialProperties={properties}
        cities={cities}
        availableAmenities={amenities}
      />
    </div>
  );
}
