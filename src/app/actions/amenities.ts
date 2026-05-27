"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { getResolvedTenantId } from "@/lib/tenant";

export async function getAmenities() {
  const tenantId = await getResolvedTenantId();
  return await db.amenity.findMany({ 
    where: { tenantId },
    orderBy: { name: "asc" } 
  });
}

export async function getActiveAmenities() {
  const tenantId = await getResolvedTenantId();
  return await db.amenity.findMany({ 
    where: { active: true, tenantId }, 
    orderBy: { name: "asc" } 
  });
}

export async function createAmenity(data: { name: string; nameEn?: string; nameEs?: string; icon: string }) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    const amenity = await db.amenity.create({ 
      data: { ...data, tenantId } 
    });
    revalidatePath("/admin/comodidades");
    return { success: true, amenity };
  } catch (error) {
    console.error("Erro ao criar comodidade:", error);
    return { success: false, error: "Erro ao criar comodidade." };
  }
}

export async function updateAmenity(id: string, data: { name: string; nameEn?: string; nameEs?: string; icon: string }) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    const amenity = await db.amenity.update({ 
      where: { id, tenantId }, 
      data 
    });
    revalidatePath("/admin/comodidades");
    return { success: true, amenity };
  } catch {
    return { success: false, error: "Erro ao atualizar comodidade." };
  }
}

export async function deleteAmenity(id: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.amenity.delete({ 
      where: { id, tenantId } 
    });
    revalidatePath("/admin/comodidades");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir comodidade." };
  }
}

export async function toggleAmenityActive(id: string, active: boolean) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.amenity.update({ 
      where: { id, tenantId }, 
      data: { active } 
    });
    revalidatePath("/admin/comodidades");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar status." };
  }
}
