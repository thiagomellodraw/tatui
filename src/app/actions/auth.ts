"use server";

import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function loginAdmin(username: string, password: string) {
  try {
    const user = await db.user.findUnique({ where: { username } });
    if (!user) return { success: false, error: "Credenciais inválidas." };

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return { success: false, error: "Credenciais inválidas." };

    if (user.tenantId) {
      const tenant = await db.tenant.findUnique({ where: { id: user.tenantId } });
      if (tenant && tenant.status !== "ACTIVE") {
        return { success: false, error: "Acesso suspenso. Por favor, entre em contato com o suporte." };
      }
    }

    await createSession(user.id, user.username, user.role, user.tenantId);
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Erro interno. Tente novamente." };
  }
}

export async function logoutAdmin() {
  await destroySession();
}
