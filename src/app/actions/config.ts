"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { getResolvedTenantId } from "@/lib/tenant";

export async function getConfig() {
  try {
    const tenantId = await getResolvedTenantId();
    const config = await db.config.findUnique({ where: { tenantId } });
    if (!config) {
      return {
        id: "temp-config",
        brandName: "Tatuí",
        logoUrl: null,
        heroTitle: "Encontre o refúgio ideal para sua próxima temporada.",
        heroTitleEn: null,
        heroTitleEs: null,
        heroSubtitle: "Imóveis exclusivos selecionados para quem busca sofisticação, conforto e memórias inesquecíveis.",
        heroSubtitleEn: null,
        heroSubtitleEs: null,
        whatsappNumber: "5511999999999",
        contactEmail: "contato@tatui.com.br",
        instagramUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
        footerText: "© 2026 Tatuí. Todos os direitos reservados. As reservas são concluídas em plataformas parceiras.",
        footerTextEn: null,
        footerTextEs: null,
        tenantId,
        updatedAt: new Date(),
      };
    }
    return config;
  } catch {
    return null;
  }
}

export async function updateConfig(data: {
  brandName: string;
  logoUrl?: string;
  heroTitle: string;
  heroTitleEn?: string;
  heroTitleEs?: string;
  heroSubtitle: string;
  heroSubtitleEn?: string;
  heroSubtitleEs?: string;
  whatsappNumber: string;
  contactEmail: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  footerText: string;
  footerTextEn?: string;
  footerTextEs?: string;
}) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Não autorizado." };
  }

  try {
    const tenantId = await getResolvedTenantId();
    await db.config.upsert({
      where: { tenantId },
      update: {
        brandName: data.brandName,
        logoUrl: data.logoUrl || null,
        heroTitle: data.heroTitle,
        heroTitleEn: data.heroTitleEn || null,
        heroTitleEs: data.heroTitleEs || null,
        heroSubtitle: data.heroSubtitle,
        heroSubtitleEn: data.heroSubtitleEn || null,
        heroSubtitleEs: data.heroSubtitleEs || null,
        whatsappNumber: data.whatsappNumber,
        contactEmail: data.contactEmail,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        tiktokUrl: data.tiktokUrl || null,
        footerText: data.footerText,
        footerTextEn: data.footerTextEn || null,
        footerTextEs: data.footerTextEs || null,
      },
      create: {
        tenantId,
        brandName: data.brandName,
        logoUrl: data.logoUrl || null,
        heroTitle: data.heroTitle,
        heroTitleEn: data.heroTitleEn || null,
        heroTitleEs: data.heroTitleEs || null,
        heroSubtitle: data.heroSubtitle,
        heroSubtitleEn: data.heroSubtitleEn || null,
        heroSubtitleEs: data.heroSubtitleEs || null,
        whatsappNumber: data.whatsappNumber,
        contactEmail: data.contactEmail,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        tiktokUrl: data.tiktokUrl || null,
        footerText: data.footerText,
        footerTextEn: data.footerTextEn || null,
        footerTextEs: data.footerTextEs || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/configuracoes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return { success: false, error: "Erro ao salvar configurações." };
  }
}
