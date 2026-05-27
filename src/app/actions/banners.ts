"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { getResolvedTenantId } from "@/lib/tenant";

export async function getBanners() {
  const tenantId = await getResolvedTenantId();
  return await db.promoBanner.findMany({ 
    where: { active: true, tenantId }, 
    orderBy: { order: "asc" } 
  });
}

export async function getAdminBanners() {
  const session = await getSession();
  if (!session?.userId) return [];
  const tenantId = await getResolvedTenantId();
  return await db.promoBanner.findMany({ 
    where: { tenantId },
    orderBy: { order: "asc" } 
  });
}

export async function createBanner(data: {
  title: string; titleEn?: string; titleEs?: string;
  subtitle?: string; subtitleEn?: string; subtitleEs?: string;
  imageUrl: string; linkUrl?: string; order?: number; active?: boolean;
}) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.promoBanner.create({ 
      data: { 
        ...data, 
        order: data.order ?? 0, 
        active: data.active ?? true,
        tenantId
      } 
    });
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar banner:", error);
    return { success: false, error: "Erro ao criar banner." };
  }
}

export async function updateBanner(id: string, data: {
  title?: string; titleEn?: string; titleEs?: string;
  subtitle?: string; subtitleEn?: string; subtitleEs?: string;
  imageUrl?: string; linkUrl?: string; order?: number; active?: boolean;
}) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.promoBanner.update({ 
      where: { id, tenantId }, 
      data 
    });
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar banner." };
  }
}

export async function deleteBanner(id: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.promoBanner.delete({ 
      where: { id, tenantId } 
    });
    revalidatePath("/admin/banners");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir banner." };
  }
}
