import { db } from "@/lib/db";
import ConfigForm from "@/components/admin/ConfigForm";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  const config = await db.config.findUnique({ where: { id: "global" } }) ?? {
    id: "global",
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
    footerText: "\u00a9 2026 Tatuí. Todos os direitos reservados. As reservas são concluídas em plataformas parceiras.",
    footerTextEn: null,
    footerTextEs: null,
    updatedAt: new Date(),
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900">
          Configurações Gerais
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Personalize as informações globais do site: marca, hero, contato, redes sociais e rodapé.
        </p>
      </div>
      <ConfigForm initialConfig={config} />
    </div>
  );
}
