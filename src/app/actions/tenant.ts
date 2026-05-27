"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Apenas Super Admins podem gerenciar inquilinos/clientes
async function ensureSuperAdmin() {
  const session = await getSession();
  if (!session?.userId || session.role !== "SUPER_ADMIN") {
    throw new Error("Não autorizado.");
  }
  return session;
}

export async function getTenants() {
  await ensureSuperAdmin();
  return await db.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { properties: true, leads: true } } }
  });
}

export async function createTenant(data: {
  name: string;
  subdomain: string;
  domain?: string | null;
  status: string;
  monthlyFee: number;
  dueDate?: string | null;
}) {
  await ensureSuperAdmin();
  try {
    // Validar subdomínio único
    const exists = await db.tenant.findUnique({ where: { subdomain: data.subdomain.trim().toLowerCase() } });
    if (exists) return { success: false, error: "Este subdomínio já está em uso." };

    const cleanSubdomain = data.subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

    const tenant = await db.tenant.create({
      data: {
        name: data.name,
        subdomain: cleanSubdomain,
        domain: data.domain?.trim() || null,
        status: data.status,
        monthlyFee: data.monthlyFee,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    // 1. Criar Configuração inicial padrão para esta Pousada
    await db.config.create({
      data: {
        brandName: data.name,
        tenantId: tenant.id,
        whatsappNumber: "5511999999999",
        contactEmail: `contato@${cleanSubdomain}.com.br`,
        footerText: `© 2026 ${data.name}. Todos os direitos reservados.`,
      }
    });

    // 2. Criar Usuário Administrador Padrão para esta pousada
    const defaultPassword = "admin123";
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);
    const username = `admin_${cleanSubdomain}`;
    
    await db.user.create({
      data: {
        username,
        passwordHash,
        role: "TENANT_ADMIN",
        tenantId: tenant.id,
      }
    });

    revalidatePath("/admin/clientes");
    return { 
      success: true, 
      tenant,
      defaultCredentials: { username, password: defaultPassword } 
    };
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error);
    return { success: false, error: error.message || "Erro ao criar cliente." };
  }
}

export async function updateTenant(id: string, data: {
  name: string;
  subdomain: string;
  domain?: string | null;
  status: string;
  monthlyFee: number;
  dueDate?: string | null;
}) {
  await ensureSuperAdmin();
  try {
    const cleanSubdomain = data.subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

    // Validar se subdomínio pertence a outro
    const exists = await db.tenant.findFirst({
      where: {
        subdomain: cleanSubdomain,
        id: { not: id }
      }
    });
    if (exists) return { success: false, error: "Este subdomínio já está sendo usado por outro cliente." };

    const tenant = await db.tenant.update({
      where: { id },
      data: {
        name: data.name,
        subdomain: cleanSubdomain,
        domain: data.domain?.trim() || null,
        status: data.status,
        monthlyFee: data.monthlyFee,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    revalidatePath("/admin/clientes");
    return { success: true, tenant };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro ao atualizar cliente." };
  }
}

export async function deleteTenant(id: string) {
  await ensureSuperAdmin();
  try {
    // Tatuí não pode ser deletada para garantir consistência inicial do sistema
    if (id === "tatui") {
      return { success: false, error: "A conta padrão Tatuí não pode ser removida." };
    }

    await db.tenant.delete({ where: { id } });
    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Erro ao excluir cliente." };
  }
}
