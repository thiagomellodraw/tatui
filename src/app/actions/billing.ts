"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// Verificar se é Super Admin
async function checkSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Não autorizado. Apenas Super Administradores podem acessar esta ação.");
  }
}

export async function getBillingOverview() {
  await checkSuperAdmin();

  try {
    // 1. Obter todos os inquilinos
    const tenants = await db.tenant.findMany();
    
    // MRR: Soma de mensalidades de todos os inquilinos ativos ou suspensos
    const mrr = tenants
      .filter(t => t.status === "ACTIVE" || t.status === "SUSPENDED")
      .reduce((sum, t) => sum + t.monthlyFee, 0);

    // 2. Faturamento Total (Faturas pagas)
    const paidInvoices = await db.invoice.findMany({
      where: { status: "PAID" }
    });
    const totalInvoiced = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // 3. Inadimplência / Pendente (Faturas vencidas ou pendentes)
    const overdueInvoices = await db.invoice.findMany({
      where: { status: "OVERDUE" }
    });
    const pendingInvoices = await db.invoice.findMany({
      where: { status: "PENDING" }
    });

    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // 4. Taxa de adimplência: total pago / (total pago + total vencido)
    const totalInvoicedAndOverdue = totalInvoiced + totalOverdue;
    const adimplenciaRate = totalInvoicedAndOverdue > 0 
      ? Math.round((totalInvoiced / totalInvoicedAndOverdue) * 100) 
      : 100;

    // 5. Agrupamento para gráfico de faturamento por mês de referência (ex: "05/2026")
    const allInvoices = await db.invoice.findMany({
      where: { status: "PAID" },
      orderBy: { dueDate: "asc" }
    });

    const monthlyRevenueMap: Record<string, number> = {};
    for (const inv of allInvoices) {
      monthlyRevenueMap[inv.referenceMonth] = (monthlyRevenueMap[inv.referenceMonth] || 0) + inv.amount;
    }

    const chartData = Object.entries(monthlyRevenueMap).map(([month, value]) => ({
      month,
      value
    }));

    // Se estiver vazio, popula com meses fictícios baseados no atual
    if (chartData.length === 0) {
      const currentYear = new Date().getFullYear();
      chartData.push(
        { month: `02/${currentYear}`, value: 1250 },
        { month: `03/${currentYear}`, value: 1250 },
        { month: `04/${currentYear}`, value: 1250 },
        { month: `05/${currentYear}`, value: 1250 }
      );
    }

    return {
      mrr,
      totalInvoiced,
      totalOverdue,
      totalPending,
      adimplenciaRate,
      chartData,
      activeTenantsCount: tenants.filter(t => t.status === "ACTIVE").length,
      suspendedTenantsCount: tenants.filter(t => t.status === "SUSPENDED").length
    };
  } catch (error: any) {
    console.error("Error fetching billing overview:", error);
    return {
      mrr: 0,
      totalInvoiced: 0,
      totalOverdue: 0,
      totalPending: 0,
      adimplenciaRate: 100,
      chartData: [],
      activeTenantsCount: 0,
      suspendedTenantsCount: 0
    };
  }
}

export async function getInvoices() {
  await checkSuperAdmin();

  try {
    return await db.invoice.findMany({
      include: {
        tenant: {
          select: {
            name: true,
            subdomain: true
          }
        }
      },
      orderBy: { dueDate: "desc" }
    });
  } catch (error) {
    console.error("Error getting invoices:", error);
    return [];
  }
}

export async function payInvoice(id: string) {
  await checkSuperAdmin();

  try {
    const invoice = await db.invoice.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    });

    // Se o inquilino estava suspenso, verifica se ainda possui alguma fatura em atraso (OVERDUE)
    const overdueCount = await db.invoice.count({
      where: {
        tenantId: invoice.tenantId,
        status: "OVERDUE"
      }
    });

    if (overdueCount === 0) {
      // Se não há faturas atrasadas, reativa o inquilino
      await db.tenant.update({
        where: { id: invoice.tenantId },
        data: {
          status: "ACTIVE",
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10)
        }
      });
    }

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro ao liquidar fatura." };
  }
}

export async function createInvoice(data: {
  tenantId: string;
  amount: number;
  dueDate: string;
  referenceMonth: string;
}) {
  await checkSuperAdmin();

  try {
    await db.invoice.create({
      data: {
        tenantId: data.tenantId,
        amount: data.amount,
        status: "PENDING",
        dueDate: new Date(data.dueDate),
        referenceMonth: data.referenceMonth
      }
    });

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro ao emitir fatura." };
  }
}

// Simular inadimplência (Atrasar inquilino)
export async function simulateOverdue(tenantId: string) {
  await checkSuperAdmin();

  try {
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 5); // 5 dias atrás

    // 1. Alterar status do inquilino para SUSPENDED e colocar o vencimento no passado
    await db.tenant.update({
      where: { id: tenantId },
      data: {
        status: "SUSPENDED",
        dueDate: pastDueDate
      }
    });

    // 2. Encontrar ou criar uma fatura em atraso (OVERDUE)
    const pendingInvoice = await db.invoice.findFirst({
      where: { tenantId, status: "PENDING" }
    });

    if (pendingInvoice) {
      await db.invoice.update({
        where: { id: pendingInvoice.id },
        data: {
          status: "OVERDUE",
          dueDate: pastDueDate
        }
      });
    } else {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      await db.invoice.create({
        data: {
          tenantId,
          amount: 500.0,
          status: "OVERDUE",
          dueDate: pastDueDate,
          referenceMonth: `${String(currentMonth).padStart(2, "0")}/${currentYear}`
        }
      });
    }

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro ao simular atraso." };
  }
}

// Regularizar inadimplência (Reativar inquilino)
export async function resolveOverdue(tenantId: string) {
  await checkSuperAdmin();

  try {
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    nextDueDate.setDate(10); // Dia 10 do próximo mês

    // 1. Reativar o inquilino
    await db.tenant.update({
      where: { id: tenantId },
      data: {
        status: "ACTIVE",
        dueDate: nextDueDate
      }
    });

    // 2. Marcar faturas pendentes ou em atraso deste inquilino como pagas
    await db.invoice.updateMany({
      where: {
        tenantId,
        status: { in: ["OVERDUE", "PENDING"] }
      },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    });

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro ao regularizar inquilino." };
  }
}
