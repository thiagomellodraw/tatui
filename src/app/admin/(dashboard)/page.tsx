import { db } from "@/lib/db";
import Link from "next/link";
import {
  Home as HomeIcon,
  MessageSquare,
  MousePointerClick,
  Sparkles,
  ArrowUpRight,
  Clock,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Buscar métricas agregadas do banco
  const [
    totalProperties,
    activeProperties,
    featuredProperties,
    totalLeads,
    newLeads,
    clicksAggregate,
  ] = await Promise.all([
    db.property.count(),
    db.property.count({ where: { active: true } }),
    db.property.count({ where: { featured: true } }),
    db.lead.count(),
    db.lead.count({ where: { status: "NOVO" } }),
    db.property.aggregate({ _sum: { clicksCount: true } }),
  ]);

  const totalClicks = clicksAggregate._sum.clicksCount || 0;

  // Obter últimos leads
  const latestLeads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Obter últimos imóveis
  const latestProperties = await db.property.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Formatar preço
  const formatPrice = (price: number | null) => {
    if (!price) return "Sob consulta";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const metrics = [
    {
      title: "Total de Imóveis",
      value: totalProperties,
      subtitle: `${activeProperties} ativos / ${totalProperties - activeProperties} rascunhos`,
      icon: HomeIcon,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Imóveis Destaques",
      value: featuredProperties,
      subtitle: "Exibidos na home",
      icon: Sparkles,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      title: "Leads Recebidos",
      value: totalLeads,
      subtitle: `${newLeads} novos para atendimento`,
      icon: MessageSquare,
      color: "bg-emerald-500/10 text-emerald-600",
      alert: newLeads > 0,
    },
    {
      title: "Cliques em Reservar",
      value: totalClicks,
      subtitle: "Redirecionamentos externos",
      icon: MousePointerClick,
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900">
          Visão Geral
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhe o desempenho das suas divulgações e leads recebidos.
        </p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${metric.color}`}>
                  <Icon size={22} />
                </div>
                {metric.alert && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-slate-950">{metric.value}</p>
                <h3 className="text-sm font-bold text-slate-800 mt-1">
                  {metric.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{metric.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid de Detalhes (Leads e Imóveis Recentes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna Leads Recentes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-slate-900">
              Leads Recentes
            </h2>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-xs font-bold text-luxury-bronze hover:text-luxury-gold transition-colors"
            >
              Ver todos
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {latestLeads.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400">
                <MessageSquare size={36} className="mb-2 opacity-50" />
                <p className="text-sm">Nenhum lead recebido ainda.</p>
              </div>
            ) : (
              latestLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-start justify-between p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {lead.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {lead.email}
                    </p>
                    {lead.propertyName && (
                      <span className="inline-block mt-2 text-[10px] font-semibold bg-luxury-gold/10 text-luxury-bronze px-2 py-0.5 rounded">
                        Interesse: {lead.propertyName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        lead.status === "NOVO"
                          ? "bg-emerald-50 text-emerald-700"
                          : lead.status === "EM_ATENDIMENTO"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {lead.status === "NOVO"
                        ? "Novo"
                        : lead.status === "EM_ATENDIMENTO"
                        ? "Em Atendimento"
                        : lead.status === "RESPONDIDO"
                        ? "Respondido"
                        : "Arquivado"}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna Imóveis Recentes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-slate-900">
              Imóveis Recentes
            </h2>
            <Link
              href="/admin/imoveis"
              className="inline-flex items-center gap-1 text-xs font-bold text-luxury-bronze hover:text-luxury-gold transition-colors"
            >
              Ver todos
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {latestProperties.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400">
                <HomeIcon size={36} className="mb-2 opacity-50" />
                <p className="text-sm">Nenhum imóvel cadastrado.</p>
              </div>
            ) : (
              latestProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {prop.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {prop.location} • {formatPrice(prop.priceFrom)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          prop.active
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {prop.active ? "Ativo" : "Rascunho"}
                      </span>
                      {prop.featured && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                          Destaque
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">
                      <MousePointerClick size={12} />
                      {prop.clicksCount}
                    </span>
                    <a
                      href={`/imoveis/${prop.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-slate-400 hover:text-luxury-bronze flex items-center gap-0.5"
                    >
                      Ver site
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
