import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getResolvedTenantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tenantId = await getResolvedTenantId();
  const tenant = await db.tenant.findUnique({ where: { id: tenantId } });

  // Se o inquilino estiver suspenso ou inativo, bloqueia o acesso público
  if (tenant && tenant.status !== "ACTIVE") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white font-sans">
        <div className="max-w-md space-y-6 animate-fade-in">
          <span className="font-display font-extrabold text-4xl text-luxury-gold tracking-wide">
            {tenant.name}
          </span>
          <div className="w-16 h-[2px] bg-luxury-bronze mx-auto" />
          <h1 className="text-xl font-bold">Serviço Temporariamente Suspenso</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Esta página encontra-se temporariamente indisponível. Se você é o proprietário, por favor entre em contato com o suporte de faturamento para regularizar o acesso.
          </p>
        </div>
      </div>
    );
  }

  const config = await db.config.findUnique({ where: { tenantId } });

  return (
    <>
      <Navbar
        brandName={config?.brandName ?? "Tatuí"}
        whatsappNumber={config?.whatsappNumber ?? "5511999999999"}
      />
      <main className="pt-24 md:pt-28 flex-1">{children}</main>
      <Footer
        brandName={config?.brandName ?? "Tatuí"}
        whatsappNumber={config?.whatsappNumber ?? "5511999999999"}
        contactEmail={config?.contactEmail ?? "contato@tatui.com.br"}
        instagramUrl={config?.instagramUrl ?? undefined}
        facebookUrl={config?.facebookUrl ?? undefined}
        tiktokUrl={config?.tiktokUrl ?? undefined}
        footerText={config?.footerText ?? "© 2026 Tatuí. Todos os direitos reservados."}
        footerTextEn={config?.footerTextEn ?? undefined}
        footerTextEs={config?.footerTextEs ?? undefined}
      />
    </>
  );
}
