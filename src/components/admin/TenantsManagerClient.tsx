"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  createTenant, 
  updateTenant, 
  deleteTenant 
} from "@/app/actions/tenant";
import {
  payInvoice,
  createInvoice,
  simulateOverdue,
  resolveOverdue
} from "@/app/actions/billing";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Globe, 
  Calendar, 
  DollarSign, 
  Loader2, 
  X,
  CheckCircle,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  FileText,
  User,
  Activity,
  Play,
  RotateCcw
} from "lucide-react";

interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  domain: string | null;
  status: string;
  monthlyFee: number;
  dueDate: Date | null;
  createdAt: Date;
  _count?: {
    properties: number;
    leads: number;
  };
}

interface InvoiceData {
  id: string;
  tenantId: string;
  amount: number;
  status: string;
  dueDate: Date;
  paidAt: Date | null;
  referenceMonth: string;
  tenant: {
    name: string;
    subdomain: string;
  };
}

interface BillingOverview {
  mrr: number;
  totalInvoiced: number;
  totalOverdue: number;
  totalPending: number;
  adimplenciaRate: number;
  chartData: { month: string; value: number }[];
  activeTenantsCount: number;
  suspendedTenantsCount: number;
}

interface TenantsManagerClientProps {
  initialTenants: any[];
  billingOverview: BillingOverview;
  initialInvoices: any[];
}

