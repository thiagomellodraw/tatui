import { db } from "@/lib/db";
import LeadsListClient from "@/components/admin/LeadsListClient";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  // Buscar todos os leads ordenados por data decrescente
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900">
          Contatos e Leads
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie as mensagens e solicitações enviadas pelos visitantes do site.
        </p>
      </div>

      {/* Tabela Interativa de Leads */}
      <LeadsListClient initialLeads={leads} />
    </div>
  );
}
