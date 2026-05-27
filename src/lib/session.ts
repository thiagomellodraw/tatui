import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET || "luxe_haven_super_secret_key_1234567890";
const COOKIE_NAME = "luxe_haven_admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export function signSession(payload: any): string {
  const data = JSON.stringify({
    ...payload,
    expiresAt: Date.now() + SESSION_DURATION,
  });
  const base64 = Buffer.from(data).toString("base64");
  const hmac = crypto.createHmac("sha256", SECRET).update(base64).digest("hex");
  return `${base64}.${hmac}`;
}

export function verifySession(cookieValue: string): any | null {
  try {
    const parts = cookieValue.split(".");
    if (parts.length !== 2) return null;
    const [base64, hmac] = parts;
    const expectedHmac = crypto.createHmac("sha256", SECRET).update(base64).digest("hex");
    if (hmac !== expectedHmac) return null;
    
    const dataStr = Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(dataStr);
    
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null; // Sessão expirou
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

export async function setSession(payload: any) {
  const sessionToken = signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 dia em segundos
  });
}

export async function createSession(userId: string, username: string, role: string, tenantId: string | null) {
  await setSession({ userId, username, role, tenantId });
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie) return null;
  return verifySession(sessionCookie.value);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
