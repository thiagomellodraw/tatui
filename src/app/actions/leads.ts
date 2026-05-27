"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { getResolvedTenantId } from "@/lib/tenant";

export async function createLead(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  propertyName?: string;
}) {
  try {
    const tenantId = await getResolvedTenantId();
    await db.lead.create({ 
      data: { ...data, status: "NOVO", tenantId } 
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar lead:", error);
    return { success: false, error: "Erro ao enviar mensagem." };
  }
}

export async function getLeads() {
  const session = await getSession();
  if (!session?.userId) return [];
  const tenantId = await getResolvedTenantId();
  return await db.lead.findMany({ 
    where: { tenantId },
    orderBy: { createdAt: "desc" } 
  });
}

export async function updateLeadStatus(id: string, status: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.lead.update({ 
      where: { id, tenantId }, 
      data: { status } 
    });
    revalidatePath("/admin/leads");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar status." };
  }
}

export async function deleteLead(id: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.lead.delete({ 
      where: { id, tenantId } 
    });
    revalidatePath("/admin/leads");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir lead." };
  }
}
