"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { createBanner, updateBanner } from "@/app/actions/banners";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const bannerSchema = zod.object({
  title: zod.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  titleEn: zod.string().optional(),
  titleEs: zod.string().optional(),
  subtitle: zod.string().optional(),
  subtitleEn: zod.string().optional(),
  subtitleEs: zod.string().optional(),
  imageUrl: zod.string().url("A URL da imagem deve ser válida."),
  linkUrl: zod.string().optional(),
  active: zod.boolean(),
  order: zod.number().min(0, "A ordem deve ser positiva."),
});

type BannerFields = zod.infer<typeof bannerSchema>;

interface BannerFormProps {
  initialBanner?: any;
}

export default function BannerForm({ initialBanner }: BannerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pt' | 'en' | 'es'>('pt');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BannerFields>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: initialBanner?.title || "",
      titleEn: initialBanner?.titleEn || "",
      titleEs: initialBanner?.titleEs || "",
      subtitle: initialBanner?.subtitle || "",
      subtitleEn: initialBanner?.subtitleEn || "",
      subtitleEs: initialBanner?.subtitleEs || "",
      imageUrl: initialBanner?.imageUrl || "",
      linkUrl: initialBanner?.linkUrl || "",
      active: initialBanner?.active !== undefined ? initialBanner.active : true,
      order: initialBanner?.order || 0,
    },
  });

  const onSubmit = async (data: BannerFields) => {
    setLoading(true);
    setError(null);

    try {
      let res;
      if (initialBanner?.id) {
        res = await updateBanner(initialBanner.id, data);
      } else {
        res = await createBanner(data);
      }

      if (res.success) {
        router.push("/admin/banners");
        router.refresh();
      } else {
        setError(res.error || "Ocorreu um erro ao salvar o banner.");
      }
    } catch (err) {
      setError("Erro ao se conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/banners"
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">
              {initialBanner ? "Editar Banner" : "Novo Banner"}
            </h1>
            <p className="text-sm text-slate-500">
              {initialBanner ? "Edite as informações e traduções do banner." : "Crie um novo banner promocional para a página inicial."}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-luxury-gold hover:bg-luxury-bronze text-slate-950 hover:text-white disabled:bg-slate-200 disabled:text-slate-400 font-semibold rounded-xl text-sm transition-all shadow-sm shadow-luxury-gold/10 cursor-pointer"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Salvar Banner
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Configurações Gerais do Banner */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Configurações do Banner
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image URL */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              URL da Imagem de Fundo *
            </label>
            <input
              type="text"
              {...register("imageUrl")}
              placeholder="https://images.unsplash.com/... ou URL relativa"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.imageUrl && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Link de Redirecionamento (Opcional)
            </label>
            <input
              type="text"
              {...register("linkUrl")}
              placeholder="Ex: /imoveis/nome-do-imovel"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          {/* Ordem */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Ordem de Exibição
            </label>
            <input
              type="number"
              {...register("order", { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.order && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.order.message}</p>
            )}
          </div>

          {/* Ativo */}
          <div className="flex items-center gap-3 md:col-span-2 mt-2">
            <input
              type="checkbox"
              id="active"
              {...register("active")}
              className="w-4 h-4 text-luxury-gold bg-slate-50 border-slate-200 rounded focus:ring-luxury-gold focus:ring-2 accent-luxury-gold"
            />
            <label htmlFor="active" className="text-sm font-bold uppercase tracking-wider text-slate-600 select-none cursor-pointer">
              Banner Ativo (Exibir no site)
            </label>
          </div>
        </div>
      </div>

      {/* Conteúdo Traduzível */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-display font-bold text-base text-slate-900">
            Textos do Banner
          </h3>
          {/* Seletor de Abas */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['pt', 'en', 'es'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-luxury-bronze shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ABA PORTUGUÊS */}
        <div className={`space-y-6 ${activeTab === 'pt' ? '' : 'hidden'}`}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Título (PT) *
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="Ex: Explore o Paraíso em Trancoso"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Subtítulo / Descrição da Promoção (PT)
            </label>
            <input
              type="text"
              {...register("subtitle")}
              placeholder="Ex: Até 15% OFF em estadias de mais de 7 dias"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* ABA INGLÊS */}
        <div className={`space-y-6 ${activeTab === 'en' ? '' : 'hidden'}`}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Title (EN)
            </label>
            <input
              type="text"
              {...register("titleEn")}
              placeholder="Ex: Explore Paradise in Trancoso"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Subtitle / Promo Description (EN)
            </label>
            <input
              type="text"
              {...register("subtitleEn")}
              placeholder="Ex: Up to 15% OFF on stays longer than 7 days"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* ABA ESPANHOL */}
        <div className={`space-y-6 ${activeTab === 'es' ? '' : 'hidden'}`}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Título (ES)
            </label>
            <input
              type="text"
              {...register("titleEs")}
              placeholder="Ex: Explore el Paraíso en Trancoso"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Subtítulo / Descripción Promocional (ES)
            </label>
            <input
              type="text"
              {...register("subtitleEs")}
              placeholder="Ex: Hasta 15% de descuento en estancias de más de 7 dias"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
