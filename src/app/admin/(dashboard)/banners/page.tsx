import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import BannersListClient from "@/components/admin/BannersListClient";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await db.promoBanner.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900">
            Banners Promocionais
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cadastre e gerencie banners promocionais para divulgar ofertas e novidades na página inicial.
          </p>
        </div>
        <Link
          href="/admin/banners/novo"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-luxury-charcoal text-white text-sm font-bold rounded-xl hover:bg-luxury-bronze transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          Novo Banner
        </Link>
      </div>

      <BannersListClient initialBanners={banners} />
    </div>
  );
}