export default function TenantsManagerClient({ 
  initialTenants,
  billingOverview,
  initialInvoices
}: TenantsManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"tenants" | "billing">("tenants");
  
  // State de Inquilinos
  const [tenants, setTenants] = useState<TenantData[]>(initialTenants);
  const [invoices, setInvoices] = useState<InvoiceData[]>(initialInvoices);
  const [overview, setOverview] = useState<BillingOverview>(billingOverview);
  
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantData | null>(null);
  
  // States para o formulário de Tenant
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [monthlyFee, setMonthlyFee] = useState("0");
  const [dueDate, setDueDate] = useState("");
  
  // Form de Fatura Manual
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invTenantId, setInvTenantId] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invRefMonth, setInvRefMonth] = useState("");
  
  // Simulador de Inadimplência
  const [selectedSimTenant, setSelectedSimTenant] = useState("");
  const [simulatingTenantId, setSimulatingTenantId] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const openNewModal = () => {
    setEditingTenant(null);
    setName("");
    setSubdomain("");
    setDomain("");
    setStatus("ACTIVE");
    setMonthlyFee("500");
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(10);
    setDueDate(nextMonth.toISOString().split("T")[0]);
    
    setError(null);
    setCredentials(null);
    setModalOpen(true);
  };

  const openEditModal = (tenant: TenantData) => {
    setEditingTenant(tenant);
    setName(tenant.name);
    setSubdomain(tenant.subdomain);
    setDomain(tenant.domain || "");
    setStatus(tenant.status);
    setMonthlyFee(tenant.monthlyFee.toString());
    setDueDate(tenant.dueDate ? new Date(tenant.dueDate).toISOString().split("T")[0] : "");
    setError(null);
    setCredentials(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !subdomain) {
      setError("Nome e Subdomínio são obrigatórios.");
      return;
    }

    const payload = {
      name,
      subdomain,
      domain: domain || null,
      status,
      monthlyFee: parseFloat(monthlyFee) || 0,
      dueDate: dueDate || null,
    };

    startTransition(async () => {
      if (editingTenant) {
        const res = await updateTenant(editingTenant.id, payload);
        if (res.success && res.tenant) {
          setTenants((prev) =>
            prev.map((t) => (t.id === editingTenant.id ? (res.tenant as any) : t))
          );
          setModalOpen(false);
          router.refresh();
        } else {
          setError(res.error || "Erro ao atualizar cliente.");
        }
      } else {
        const res = await createTenant(payload);
        if (res.success && res.tenant) {
          setTenants((prev) => [res.tenant as any, ...prev]);
          if (res.defaultCredentials) {
            setCredentials(res.defaultCredentials);
          } else {
            setModalOpen(false);
          }
          router.refresh();
        } else {
          setError(res.error || "Erro ao criar cliente.");
        }
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (id === "tatui") {
      alert("A conta padrão Tatuí não pode ser removida.");
      return;
    }
    if (!confirm(`Tem certeza que deseja excluir o cliente "${name}"? Todos os seus imóveis, leads e dados serão deletados permanentemente!`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteTenant(id);
      if (res.success) {
        setTenants((prev) => prev.filter((t) => t.id !== id));
        router.refresh();
      } else {
        alert(res.error || "Erro ao excluir cliente.");
      }
    });
  };

  const copyToClipboard = () => {
    if (!credentials) return;
    const text = `Acesso Administrativo da Pousada:\nLink: http://${subdomain}.localhost:3000/admin/login\nUsuário: ${credentials.username}\nSenha: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Liquidar Fatura
  const handlePayInvoice = async (invoiceId: string) => {
    if (!confirm("Confirmar o recebimento e pagamento desta fatura?")) return;
    
    startTransition(async () => {
      const res = await payInvoice(invoiceId);
      if (res.success) {
        // Atualizar lista localmente
        setInvoices((prev) => 
          prev.map((inv) => inv.id === invoiceId ? { ...inv, status: "PAID", paidAt: new Date() } : inv)
        );
        // Atualizar estatísticas e recarregar
        router.refresh();
        alert("Fatura liquidada com sucesso!");
      } else {
        alert(res.error || "Erro ao liquidar fatura.");
      }
    });
  };

  // Emitir Fatura
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invTenantId || !invAmount || !invDueDate || !invRefMonth) {
      alert("Por favor, preencha todos os campos da fatura.");
      return;
    }

    startTransition(async () => {
      const res = await createInvoice({
        tenantId: invTenantId,
        amount: parseFloat(invAmount),
        dueDate: invDueDate,
        referenceMonth: invRefMonth
      });

      if (res.success) {
        setInvoiceModalOpen(false);
        router.refresh();
        alert("Fatura emitida com sucesso!");
      } else {
        alert(res.error || "Erro ao emitir fatura.");
      }
    });
  };

  // Executar Simulação de Bloqueio (Inadimplência)
  const handleSimulateOverdue = async () => {
    if (!selectedSimTenant) {
      alert("Selecione uma pousada para simular.");
      return;
    }
    
    const tenantName = tenants.find(t => t.id === selectedSimTenant)?.name;
    if (!confirm(`Simular atraso de pagamento para "${tenantName}"? Isso forçará a suspensão imediata do painel e do site deles.`)) return;

    setSimulatingTenantId(selectedSimTenant);
    startTransition(async () => {
      const res = await simulateOverdue(selectedSimTenant);
      if (res.success) {
        router.refresh();
        alert(`Simulação ATIVA: A pousada "${tenantName}" está SUSPENSA. Abra o site ou painel deles para ver a tela de bloqueio.`);
      } else {
        alert(res.error || "Erro ao simular atraso.");
      }
      setSimulatingTenantId(null);
    });
  };

  // Executar Simulação de Regularização (Reativação)
  const handleResolveOverdue = async (tId?: string) => {
    const targetId = tId || selectedSimTenant;
    if (!targetId) {
      alert("Selecione uma pousada para regularizar.");
      return;
    }

    const tenantName = tenants.find(t => t.id === targetId)?.name;
    setSimulatingTenantId(targetId);
    startTransition(async () => {
      const res = await resolveOverdue(targetId);
      if (res.success) {
        router.refresh();
        alert(`Sucesso: A pousada "${tenantName}" foi REGULARIZADA e reativada com sucesso!`);
      } else {
        alert(res.error || "Erro ao regularizar.");
      }
      setSimulatingTenantId(null);
    });
  };

  // Dados para Gráfico SVG de Faturamento
  const chartValues = overview.chartData.map(d => d.value);
  const maxChartValue = Math.max(...chartValues, 1000);
  const chartHeight = 160;
  const chartWidth = 500;

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab("tenants")}
          className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "tenants" 
              ? "border-luxury-charcoal text-luxury-charcoal" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <User size={16} />
          Clientes & Assinaturas
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "billing" 
              ? "border-luxury-charcoal text-luxury-charcoal" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <TrendingUp size={16} />
          Painel Financeiro & Cobrança
        </button>
      </div>

      {activeTab === "tenants" ? (
        /* ABA DE INQUILINOS (TABELA + CADASTRO) */
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-xs text-slate-500 font-semibold">
              Total de inquilinos cadastrados: <strong className="text-slate-800">{tenants.length}</strong>
            </div>
            <button
              onClick={openNewModal}
              className="inline-flex items-center gap-2 px-5 py-3 bg-luxury-charcoal hover:bg-luxury-bronze text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Plus size={14} />
              Nova Pousada / Hotel
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Nome / Marca</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Subdomínio / Domínio</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Mensalidade</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Vencimento</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Métricas</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <div className="font-bold text-slate-900">{tenant.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Cadastrado em {new Date(tenant.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-5 space-y-1">
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-650 rounded border border-slate-200">
                          {tenant.subdomain}.localhost:3000
                        </span>
                        {tenant.domain && (
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Globe size={12} className="text-slate-400" />
                            {tenant.domain}
                          </div>
                        )}
                      </td>
                      <td className="p-5 font-bold text-slate-800">
                        R$ {tenant.monthlyFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-5 text-slate-600">
                        {tenant.dueDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar size={13} className="text-slate-400" />
                            {new Date(tenant.dueDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-5 text-xs text-slate-500">
                        <div>Imóveis: <strong className="text-slate-700">{tenant._count?.properties ?? 0}</strong></div>
                        <div>Contatos: <strong className="text-slate-700">{tenant._count?.leads ?? 0}</strong></div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tenant.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : tenant.status === "SUSPENDED"
                            ? "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                            : "bg-slate-100 text-slate-650 border border-slate-200"
                        }`}>
                          {tenant.status === "ACTIVE" ? "Ativo" : tenant.status === "SUSPENDED" ? "Suspenso" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-5 text-right space-x-2">
                        {tenant.status === "SUSPENDED" && (
                          <button
                            onClick={() => handleResolveOverdue(tenant.id)}
                            className="px-2.5 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-750 text-white rounded font-bold transition-colors cursor-pointer"
                            title="Regularizar Inquilino"
                          >
                            Desbloquear
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(tenant)}
                          className="p-2 text-slate-650 hover:text-luxury-bronze hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-block"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(tenant.id, tenant.name)}
                          disabled={tenant.id === "tatui" || isPending}
                          className={`p-2 text-slate-450 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-block ${
                            tenant.id === "tatui" ? "opacity-30 cursor-not-allowed" : ""
                          }`}
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ABA FINANCEIRA & COBRANÇA (DASHBOARD COMPLETO) */
        <div className="space-y-8 animate-fade-in">
          {/* Métricas Financeiras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* MRR */}
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MRR (Faturamento Mensal)</span>
                <DollarSign size={20} className="text-emerald-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-slate-900">
                  R$ {overview.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Soma das assinaturas ativas</p>
              </div>
            </div>

            {/* Total Invoiced */}
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Faturamento Realizado</span>
                <CheckCircle size={20} className="text-emerald-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-slate-900">
                  R$ {overview.totalInvoiced.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Total de faturas pagas</p>
              </div>
            </div>

            {/* Total Overdue */}
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inadimplência (Em Atraso)</span>
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-red-650">
                  R$ {overview.totalOverdue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{overview.suspendedTenantsCount} pousada(s) em atraso</p>
              </div>
            </div>

            {/* Adimplência Rate */}
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Taxa de Adimplência</span>
                <Activity size={20} className="text-blue-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-slate-900">
                  {overview.adimplenciaRate}%
                </h3>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${overview.adimplenciaRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gráfico de Evolução SVG */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Evolução do Faturamento</h3>
                <p className="text-xs text-slate-450 mt-1">Valores recebidos por mês de referência</p>
              </div>
              
              <div className="mt-6 flex justify-center items-end h-[180px] w-full">
                <div className="w-full max-w-[480px]">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
                    {/* Grids horizontais */}
                    <line x1="0" y1="40" x2={chartWidth} y2="40" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="80" x2={chartWidth} y2="80" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="#f1f5f9" strokeWidth="1" />
                    
                    {/* Barras dinâmicas */}
                    {overview.chartData.map((d, index) => {
                      const barWidth = 45;
                      const gap = (chartWidth - barWidth * overview.chartData.length) / (overview.chartData.length + 1);
                      const x = gap + index * (barWidth + gap);
                      const barHeight = (d.value / maxChartValue) * (chartHeight - 40);
                      const y = chartHeight - 25 - barHeight;
                      
                      return (
                        <g key={d.month} className="group cursor-pointer">
                          {/* Gradiente para as barras */}
                          <defs>
                            <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8c6a5c" />
                              <stop offset="100%" stopColor="#c5a880" />
                            </linearGradient>
                          </defs>

                          {/* Barra */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx="6"
                            fill={`url(#gradient-${index})`}
                            className="transition-all duration-300 hover:opacity-90"
                          />

                          {/* Valor acima da barra */}
                          <text
                            x={x + barWidth / 2}
                            y={y - 8}
                            textAnchor="middle"
                            className="text-[10px] font-black fill-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            R$ {d.value}
                          </text>

                          {/* Rótulo do Mês */}
                          <text
                            x={x + barWidth / 2}
                            y={chartHeight - 8}
                            textAnchor="middle"
                            className="text-[10px] font-bold fill-slate-450"
                          >
                            {d.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Widget do Simulador de Cobrança / Atraso */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between border border-slate-950">
              <div>
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider mb-4 animate-pulse">
                  <Play size={10} />
                  Ambiente de Testes
                </div>
                <h3 className="font-display font-extrabold text-lg">Simulador de Inadimplência</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Para ver a tela de aviso de atraso e o bloqueio de acesso do cliente na ponta final, simule um atraso de pagamento selecionando a pousada abaixo.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Selecionar Cliente</label>
                    <select
                      value={selectedSimTenant}
                      onChange={(e) => setSelectedSimTenant(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-xs transition-all text-white cursor-pointer"
                    >
                      <option value="">Selecione uma pousada...</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.status === "ACTIVE" ? "Ativo" : t.status === "SUSPENDED" ? "Suspenso" : "Inativo"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 space-y-2.5">
                <button
                  onClick={handleSimulateOverdue}
                  disabled={!selectedSimTenant || simulatingTenantId !== null}
                  className="w-full py-3 bg-red-650 hover:bg-red-750 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {simulatingTenantId === selectedSimTenant ? <Loader2 size={12} className="animate-spin" /> : <Play size={13} />}
                  Simular Atraso e Suspender
                </button>
                <button
                  onClick={() => handleResolveOverdue()}
                  disabled={!selectedSimTenant || simulatingTenantId !== null}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-750 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {simulatingTenantId === selectedSimTenant ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={13} />}
                  Regularizar e Ativar
                </button>
              </div>
            </div>
          </div>

          {/* Tabela de Histórico de Faturas */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Histórico de Faturamento</h3>
                <p className="text-xs text-slate-450 mt-0.5">Todas as cobranças emitidas para pousadas parceiras</p>
              </div>
              <button
                onClick={() => {
                  setInvTenantId("");
                  setInvAmount("500");
                  setInvDueDate(new Date().toISOString().split("T")[0]);
                  setInvRefMonth(`${String(new Date().getMonth() + 1).padStart(2, "0")}/${new Date().getFullYear()}`);
                  setInvoiceModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                <FileText size={14} />
                Emitir Nova Fatura
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold">
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Referência</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4">Data de Pagamento</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">Nenhuma fatura registrada.</td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          {inv.tenant.name}
                          <span className="block text-[10px] text-slate-400 font-normal">subdomínio: {inv.tenant.subdomain}</span>
                        </td>
                        <td className="p-4 font-mono text-xs">{inv.referenceMonth}</td>
                        <td className="p-4 font-bold">R$ {inv.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="p-4 text-xs">{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td className="p-4 text-xs text-slate-500">
                          {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : inv.status === "OVERDUE"
                              ? "bg-red-50 text-red-705 border border-red-100 animate-pulse"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {inv.status === "PAID" ? "Pago" : inv.status === "OVERDUE" ? "Atrasado" : "Pendente"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {inv.status !== "PAID" && (
                            <button
                              onClick={() => handlePayInvoice(inv.id)}
                              className="px-3 py-1.5 bg-luxury-charcoal hover:bg-luxury-bronze text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                            >
                              Receber
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRO/EDIÇÃO TENANT */}
      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-2xl overflow-hidden relative animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="font-display font-bold text-lg text-slate-900">
                {credentials ? "Acesso Criado com Sucesso!" : editingTenant ? "Editar Cadastro do Cliente" : "Cadastrar Novo Cliente White-Label"}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {credentials ? (
              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">Tudo pronto!</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    A pousada foi criada no banco de dados e as credenciais abaixo dão acesso imediato ao painel dela.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-150 space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Link do Painel</span>
                    <span className="text-luxury-bronze underline break-all">http://{subdomain}.localhost:3000/admin/login</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Usuário</span>
                      <span className="text-slate-800 font-bold">{credentials.username}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Senha Inicial</span>
                      <span className="text-slate-800 font-bold">{credentials.password}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copied ? "Copiado!" : "Copiar Dados de Acesso"}
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 bg-luxury-charcoal hover:bg-luxury-bronze text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-705 text-xs font-semibold rounded-xl border border-red-150">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nome Comercial (Marca)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Pousada Recanto Verde"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subdomínio</label>
                    <input
                      type="text"
                      required
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      placeholder="recantoverde"
                      disabled={!!editingTenant}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Domínio Próprio (Opcional)</label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="www.recantoverde.com.br"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mensalidade (R$)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs"><DollarSign size={14} /></span>
                      <input
                        type="number"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(e.target.value)}
                        placeholder="500"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Vencimento da Assinatura</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status de Assinatura</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-900 cursor-pointer font-medium"
                  >
                    <option value="ACTIVE">Ativo (Permitido)</option>
                    <option value="SUSPENDED">Suspenso (Bloqueado)</option>
                    <option value="INACTIVE">Inativo (Desabilitado)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2.5 bg-luxury-charcoal hover:bg-luxury-bronze text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    {isPending && <Loader2 size={12} className="animate-spin" />}
                    {editingTenant ? "Salvar Alterações" : "Criar Inquilino"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE EMISSÃO DE FATURA MANUAL */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden relative animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="font-display font-bold text-lg text-slate-900">Emitir Nova Fatura Manual</h3>
              <button 
                onClick={() => setInvoiceModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Selecionar Cliente</label>
                <select
                  value={invTenantId}
                  required
                  onChange={(e) => setInvTenantId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-900 cursor-pointer font-medium"
                >
                  <option value="">Selecione...</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Valor Cobrado (R$)</label>
                  <input
                    type="number"
                    required
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mês de Referência (MM/AAAA)</label>
                <input
                  type="text"
                  required
                  value={invRefMonth}
                  onChange={(e) => setInvRefMonth(e.target.value)}
                  placeholder="06/2026"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-luxury-charcoal hover:bg-luxury-bronze text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  {isPending && <Loader2 size={12} className="animate-spin" />}
                  Emitir Cobrança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
