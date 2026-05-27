"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getResolvedTenantId } from "@/lib/tenant";

export async function getProperties(filters?: {
  city?: string;
  guests?: number;
  propertyType?: string;
  featured?: boolean;
  active?: boolean;
}) {
  const tenantId = await getResolvedTenantId();
  const where: any = { tenantId };
  if (filters?.active !== undefined) where.active = filters.active;
  if (filters?.featured !== undefined) where.featured = filters.featured;
  if (filters?.city) where.city = filters.city;
  if (filters?.guests) where.guests = { gte: filters.guests };
  if (filters?.propertyType) where.propertyType = filters.propertyType;

  return await db.property.findMany({
    where,
    include: { images: { orderBy: { order: "asc" } }, amenities: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPropertyBySlug(slug: string) {
  const tenantId = await getResolvedTenantId();
  return await db.property.findFirst({
    where: { slug, tenantId },
    include: { images: { orderBy: { order: "asc" } }, amenities: true },
  });
}

export async function createProperty(data: {
  title: string; titleEn?: string; titleEs?: string;
  slug?: string;
  shortDescription: string; shortDescriptionEn?: string; shortDescriptionEs?: string;
  fullDescription: string; fullDescriptionEn?: string; fullDescriptionEs?: string;
  location: string; locationEn?: string; locationEs?: string;
  city: string; neighborhood: string; state: string; addressOptional?: string;
  latitude?: number; longitude?: number;
  propertyType: string;
  guests: number; bedrooms: number; beds: number; bathrooms: number; area?: number | null;
  priceFrom?: number | null;
  externalBookingUrl: string; whatsappUrl?: string;
  featured: boolean; active: boolean;
  coverImage: string;
  images?: string[];
  amenityIds?: string[];
}) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };

  try {
    const tenantId = await getResolvedTenantId();
    const { images, amenityIds, ...rest } = data;
    
    const finalSlug = data.slug || data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    const property = await db.property.create({
      data: {
        ...rest,
        slug: finalSlug,
        tenantId,
        amenities: amenityIds?.length ? { connect: amenityIds.map((id) => ({ id })) } : undefined,
      },
    });

    if (images?.length) {
      for (let i = 0; i < images.length; i++) {
        await db.propertyImage.create({ data: { url: images[i], order: i, propertyId: property.id } });
      }
    }

    revalidatePath("/imoveis");
    revalidatePath("/admin/imoveis");
    return { success: true, id: property.id };
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);
    return { success: false, error: "Erro ao criar imóvel." };
  }
}

export async function updateProperty(id: string, data: {
  title?: string; titleEn?: string; titleEs?: string;
  slug?: string;
  shortDescription?: string; shortDescriptionEn?: string; shortDescriptionEs?: string;
  fullDescription?: string; fullDescriptionEn?: string; fullDescriptionEs?: string;
  location?: string; locationEn?: string; locationEs?: string;
  city?: string; neighborhood?: string; state?: string; addressOptional?: string;
  latitude?: number; longitude?: number;
  propertyType?: string;
  guests?: number; bedrooms?: number; beds?: number; bathrooms?: number; area?: number | null;
  priceFrom?: number | null;
  externalBookingUrl?: string; whatsappUrl?: string;
  featured?: boolean; active?: boolean;
  coverImage?: string;
  images?: string[];
  amenityIds?: string[];
}) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };

  try {
    const tenantId = await getResolvedTenantId();
    const { images, amenityIds, ...rest } = data;
    
    if (rest.slug) {
      rest.slug = rest.slug
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();
    }

    await db.property.update({
      where: { id, tenantId },
      data: {
        ...rest,
        amenities: amenityIds !== undefined ? { set: amenityIds.map((aid) => ({ id: aid })) } : undefined,
      },
    });

    if (images !== undefined) {
      await db.propertyImage.deleteMany({ where: { propertyId: id } });
      for (let i = 0; i < images.length; i++) {
        await db.propertyImage.create({ data: { url: images[i], order: i, propertyId: id } });
      }
    }

    revalidatePath("/imoveis");
    revalidatePath(`/imoveis/${data.slug ?? id}`);
    revalidatePath("/admin/imoveis");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    return { success: false, error: "Erro ao atualizar imóvel." };
  }
}

export async function deleteProperty(id: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.property.delete({ where: { id, tenantId } });
    revalidatePath("/imoveis");
    revalidatePath("/admin/imoveis");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir imóvel." };
  }
}

export async function togglePropertyActive(id: string, active: boolean) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.property.update({ where: { id, tenantId }, data: { active } });
    revalidatePath("/imoveis");
    revalidatePath("/admin/imoveis");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar status." };
  }
}

export async function togglePropertyFeatured(id: string, featured: boolean) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };
  try {
    const tenantId = await getResolvedTenantId();
    await db.property.update({ where: { id, tenantId }, data: { featured } });
    revalidatePath("/imoveis");
    revalidatePath("/admin/imoveis");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar destaque." };
  }
}

export async function registerClick(propertyId: string, propertyName: string) {
  try {
    const tenantId = await getResolvedTenantId();
    await db.clickLog.create({ data: { propertyId, propertyName, tenantId } });
    await db.property.update({ 
      where: { id: propertyId, tenantId }, 
      data: { clicksCount: { increment: 1 } } 
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar clique:", error);
    return { success: false };
  }
}

export async function logExternalClick(propertyId: string, propertyName: string) {
  return await registerClick(propertyId, propertyName);
}

export async function uploadPropertyImagesAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Não autorizado." };

  try {
    const files = formData.getAll("images") as File[];
    if (!files.length) return { success: false, error: "Nenhum arquivo enviado." };

    const urls: string[] = [];
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = file.name.split(".").pop();
      const filename = `${uniqueSuffix}.${fileExtension}`;
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);
      urls.push(`/uploads/${filename}`);
    }

    return { success: true, urls };
  } catch (error: any) {
    console.error("Erro no upload:", error);
    return { success: false, error: error.message || "Erro ao salvar imagem." };
  }
}
