import { headers } from "next/headers";
import { db } from "./db";
import { getSession } from "./session";

export async function getResolvedTenantId(): Promise<string> {
  const session = await getSession();
  if (session?.tenantId) {
    return session.tenantId;
  }
  return await getActiveTenantId();
}

export async function getActiveTenantId(): Promise<string> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    
    // Suporte local e domínios de desenvolvimento
    if (host.includes("localhost") || host.includes("127.0.0.1") || !host) {
      const parts = host.split(".");
      if (parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "www") {
        const subdomain = parts[0];
        const tenant = await db.tenant.findUnique({ where: { subdomain } });
        if (tenant) return tenant.id;
      }
      return "tatui";
    }

    // 1. Procurar por domínio personalizado correspondente (ex: www.pousadax.com.br)
    const tenantByDomain = await db.tenant.findUnique({ where: { domain: host } });
    if (tenantByDomain) return tenantByDomain.id;

    // 2. Procurar por subdomínio (ex: pousadax.plataforma.com.br)
    const parts = host.split(".");
    if (parts.length > 1) {
      const subdomain = parts[0];
      const tenantBySubdomain = await db.tenant.findUnique({ where: { subdomain } });
      if (tenantBySubdomain) return tenantBySubdomain.id;
    }

    return "tatui";
  } catch (error) {
    console.error("Erro ao identificar inquilino:", error);
    return "tatui";
  }
}

export async function getActiveTenant() {
  const tenantId = await getActiveTenantId();
  return await db.tenant.findUnique({ where: { id: tenantId } });
}
