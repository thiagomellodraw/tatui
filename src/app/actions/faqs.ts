"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { getResolvedTenantId } from "@/lib/tenant";

export async function getFaqs() {
  const tenantId = await getResolvedTenantId();
  return await db.fAQ.findMany({ 
    where: { active: true, tenantId }, 
    orderBy: { order: "asc" } 
  });
}

export async function getAdminFaqs() {
  const session = await getSession();
  if (!session?.userId) return [];
  const tenantId = await getResolvedTenantId();
  return await db.fAQ.findMany({ 
    where: { tenantId },
    orderBy: { order: "asc" } 
  });
}

export async function createFaq(data: {
  question: string; questionEn?: string; questionEs?: string;
  answer: string; answerEn?: string; answerEs?: string;
  order?: number; active?: boolean;
}) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.fAQ.create({ 
      data: { 
        ...data, 
        order: data.order ?? 0, 
        active: data.active ?? true,
        tenantId
      } 
    });
    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar FAQ:", error);
    return { success: false, error: "Erro ao criar FAQ." };
  }
}

export async function updateFaq(id: string, data: {
  question?: string; questionEn?: string; questionEs?: string;
  answer?: string; answerEn?: string; answerEs?: string;
  order?: number; active?: boolean;
}) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.fAQ.update({ 
      where: { id, tenantId }, 
      data 
    });
    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar FAQ." };
  }
}

export async function deleteFaq(id: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.fAQ.delete({ 
      where: { id, tenantId } 
    });
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir FAQ." };
  }
}
