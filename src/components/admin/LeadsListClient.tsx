"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus, deleteLead } from "@/app/actions/leads";
import {
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  Search,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

interface LeadsListClientProps {
  initialLeads: any[];
}

export default function LeadsListClient({ initialLeads }: LeadsListClientProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, NOVO, EM_ATENDIMENTO, RESPONDIDO, ARQUIVADO
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filtrar leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      (lead.propertyName && lead.propertyName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Alternar linha expandida
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Alterar status
  const handleStatusChange = async (id: string, nextStatus: string) => {
    // Atualização otimista
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: nextStatus } : l))
    );

    const res = await updateLeadStatus(id, nextStatus);
    if (!res.success) {
      alert("Erro ao atualizar status: " + res.error);
      setLeads(initialLeads);
    } else {
      router.refresh();
    }
  };

  // Excluir lead
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o lead de "${name}"?`)) {
      startTransition(async () => {
        const res = await deleteLead(id);
        if (res.success) {
          setLeads((prev) => prev.filter((l) => l.id !== id));
          if (expandedId === id) setExpandedId(null);
          router.refresh();
        } else {
          alert("Erro ao excluir: " + res.error);
        }
      });
    }
  };

  // Formatar número de WhatsApp para link direto
  const getWhatsAppLink = (phone: string, name: string, propName?: string | null) => {
    const cleanPhone = phone.replace(/\D/g, "");
    // Adicionar DDI 55 se o telefone não tiver
    const formattedPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Olá ${name}, obrigado pelo contato em nosso site sobre o imóvel ${
        propName ? `"${propName}"` : "de temporada"
      }. Como posso ajudar?`
    );
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  const statusOptions = [
    { value: "NOVO", label: "Novo", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
    { value: "EM_ATENDIMENTO", label: "Em Atendimento", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
    { value: "RESPONDIDO", label: "Respondido", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
    { value: "ARQUIVADO", label: "Arquivado", color: "bg-slate-100 text-slate-500 hover:bg-slate-200" },
  ];

  return (
    <div className="space-y-6">
      {/* Busca e Filtros */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar leads por nome, email, telefone ou imóvel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-luxury-gold rounded-xl outline-none text-sm transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 shrink-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-luxury-charcoal text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600"
            }`}
          >
            Todos
          </button>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === opt.value
                  ? "bg-luxury-gold text-slate-950 shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Resultados */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400">
          <MessageSquare className="mx-auto mb-4 opacity-50" size={40} />
          <p className="text-sm font-semibold">Nenhum lead encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-10"></th>
                  <th className="py-4 px-6">Cliente</th>
                  <th className="py-4 px-6">Contato</th>
                  <th className="py-4 px-6">Interesse</th>
                  <th className="py-4 px-6">Data</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {filteredLeads.map((lead) => {
                  const isExpanded = expandedId === lead.id;
                  return (
                    <>
                      <tr
                        key={lead.id}
                        onClick={() => toggleExpand(lead.id)}
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          isExpanded ? "bg-slate-50/30" : ""
                        }`}
                      >
                        {/* Indicador Chevron */}
                        <td className="py-4 px-6 text-center">
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={16} className="text-slate-400" />
                          )}
                        </td>

                        {/* Nome */}
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900">{lead.name}</p>
                        </td>

                        {/* Contatos */}
                        <td className="py-4 px-6 text-xs space-y-0.5">
                          <p className="text-slate-900 font-semibold">{lead.phone}</p>
                          <p className="text-slate-400">{lead.email}</p>
                        </td>

                        {/* Interesse */}
                        <td className="py-4 px-6">
                          {lead.propertyName ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-luxury-gold/10 text-luxury-bronze text-xs font-semibold">
                              {lead.propertyName}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic font-normal">
                              Contato Geral
                            </span>
                          )}
                        </td>

                        {/* Data */}
                        <td className="py-4 px-6 text-xs text-slate-500 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-luxury-gold cursor-pointer transition-colors ${
                              lead.status === "NOVO"
                                ? "bg-emerald-50 text-emerald-700"
                                : lead.status === "EM_ATENDIMENTO"
                                ? "bg-blue-50 text-blue-700"
                                : lead.status === "RESPONDIDO"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <option value="NOVO">Novo</option>
                            <option value="EM_ATENDIMENTO">Em Atendimento</option>
                            <option value="RESPONDIDO">Respondido</option>
                            <option value="ARQUIVADO">Arquivado</option>
                          </select>
                        </td>

                        {/* Ações */}
                        <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(lead.id, lead.name)}
                            disabled={isPending}
                            className="inline-flex p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir lead"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>

                      {/* Conteúdo Expandido */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={7} className="p-6 border-b border-slate-100">
                            <div className="space-y-4 max-w-3xl">
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Mensagem do Cliente:
                                </h4>
                                <p className="text-sm text-slate-800 bg-white p-4 rounded-xl border border-slate-200 shadow-sm leading-relaxed whitespace-pre-wrap font-medium">
                                  {lead.message}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 pt-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  Responder via:
                                </span>
                                
                                <a
                                  href={getWhatsAppLink(lead.phone, lead.name, lead.propertyName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => handleStatusChange(lead.id, "EM_ATENDIMENTO")}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                >
                                  <MessageCircle size={14} />
                                  WhatsApp
                                </a>

                                <a
                                  href={`mailto:${lead.email}?subject=Contato - Tatu�`}
                                  onClick={() => handleStatusChange(lead.id, "EM_ATENDIMENTO")}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                >
                                  <Mail size={14} />
                                  E-mail
                                </a>

                                <button
                                  onClick={() => handleStatusChange(lead.id, "RESPONDIDO")}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-800 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                                >
                                  <CheckCircle2 size={14} />
                                  Marcar como Respondido
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
