'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "./PropertyCard";
import {
  SlidersHorizontal,
  X,
  Users,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Eye,
  ArrowRight,
  Info,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface PropertyListPublicClientProps {
  initialProperties: any[];
  cities: string[];
  availableAmenities: any[];
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

const getAmenityName = (am: { name: string; nameEn?: string | null; nameEs?: string | null }, lang: string) => {
  if (lang === 'en' && am.nameEn) return am.nameEn;
  if (lang === 'es' && am.nameEs) return am.nameEs;
  return am.name;
};

function PropertyListContent({
  initialProperties,
  cities,
  availableAmenities,
}: PropertyListPublicClientProps) {
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  
  // Estados de filtros
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "");
  const [propertyType, setPropertyType] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured"); // featured, price_asc, price_desc, recent

  // Estado Mobile Drawer Filtros
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Estado de Favoritos local
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Tipos de imóveis únicos
  const propertyTypes = Array.from(
    new Set(initialProperties.map((p) => p.propertyType))
  );

  // Escutar favoritos
  const loadFavorites = () => {
    try {
      const savedIds = JSON.parse(localStorage.getItem("luxe_favorites") || "[]");
      const matched = initialProperties.filter((p) => savedIds.includes(p.id));
      setFavoritesList(matched);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFavorites();
    // Escutar evento global de favoritos atualizados
    window.addEventListener("favorites_updated", loadFavorites);
    return () => window.removeEventListener("favorites_updated", loadFavorites);
  }, [initialProperties]);

  // Aplicar filtros
  const filteredProperties = initialProperties.filter((prop) => {
    if (selectedCity && prop.city !== selectedCity) return false;
    
    if (guests && prop.guests < parseInt(guests)) return false;
    
    if (propertyType && prop.propertyType !== propertyType) return false;
    
    if (maxPrice !== "" && prop.priceFrom && prop.priceFrom > maxPrice) return false;
    
    if (selectedAmenities.length > 0) {
      const propAmenityIds = prop.amenities.map((a: any) => a.id);
      const hasAll = selectedAmenities.every((id) => propAmenityIds.includes(id));
      if (!hasAll) return false;
    }

    return true;
  });

  // Ordenação
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === "featured") {
      // Destacados primeiro, depois mais recentes
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "price_asc") {
      return (a.priceFrom || 0) - (b.priceFrom || 0);
    }
    if (sortBy === "price_desc") {
      return (b.priceFrom || 0) - (a.priceFrom || 0);
    }
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  // Alternar comodidade selecionada
  const toggleAmenityFilter = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setSelectedCity("");
    setGuests("");
    setPropertyType("");
    setMaxPrice("");
    setSelectedAmenities([]);
    setSortBy("featured");
  };

  // Formatar preço
  const formatPrice = (price: number | null) => {
    if (!price) return language === 'en' ? 'On request' : language === 'es' ? 'Bajo consulta' : 'Sob consulta';
    return new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const removeFavorite = (id: string) => {
    try {
      const savedIds = JSON.parse(localStorage.getItem("luxe_favorites") || "[]");
      const updated = savedIds.filter((favId: string) => favId !== id);
      localStorage.setItem("luxe_favorites", JSON.stringify(updated));
      loadFavorites();
      // Notificar outros cards na página
      window.dispatchEvent(new Event("favorites_updated"));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* FILTROS LATERAL (DESKTOP) */}
        <aside className="hidden lg:block w-72 shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-8 sticky top-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-display font-extrabold text-base text-gray-900 flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-luxury-bronze" />
              {t("filters.title")}
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-gray-400 hover:text-luxury-bronze transition-colors cursor-pointer"
            >
              {t("filters.clear")}
            </button>
          </div>

          {/* Cidade */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("filters.city")}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-semibold text-slate-700"
            >
              <option value="">
                {language === 'en' ? 'All Cities' : language === 'es' ? 'Todas las Ciudades' : 'Todas as Cidades'}
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Hóspedes */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("filters.guests")}
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-semibold text-slate-700"
            >
              <option value="">
                {language === 'en' ? 'Any capacity' : language === 'es' ? 'Cualquier capacidad' : 'Qualquer capacidade'}
              </option>
              {[2, 4, 6, 8, 10, 12].map((num) => (
                <option key={num} value={num}>
                  {num}+ {language === 'en' ? 'Guests' : language === 'es' ? 'Huéspedes' : 'Hóspedes'}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Imóvel */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("filters.propertyType")}
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-semibold text-slate-700"
            >
              <option value="">
                {language === 'en' ? 'All Types' : language === 'es' ? 'Todos los Tipos' : 'Todos os Tipos'}
              </option>
              {propertyTypes.map((type: any) => (
                <option key={type} value={type}>
                  {translatePropertyType(type, language)}
                </option>
              ))}
            </select>
          </div>

          {/* Preço Máximo */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("filters.maxPrice")}
            </label>
            <input
              type="number"
              placeholder="Ex: 2000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-medium text-slate-800"
            />
          </div>

          {/* Comodidades */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {t("filters.amenities")}
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableAmenities.map((am) => (
                <label
                  key={am.id}
                  className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(am.id)}
                    onChange={() => toggleAmenityFilter(am.id)}
                    className="w-4 h-4 accent-luxury-gold rounded cursor-pointer"
                  />
                  <span>{getAmenityName(am, language)}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* LISTAGEM DE RESULTADOS */}
        <div className="flex-1 w-full space-y-6">
          {/* Barra de Ordenação e Filtro Mobile */}
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
            {/* Contagem */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1 
                ? (language === 'en' ? "Property available" : language === 'es' ? "Propiedad disponible" : "Imóvel disponível")
                : (language === 'en' ? "Properties available" : language === 'es' ? "Propiedades disponibles" : "Imóveis disponíveis")}
            </p>

            <div className="flex items-center gap-3 shrink-0">
              {/* Botão Filtro Mobile */}
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-800 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                {t("filters.title")}
              </button>

              {/* Ordenação */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-xs outline-none font-bold text-slate-650 cursor-pointer"
              >
                <option value="featured">
                  {language === 'en' ? 'Sort: Featured' : language === 'es' ? 'Ordenar: Destacados' : 'Ordenar: Destaques'}
                </option>
                <option value="price_asc">
                  {language === 'en' ? 'Lowest Price' : language === 'es' ? 'Menor Precio' : 'Menor Preço'}
                </option>
                <option value="price_desc">
                  {language === 'en' ? 'Highest Price' : language === 'es' ? 'Mayor Precio' : 'Maior Preço'}
                </option>
                <option value="recent">
                  {language === 'en' ? 'Most Recent' : language === 'es' ? 'Más Recientes' : 'Mais Recentes'}
                </option>
              </select>
            </div>
          </div>

          {/* Grid de Cards */}
          {sortedProperties.length === 0 ? (
            <div className="bg-white p-16 rounded-3xl border border-gray-100 shadow-sm text-center text-gray-400">
              <Info size={40} className="mx-auto mb-4 opacity-40 text-luxury-bronze" />
              <h3 className="font-display font-bold text-lg text-gray-800">
                {language === 'en' ? 'No properties match criteria' : language === 'es' ? 'Ninguna propiedad coincide con los criterios' : 'Nenhum imóvel corresponde aos critérios'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {language === 'en' ? 'Try removing or resetting your active filters to see more options.' : language === 'es' ? 'Intente eliminar o reajustar sus filtros para ver más opciones.' : 'Tente remover ou reajustar seus filtros e comodidades exigidas para ver mais opções.'}
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 px-6 py-2.5 bg-luxury-charcoal hover:bg-luxury-bronze text-white text-xs font-bold rounded-full transition-colors uppercase tracking-wider"
              >
                {t("filters.clear")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {sortedProperties.map((prop, idx) => (
                <PropertyCard key={prop.id} property={prop} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FILTROS MOBILE (BOTTOM SHEET DRAWER) */}
      {isFilterDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          {/* Drawer Body */}
          <div className="relative bg-white rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto p-6 z-10 space-y-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-extrabold text-lg text-slate-900">
                {language === 'en' ? 'Filter Properties' : language === 'es' ? 'Filtrar Propiedades' : 'Filtrar Imóveis'}
              </h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filtros em Grid */}
            <div className="space-y-6">
              {/* Cidade */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t("filters.city")}
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-semibold text-slate-700"
                >
                  <option value="">
                    {language === 'en' ? 'All Cities' : language === 'es' ? 'Todas las Ciudades' : 'Todas as Cidades'}
                  </option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hóspedes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t("filters.guests")}
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-semibold text-slate-700"
                >
                  <option value="">
                    {language === 'en' ? 'Any capacity' : language === 'es' ? 'Cualquier capacidad' : 'Qualquer capacidade'}
                  </option>
                  {[2, 4, 6, 8, 10, 12].map((num) => (
                    <option key={num} value={num}>
                      {num}+ {language === 'en' ? 'Guests' : language === 'es' ? 'Huéspedes' : 'Hóspedes'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Imóvel */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t("filters.propertyType")}
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-semibold text-slate-700"
                >
                  <option value="">
                    {language === 'en' ? 'All Types' : language === 'es' ? 'Todos los Tipos' : 'Todos os Tipos'}
                  </option>
                  {propertyTypes.map((type: any) => (
                    <option key={type} value={type}>
                      {translatePropertyType(type, language)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preço Máximo */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t("filters.maxPrice")}
                </label>
                <input
                  type="number"
                  placeholder="Ex: 2000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-medium text-slate-800"
                />
              </div>

              {/* Comodidades */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  {t("filters.amenities")}
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
                  {availableAmenities.map((am) => (
                    <label
                      key={am.id}
                      className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(am.id)}
                        onChange={() => toggleAmenityFilter(am.id)}
                        className="w-4 h-4 accent-luxury-gold rounded cursor-pointer"
                      />
                      <span>{getAmenityName(am, language)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Ações Mobile */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  clearFilters();
                  setIsFilterDrawerOpen(false);
                }}
                className="flex-1 py-3.5 border border-slate-200 hover:border-slate-800 text-slate-700 text-xs font-bold rounded-xl uppercase tracking-wider transition-colors"
              >
                {language === 'en' ? 'Clear' : language === 'es' ? 'Limpiar' : 'Limpar'}
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-3.5 bg-luxury-charcoal text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors text-center"
              >
                {language === 'en' ? 'Apply Filters' : language === 'es' ? 'Aplicar Filtros' : 'Aplicar Filtros'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOAT BAR FAVORITOS & COMPARADOR */}
      {favoritesList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100vw-32px)] bg-slate-950/95 text-white px-5 py-4 rounded-2xl flex items-center justify-between gap-4 shadow-2xl border border-white/10 backdrop-blur-md animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold">
              <Heart size={16} className="fill-luxury-gold" />
            </div>
            <div>
              <p className="text-xs font-bold">
                {language === 'en' ? 'Saved Favorites' : language === 'es' ? 'Favoritos Guardados' : 'Favoritos selecionados'}
              </p>
              <p className="text-[10px] text-gray-400">
                {favoritesList.length}{" "}
                {favoritesList.length === 1 
                  ? (language === 'en' ? "saved property" : language === 'es' ? "propiedad guardada" : "imóvel salvo")
                  : (language === 'en' ? "saved properties" : language === 'es' ? "propiedades guardadas" : "imóveis salvos")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-luxury-gold text-slate-950 hover:bg-white transition-all text-xs font-bold rounded-lg cursor-pointer"
          >
            {t("compare.compareBtn")}
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* MODAL DE COMPARAÇÃO VISUAL SIDE-BY-SIDE */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsCompareOpen(false)}
          />
          
          {/* Sheet Body */}
          <div className="relative bg-white rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-y-auto p-6 md:p-8 z-10 shadow-2xl flex flex-col animate-scale-in text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="font-display font-extrabold text-xl text-slate-900">
                  {language === 'en' ? 'Favorites Visual Comparison' : language === 'es' ? 'Comparación Visual de Favoritos' : 'Comparação Visual de Favoritos'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'en' 
                    ? 'Analyze properties side-by-side and choose your ideal retreat.' 
                    : language === 'es' 
                      ? 'Analice las propiedades lado a lado y decida su refugio ideal.' 
                      : 'Analise as acomodações lado a lado e decida qual o refúgio ideal.'}
                </p>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full cursor-pointer hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comparação Table/Flex */}
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[650px] grid grid-cols-12 gap-4 border-b border-slate-100 pb-6 mb-6">
                <div className="col-span-3"></div>
                {favoritesList.map((item) => {
                  const displayTitle = language === 'en' && item.titleEn ? item.titleEn : (language === 'es' && item.titleEs ? item.titleEs : item.title);
                  return (
                    <div key={item.id} className="col-span-3 flex flex-col items-center text-center relative border border-slate-150 p-4 rounded-2xl bg-slate-50/50">
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title={language === 'en' ? 'Remove' : language === 'es' ? 'Eliminar' : 'Remover'}
                      >
                        <X size={12} />
                      </button>
                      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
                        <Image
                          src={item.coverImage}
                          alt={displayTitle}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-luxury-bronze">
                        {translatePropertyType(item.propertyType, language)}
                      </span>
                      <h4 className="font-bold text-slate-950 mt-1 line-clamp-1">
                        {displayTitle}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.city} - {item.state}</p>
                    </div>
                  );
                })}
              </div>

              {/* Ficha Técnica Comparativa */}
              <div className="min-w-[650px] space-y-6">
                {/* Preço */}
                <div className="grid grid-cols-12 gap-4 py-2 border-b border-slate-50 items-center">
                  <div className="col-span-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === 'en' ? 'Base Nightly Price' : language === 'es' ? 'Diario Base' : 'Diária Base'}
                  </div>
                  {favoritesList.map((item) => (
                    <div key={item.id} className="col-span-3 text-sm font-extrabold text-slate-950 text-center">
                      {formatPrice(item.priceFrom)}
                    </div>
                  ))}
                </div>

                {/* Hóspedes */}
                <div className="grid grid-cols-12 gap-4 py-2 border-b border-slate-50 items-center">
                  <div className="col-span-3 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users size={14} className="text-slate-400" />
                    {language === 'en' ? 'Guests' : language === 'es' ? 'Huéspedes' : 'Hóspedes'}
                  </div>
                  {favoritesList.map((item) => (
                    <div key={item.id} className="col-span-3 text-sm font-semibold text-slate-700 text-center">
                      {language === 'en' ? `Up to ${item.guests} guests` : language === 'es' ? `Hasta ${item.guests} huéspedes` : `Até ${item.guests} hóspedes`}
                    </div>
                  ))}
                </div>

                {/* Quartos */}
                <div className="grid grid-cols-12 gap-4 py-2 border-b border-slate-50 items-center">
                  <div className="col-span-3 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Bed size={14} className="text-slate-400" />
                    {language === 'en' ? 'Bedrooms / Beds' : language === 'es' ? 'Dormitorios / Camas' : 'Quartos / Camas'}
                  </div>
                  {favoritesList.map((item) => {
                    const bedLabel = item.beds === 1 
                      ? (language === 'en' ? 'bed' : language === 'es' ? 'cama' : 'cama')
                      : (language === 'en' ? 'beds' : language === 'es' ? 'camas' : 'camas');
                    const roomLabel = item.bedrooms === 1
                      ? (language === 'en' ? 'bedroom' : language === 'es' ? 'dormitorio' : 'quarto')
                      : (language === 'en' ? 'bedrooms' : language === 'es' ? 'dormitorios' : 'quartos');
                    return (
                      <div key={item.id} className="col-span-3 text-sm font-semibold text-slate-700 text-center">
                        {item.bedrooms} {roomLabel} • {item.beds} {bedLabel}
                      </div>
                    );
                  })}
                </div>

                {/* Banheiros */}
                <div className="grid grid-cols-12 gap-4 py-2 border-b border-slate-50 items-center">
                  <div className="col-span-3 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Bath size={14} className="text-slate-400" />
                    {language === 'en' ? 'Bathrooms' : language === 'es' ? 'Baños' : 'Banheiros'}
                  </div>
                  {favoritesList.map((item) => {
                    const bathLabel = item.bathrooms === 1
                      ? (language === 'en' ? 'bathroom' : language === 'es' ? 'baño' : 'banheiro')
                      : (language === 'en' ? 'bathrooms' : language === 'es' ? 'baños' : 'banheiros');
                    return (
                      <div key={item.id} className="col-span-3 text-sm font-semibold text-slate-700 text-center">
                        {item.bathrooms} {bathLabel}
                      </div>
                    );
                  })}
                </div>

                {/* Área */}
                <div className="grid grid-cols-12 gap-4 py-2 border-b border-slate-50 items-center">
                  <div className="col-span-3 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Maximize2 size={14} className="text-slate-400" />
                    {language === 'en' ? 'Area' : language === 'es' ? 'Área' : 'Área'}
                  </div>
                  {favoritesList.map((item) => (
                    <div key={item.id} className="col-span-3 text-sm font-semibold text-slate-700 text-center">
                      {item.area ? `${item.area} ${t("property.area")}` : "--"}
                    </div>
                  ))}
                </div>

                {/* Comodidades principais */}
                <div className="grid grid-cols-12 gap-4 py-2 items-start">
                  <div className="col-span-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t("filters.amenities")}
                  </div>
                  {favoritesList.map((item) => (
                    <div key={item.id} className="col-span-3 text-xs font-semibold text-slate-600 text-center space-y-1">
                      {item.amenities.slice(0, 5).map((am: any) => (
                        <div key={am.id} className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          {getAmenityName(am, language)}
                        </div>
                      ))}
                      {item.amenities.length > 5 && (
                        <div className="text-[10px] text-slate-400 pt-1">
                          + {item.amenities.length - 5} {language === 'en' ? 'others' : language === 'es' ? 'otras' : 'outras'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA Link */}
                <div className="grid grid-cols-12 gap-4 py-6 border-t border-slate-100 items-center">
                  <div className="col-span-3"></div>
                  {favoritesList.map((item) => (
                    <div key={item.id} className="col-span-3 flex justify-center">
                      <Link
                        href={`/imoveis/${item.slug}`}
                        onClick={() => setIsCompareOpen(false)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-luxury-charcoal text-white hover:bg-luxury-bronze text-xs font-bold rounded-xl transition-all shadow-sm w-full justify-center"
                      >
                        <Eye size={12} />
                        {t("property.viewDetails")}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertyListPublicClient(props: PropertyListPublicClientProps) {
  const { language } = useLanguage();
  const loadingText = language === 'en' ? 'Loading properties...' : language === 'es' ? 'Cargando propiedades...' : 'Carregando imóveis...';
  return (
    <Suspense fallback={<div className="text-center py-20">{loadingText}</div>}>
      <PropertyListContent {...props} />
    </Suspense>
  );
}
