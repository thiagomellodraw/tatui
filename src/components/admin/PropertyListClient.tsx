"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  togglePropertyActive,
  togglePropertyFeatured,
  deleteProperty,
} from "@/app/actions/properties";
import {
  Search,
  Edit2,
  Trash2,
  Eye,
  Star,
  CheckCircle2,
  XCircle,
  MousePointerClick,
  SlidersHorizontal,
} from "lucide-react";

interface PropertyListClientProps {
  initialProperties: any[];
}

export default function PropertyListClient({ initialProperties }: PropertyListClientProps) {
  const router = useRouter();
  const [properties, setProperties] = useState(initialProperties);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, draft
  const [featuredFilter, setFeaturedFilter] = useState("all"); // all, featured, regular
  const [isPending, startTransition] = useTransition();

  // Obter tipos únicos de imóvel para filtro
  const propertyTypes = Array.from(
    new Set(initialProperties.map((p) => p.propertyType))
  );
  const [typeFilter, setTypeFilter] = useState("all");

  // Filtros combinados
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(search.toLowerCase()) ||
      prop.city.toLowerCase().includes(search.toLowerCase()) ||
      prop.neighborhood.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && prop.active) ||
      (statusFilter === "draft" && !prop.active);

    const matchesFeatured =
      featuredFilter === "all" ||
      (featuredFilter === "featured" && prop.featured) ||
      (featuredFilter === "regular" && !prop.featured);

    const matchesType = typeFilter === "all" || prop.propertyType === typeFilter;

    return matchesSearch && matchesStatus && matchesFeatured && matchesType;
  });

  // Ações
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    
    // Atualização otimista
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: nextStatus } : p))
    );

    const res = await togglePropertyActive(id, nextStatus);
    if (!res.success) {
      alert("Falha ao atualizar status: " + res.error);
      // Reverter estado
      setProperties(initialProperties);
    } else {
      router.refresh();
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // Atualização otimista
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: nextStatus } : p))
    );

    const res = await togglePropertyFeatured(id, nextStatus);
    if (!res.success) {
      alert("Falha ao atualizar destaque: " + res.error);
      setProperties(initialProperties);
    } else {
      router.refresh();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o imóvel "${title}"? Esta ação não pode ser desfeita.`)) {
      startTransition(async () => {
        const res = await deleteProperty(id);
        if (res.success) {
          setProperties((prev) => prev.filter((p) => p.id !== id));
          router.refresh();
        } else {
          alert("Erro ao excluir imóvel: " + res.error);
        }
      });
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Sob consulta";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca Textual */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar por título, cidade ou bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-luxury-gold rounded-xl outline-none text-sm transition-colors"
            />
          </div>
          
          {/* Botões de Ações de Filtro */}
          <div className="flex flex-wrap gap-3">
            {/* Filtro Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-semibold text-slate-600"
            >
              <option value="all">Status: Todos</option>
              <option value="active">Ativo</option>
              <option value="draft">Rascunho</option>
            </select>

            {/* Filtro Destaque */}
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-semibold text-slate-600"
            >
              <option value="all">Exibição: Todos</option>
              <option value="featured">Destaques</option>
              <option value="regular">Normais</option>
            </select>

            {/* Filtro Tipo de Imóvel */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold rounded-xl text-sm outline-none font-semibold text-slate-600"
            >
              <option value="all">Tipo: Todos</option>
              {propertyTypes.map((type: any) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Resultados */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400">
          <SlidersHorizontal className="mx-auto mb-4 opacity-50" size={40} />
          <p className="text-sm font-semibold">Nenhum imóvel encontrado.</p>
          <p className="text-xs text-slate-400 mt-1">
            Tente reajustar seus filtros de busca.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tabela Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Imóvel</th>
                  <th className="py-4 px-6">Localização</th>
                  <th className="py-4 px-6">Preço Base</th>
                  <th className="py-4 px-6 text-center">Destaque</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Cliques</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Imóvel */}
                    <td className="py-4 px-6 flex items-center gap-4">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <Image
                          src={prop.coverImage}
                          alt={prop.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate max-w-[200px]" title={prop.title}>
                          {prop.title}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                          {prop.propertyType} • {prop.images.length} fotos
                        </p>
                      </div>
                    </td>

                    {/* Localização */}
                    <td className="py-4 px-6">
                      <p className="text-slate-900">{prop.neighborhood}</p>
                      <p className="text-xs text-slate-400">{prop.city} - {prop.state}</p>
                    </td>

                    {/* Preço */}
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {formatPrice(prop.priceFrom)}
                    </td>

                    {/* Destaque */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleFeatured(prop.id, prop.featured)}
                        className={`p-2 rounded-full cursor-pointer hover:bg-slate-100 transition-colors ${
                          prop.featured ? "text-amber-500" : "text-slate-300"
                        }`}
                        title={prop.featured ? "Remover destaque" : "Destacar imóvel"}
                      >
                        <Star size={18} className={prop.featured ? "fill-amber-500" : ""} />
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(prop.id, prop.active)}
                        className="inline-flex items-center gap-1.5 cursor-pointer font-semibold"
                      >
                        {prop.active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                            <CheckCircle2 size={12} />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">
                            <XCircle size={12} />
                            Rascunho
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Cliques */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg text-xs">
                        <MousePointerClick size={12} />
                        {prop.clicksCount}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <a
                        href={`/imoveis/${prop.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-150 rounded-lg transition-all"
                        title="Ver página pública"
                      >
                        <Eye size={16} />
                      </a>
                      <Link
                        href={`/admin/imoveis/${prop.id}`}
                        className="inline-flex p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar imóvel"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(prop.id, prop.title)}
                        disabled={isPending}
                        className="inline-flex p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Excluir imóvel"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grid Mobile/Tablet */}
          <div className="block lg:hidden divide-y divide-slate-100">
            {filteredProperties.map((prop) => (
              <div key={prop.id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-4">
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <Image
                      src={prop.coverImage}
                      alt={prop.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-luxury-bronze">
                      {prop.propertyType}
                    </p>
                    <h4 className="font-bold text-slate-950 truncate mt-0.5">
                      {prop.title}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {prop.neighborhood}, {prop.city}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/60 p-3 rounded-xl">
                  <div>
                    <span className="text-gray-400 block">Preço Base:</span>
                    <span className="font-bold text-slate-900">{formatPrice(prop.priceFrom)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFeatured(prop.id, prop.featured)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${
                        prop.featured
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "border-slate-200 text-slate-400"
                      }`}
                    >
                      <Star size={10} className={prop.featured ? "fill-amber-700" : ""} />
                      {prop.featured ? "Destaque" : "Destacar"}
                    </button>
                    
                    <button
                      onClick={() => handleToggleActive(prop.id, prop.active)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        prop.active
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {prop.active ? "Ativo" : "Rascunho"}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-bold">
                    <MousePointerClick size={10} />
                    {prop.clicksCount}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <a
                    href={`/imoveis/${prop.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 hover:border-slate-950 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    <Eye size={14} />
                    Ver no Site
                  </a>
                  <Link
                    href={`/admin/imoveis/${prop.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors text-center"
                  >
                    <Edit2 size={14} />
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(prop.id, prop.title)}
                    disabled={isPending}
                    className="p-2 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
