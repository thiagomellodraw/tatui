import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import DetailGalleryClient from "@/components/DetailGalleryClient";
import BookingCardClient from "@/components/BookingCardClient";
import PropertyCard from "@/components/PropertyCard";
import { MapPin, Users, BedDouble, Bath, Maximize2, Home } from "lucide-react";
import * as LucideIcons from "lucide-react";

export const dynamic = "force-dynamic";

interface PropertyPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const resolvedParams = await params;
  const property = await db.property.findUnique({ where: { slug: resolvedParams.slug } });
  if (!property) return { title: "Imóvel não encontrado | Tatuí" };
  return { title: `${property.title} | Tatuí`, description: property.shortDescription };
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value || "pt") as "pt" | "en" | "es";

  const property = await db.property.findUnique({
    where: { slug: resolvedParams.slug },
    include: { images: { orderBy: { order: "asc" } }, amenities: true },
  });

  if (!property) notFound();

  const recommended = await db.property.findMany({
    where: { active: true, city: property.city, id: { not: property.id } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const title = lang === "en" && property.titleEn ? property.titleEn : lang === "es" && property.titleEs ? property.titleEs : property.title;
  const description = lang === "en" && property.fullDescriptionEn ? property.fullDescriptionEn : lang === "es" && property.fullDescriptionEs ? property.fullDescriptionEs : property.fullDescription;
  const location = lang === "en" && property.locationEn ? property.locationEn : lang === "es" && property.locationEs ? property.locationEs : property.location;

  const allImages = [property.coverImage, ...property.images.map((i) => i.url)].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
      {/* Galeria */}
      <DetailGalleryClient images={allImages} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Info Principal */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-luxury-cream text-luxury-bronze text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-luxury-bronze/20">
                {property.propertyType}
              </span>
              {property.featured && (
                <span className="px-3 py-1 bg-luxury-charcoal text-luxury-gold text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                  {lang === "en" ? "Featured" : lang === "es" ? "Destacado" : "Destaque"}
                </span>
              )}
            </div>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 leading-tight mb-2">{title}</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin size={14} className="text-luxury-bronze" />
              <span>{location}</span>
            </div>
          </div>

          {/* Capacidades */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Users, label: lang === "en" ? "Guests" : lang === "es" ? "Huéspedes" : "Hóspedes", value: property.guests },
              { icon: BedDouble, label: lang === "en" ? "Bedrooms" : lang === "es" ? "Dormitorios" : "Quartos", value: property.bedrooms },
              { icon: Bath, label: lang === "en" ? "Bathrooms" : lang === "es" ? "Baños" : "Banheiros", value: property.bathrooms },
              ...(property.area ? [{ icon: Maximize2, label: "m²", value: property.area }] : []),
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
                  <Icon size={20} className="text-luxury-bronze mx-auto mb-2" />
                  <p className="font-display font-bold text-xl text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">{item.label}</p>
                </div>
              );
            })}
          </div>

          {/* Descrição */}
          <div>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-4">
              {lang === "en" ? "About this property" : lang === "es" ? "Sobre esta propiedad" : "Sobre este imóvel"}
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{description}</p>
          </div>

          {/* Comodidades */}
          {property.amenities.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-4">
                {lang === "en" ? "Amenities" : lang === "es" ? "Servicios" : "Comodidades"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => {
                  const amenityName = lang === "en" && amenity.nameEn ? amenity.nameEn : lang === "es" && amenity.nameEs ? amenity.nameEs : amenity.name;
                  const IconComponent = (LucideIcons as any)[amenity.icon.charAt(0).toUpperCase() + amenity.icon.slice(1)] || Home;
                  return (
                    <div key={amenity.id} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
                      <IconComponent size={15} className="text-luxury-bronze shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">{amenityName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Card de Reserva */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <BookingCardClient
              propertyId={property.id}
              title={property.title}
              externalBookingUrl={property.externalBookingUrl}
              whatsappUrl={property.whatsappUrl}
              priceFrom={property.priceFrom}
            />
          </div>
        </div>
      </div>

      {/* Imóveis Recomendados */}
      {recommended.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-8">
            {lang === "en" ? "Similar Properties" : lang === "es" ? "Propiedades Similares" : "Imóveis Similares"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommended.map((prop, idx) => (
              <PropertyCard key={prop.id} property={prop} index={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
