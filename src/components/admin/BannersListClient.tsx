"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Plus, Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import { deleteBanner } from "@/app/actions/banners";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface BannersListClientProps {
  initialBanners: any[];
}

export default function BannersListClient({ initialBanners }: BannersListClientProps) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este banner promocional?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteBanner(id);
      if (res.success) {
        setBanners(banners.filter((b) => b.id !== id));
        router.refresh();
      } else {
        alert(res.error || "Ocorreu um erro ao excluir o banner.");
      }
    } catch (err) {
      alert("Erro ao se conectar ao servidor.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
      {banners.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-400 font-medium">Nenhum banner promocional cadastrado ainda.</p>
          <Link
            href="/admin/banners/novo"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-luxury-gold hover:bg-luxury-bronze text-slate-950 hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Criar Primeiro Banner
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-24">Imagem</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Título</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Link</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-24 text-center">Ordem</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-28 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-28 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{banner.title}</div>
                      {banner.subtitle && (
                        <div className="text-xs text-slate-500 line-clamp-1">{banner.subtitle}</div>
                      )}
                      <div className="flex gap-2 mt-1">
                        {banner.titleEn && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">EN</span>}
                        {banner.titleEs && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">ES</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono text-xs max-w-xs truncate">
                    {banner.linkUrl ? (
                      <Link href={banner.linkUrl} target="_blank" className="hover:text-luxury-bronze inline-flex items-center gap-1">
                        {banner.linkUrl}
                        <ExternalLink size={10} />
                      </Link>
                    ) : (
                      <span className="text-slate-400">Nenhum</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    {banner.order}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {banner.active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                        <Eye size={12} />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-400 text-xs font-semibold rounded-full border border-slate-100">
                        <EyeOff size={12} />
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/banners/${banner.id}`}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        disabled={deletingId === banner.id}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                        title="Excluir"
                      >
                        {deletingId === banner.id ? (
                          <Loader2 size={16} className="animate-spin text-slate-400" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
