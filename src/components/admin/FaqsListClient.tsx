"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Plus, Eye, EyeOff, Loader2 } from "lucide-react";
import { deleteFaq } from "@/app/actions/faqs";
import { useRouter } from "next/navigation";

interface FaqsListClientProps {
  initialFaqs: any[];
}

export default function FaqsListClient({ initialFaqs }: FaqsListClientProps) {
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta FAQ?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteFaq(id);
      if (res.success) {
        setFaqs(faqs.filter((f) => f.id !== id));
        router.refresh();
      } else {
        alert(res.error || "Ocorreu um erro ao excluir a FAQ.");
      }
    } catch (err) {
      alert("Erro ao se conectar ao servidor.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
      {faqs.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-400 font-medium">Nenhuma pergunta frequente (FAQ) cadastrada ainda.</p>
          <Link
            href="/admin/faqs/novo"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-luxury-gold hover:bg-luxury-bronze text-slate-950 hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Criar Primeira FAQ
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Pergunta / Resposta</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-24 text-center">Ordem</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-28 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-28 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-2xl">
                      <div className="font-semibold text-slate-900 text-sm">{faq.question}</div>
                      <div className="text-xs text-slate-500 line-clamp-2 mt-1">{faq.answer}</div>
                      <div className="flex gap-2 mt-2">
                        {faq.questionEn && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">EN</span>}
                        {faq.questionEs && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">ES</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    {faq.order}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {faq.active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                        <Eye size={12} />
                        Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-400 text-xs font-semibold rounded-full border border-slate-100">
                        <EyeOff size={12} />
                        Inativa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/faqs/${faq.id}`}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        disabled={deletingId === faq.id}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                        title="Excluir"
                      >
                        {deletingId === faq.id ? (
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
