"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Users, Search } from "lucide-react";

interface HomeSearchFormProps {
  cities: string[];
}

export default function HomeSearchForm({ cities = [] }: HomeSearchFormProps) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    if (guests) params.set("guests", guests);

    router.push(`/imoveis?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full p-4 md:p-3 shadow-2xl border border-white/20 flex flex-col md:flex-row items-center gap-4 text-slate-800"
    >
      {/* Filtro Cidade */}
      <div className="flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100 w-full md:w-auto md:flex-1">
        <MapPin className="text-luxury-bronze shrink-0" size={20} />
        <div className="flex-1 text-left">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Destino
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 mt-0.5 cursor-pointer"
          >
            <option value="">Qual o seu destino?</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtro Hóspedes */}
      <div className="flex items-center gap-3 px-4 py-2 w-full md:w-auto md:flex-1">
        <Users className="text-luxury-bronze shrink-0" size={20} />
        <div className="flex-1 text-left">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Hóspedes
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 mt-0.5 cursor-pointer"
          >
            <option value="">Quantos hóspedes?</option>
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
              <option key={num} value={num}>
                {num === 12 ? "12+ Hóspedes" : `${num} Hóspedes`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botão Pesquisa */}
      <button
        type="submit"
        className="w-full md:w-auto md:h-14 px-8 bg-luxury-charcoal text-white hover:bg-luxury-bronze font-bold rounded-xl md:rounded-full flex items-center justify-center gap-2 transition-all duration-350 shadow-md cursor-pointer shrink-0 py-3.5"
      >
        <Search size={18} />
        <span className="md:hidden uppercase tracking-wider text-xs">Pesquisar Refúgios</span>
      </button>
    </form>
  );
}
