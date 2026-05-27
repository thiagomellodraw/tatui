"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Users, Bed, Bath, Maximize2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    titleEn?: string | null;
    titleEs?: string | null;
    slug: string;
    shortDescription: string;
    shortDescriptionEn?: string | null;
    shortDescriptionEs?: string | null;
    location: string;
    locationEn?: string | null;
    locationEs?: string | null;
    city: string;
    neighborhood: string;
    state: string;
    propertyType: string;
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    area?: number | null;
    priceFrom?: number | null;
    coverImage: string;
    featured: boolean;
  };
  index?: number;
}

const translatePropertyType = (type: string, lang: 'pt' | 'en' | 'es'): string => {
  const mapping: Record<string, Record<'pt' | 'en' | 'es', string>> = {
    'Casa': { pt: 'Casa', en: 'House', es: 'Casa' },
    'Apartamento': { pt: 'Apartamento', en: 'Apartment', es: 'Apartamento' },
    'Chalé': { pt: 'Chalé', en: 'Chalet', es: 'Chalet' },
    'Villa': { pt: 'Villa', en: 'Villa', es: 'Villa' },
    'Cobertura': { pt: 'Cobertura', en: 'Penthouse', es: 'Penthouse' },
    'Loft': { pt: 'Loft', en: 'Loft', es: 'Loft' }
  };
  
  const norm = type.trim();
  if (norm in mapping) {
    return mapping[norm][lang];
  }
  return type;
};

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { language, t } = useLanguage();

  // Carregar estado de favorito do localStorage
  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem("luxe_favorites") || "[]");
      setIsFavorite(favorites.includes(property.id));
    } catch (e) {
      console.error(e);
    }
  }, [property.id]);

  // Alternar favorito
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favorites = JSON.parse(localStorage.getItem("luxe_favorites") || "[]");
      let updatedFavorites = [];
      if (isFavorite) {
        updatedFavorites = favorites.filter((id: string) => id !== property.id);
        setIsFavorite(false);
      } else {
        updatedFavorites = [...favorites, property.id];
        setIsFavorite(true);
      }
      localStorage.setItem("luxe_favorites", JSON.stringify(updatedFavorites));
      // Disparar evento para atualizar outros componentes escutando
      window.dispatchEvent(new Event("favorites_updated"));
    } catch (e) {
      console.error(e);
    }
  };

  const displayTitle = language === 'en' && property.titleEn ? property.titleEn : (language === 'es' && property.titleEs ? property.titleEs : property.title);
  const displayShortDescription = language === 'en' && property.shortDescriptionEn ? property.shortDescriptionEn : (language === 'es' && property.shortDescriptionEs ? property.shortDescriptionEs : property.shortDescription);
  const displayPropertyType = translatePropertyType(property.propertyType, language);

  const formattedPrice = property.priceFrom
    ? new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(property.priceFrom)
    : null;

  const guestsLabel = property.guests === 1 ? t("property.guests") : t("property.guestsPlural");
  const bedroomsLabel = property.bedrooms === 1 ? t("property.bedrooms") : t("property.bedroomsPlural");
  const bathroomsLabel = property.bathrooms === 1 ? t("property.bathrooms") : t("property.bathroomsPlural");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-500 h-full"
    >
      {/* Imagem Cover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Image
          src={property.coverImage}
          alt={displayTitle}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority={index < 3}
          unoptimized // Para garantir que links externos do unsplash carreguem sem bloqueios de hostname do next.js
        />
        
        {/* Camada Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Badges Absolute */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {property.featured && (
            <span className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-luxury-gold text-white rounded-full shadow-sm backdrop-blur-md">
              {language === 'en' ? 'Featured' : language === 'es' ? 'Destacado' : 'Destaque'}
            </span>
          )}
          <span className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-luxury-charcoal rounded-full shadow-sm backdrop-blur-sm">
            {displayPropertyType}
          </span>
        </div>

        {/* Botão Favoritar */}
        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-800 hover:text-red-500 shadow-md backdrop-blur-sm transition-all duration-300 transform active:scale-90"
          aria-label={isFavorite ? t("property.favorited") : t("property.addToFavorites")}
        >
          <Heart
            size={18}
            className={`transition-colors duration-300 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-800"
            }`}
          />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-grow p-6">
        {/* Localização */}
        <p className="text-xs font-semibold tracking-wider uppercase text-luxury-bronze">
          {property.neighborhood}, {property.city} - {property.state}
        </p>

        {/* Título */}
        <h3 className="font-display font-bold text-lg text-gray-900 mt-2 mb-2 line-clamp-1 group-hover:text-luxury-bronze transition-colors">
          {displayTitle}
        </h3>

        {/* Descrição Curta */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">
          {displayShortDescription}
        </p>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gray-100 mb-5 mt-auto" />

        {/* Ficha Técnica Rápida */}
        <div className="grid grid-cols-4 gap-2 text-gray-500 text-xs mb-6">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50/50">
            <Users size={14} className="text-gray-400 mb-1" />
            <span className="font-semibold text-gray-700">{property.guests}</span>
            <span className="text-[9px] text-gray-400">{guestsLabel.toLowerCase()}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50/50">
            <Bed size={14} className="text-gray-400 mb-1" />
            <span className="font-semibold text-gray-700">{property.bedrooms}</span>
            <span className="text-[9px] text-gray-400">{bedroomsLabel.toLowerCase()}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50/50">
            <Bath size={14} className="text-gray-400 mb-1" />
            <span className="font-semibold text-gray-700">{property.bathrooms}</span>
            <span className="text-[9px] text-gray-400">{bathroomsLabel.toLowerCase()}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50/50">
            <Maximize2 size={14} className="text-gray-400 mb-1" />
            <span className="font-semibold text-gray-700">
              {property.area ? `${property.area}m²` : "--"}
            </span>
            <span className="text-[9px] text-gray-400">{t("property.area")}</span>
          </div>
        </div>

        {/* Preço e Ação */}
        <div className="flex items-center justify-between mt-auto pt-2">
          {formattedPrice ? (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                {t("property.priceFrom")}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formattedPrice}
                <span className="text-xs font-normal text-gray-500"> {t("property.perNight")}</span>
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-luxury-bronze">
              {language === 'en' ? 'On request' : language === 'es' ? 'Bajo consulta' : 'Sob consulta'}
            </span>
          )}

          <Link
            href={`/imoveis/${property.slug}`}
            className="px-5 py-2.5 bg-gray-50 hover:bg-luxury-charcoal text-gray-800 hover:text-white rounded-xl text-xs font-bold tracking-wide transition-all duration-300"
          >
            {t("property.viewDetails")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
