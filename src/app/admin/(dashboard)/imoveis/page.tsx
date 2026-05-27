import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import PropertyListClient from "@/components/admin/PropertyListClient";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  // Buscar todos os imóveis, ordenados pelo mais recente
  const properties = await db.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        select: { id: true },
      },
      amenities: {
        select: { id: true, name: true },
      },
    },
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900">
            Gerenciar Imóveis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cadastre, edite, destaque e controle a ativação dos seus imóveis de temporada.
          </p>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-luxury-charcoal text-white text-sm font-bold rounded-xl hover:bg-luxury-bronze transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          Cadastrar Imóvel
        </Link>
      </div>

      {/* Lista/Tabela Interativa (Client Component) */}
      <PropertyListClient initialProperties={properties} />
    </div>
  );
}
