"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { updateConfig } from "@/app/actions/config";
import { useRouter } from "next/navigation";
import { Loader2, Check, Save } from "lucide-react";

const configSchema = zod.object({
  brandName: zod.string().min(2, "O nome da marca deve ter pelo menos 2 caracteres."),
  logoUrl: zod.string().optional(),
  heroTitle: zod.string().min(5, "O título da home deve ser mais explicativo."),
  heroTitleEn: zod.string().optional(),
  heroTitleEs: zod.string().optional(),
  heroSubtitle: zod.string().min(10, "O subtítulo da home deve ser mais explicativo."),
  heroSubtitleEn: zod.string().optional(),
  heroSubtitleEs: zod.string().optional(),
  whatsappNumber: zod.string().min(8, "Telefone de WhatsApp inválido."),
  contactEmail: zod.string().email("Insira um e-mail de contato válido."),
  instagramUrl: zod.string().url("URL de Instagram inválida.").or(zod.literal("")).optional(),
  facebookUrl: zod.string().url("URL de Facebook inválida.").or(zod.literal("")).optional(),
  tiktokUrl: zod.string().url("URL de TikTok inválida.").or(zod.literal("")).optional(),
  footerText: zod.string().min(5, "O texto do rodapé deve ser mais completo."),
  footerTextEn: zod.string().optional(),
  footerTextEs: zod.string().optional(),
});

type ConfigFields = zod.infer<typeof configSchema>;

interface ConfigFormProps {
  initialConfig: any;
}

export default function ConfigForm({ initialConfig }: ConfigFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pt' | 'en' | 'es'>('pt');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfigFields>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      brandName: initialConfig?.brandName || "Tatuí",
      logoUrl: initialConfig?.logoUrl || "",
      heroTitle: initialConfig?.heroTitle || "Encontre o refúgio ideal para sua próxima temporada.",
      heroTitleEn: initialConfig?.heroTitleEn || "",
      heroTitleEs: initialConfig?.heroTitleEs || "",
      heroSubtitle: initialConfig?.heroSubtitle || "Imóveis exclusivos selecionados para quem busca sofisticação, conforto e memórias inesquecíveis.",
      heroSubtitleEn: initialConfig?.heroSubtitleEn || "",
      heroSubtitleEs: initialConfig?.heroSubtitleEs || "",
      whatsappNumber: initialConfig?.whatsappNumber || "5511999999999",
      contactEmail: initialConfig?.contactEmail || "contato@tatui.com.br",
      instagramUrl: initialConfig?.instagramUrl || "",
      facebookUrl: initialConfig?.facebookUrl || "",
      tiktokUrl: initialConfig?.tiktokUrl || "",
      footerText: initialConfig?.footerText || "© 2026 Tatuí. Todos os direitos reservados. As reservas são concluídas em plataformas parceiras.",
      footerTextEn: initialConfig?.footerTextEn || "",
      footerTextEs: initialConfig?.footerTextEs || "",
    },
  });

  const onSubmit = async (data: ConfigFields) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await updateConfig(data);
      if (res.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || "Ocorreu um erro ao salvar as configurações.");
      }
    } catch (err) {
      setError("Erro ao se conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl animate-fade-in text-slate-900">
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-xl border border-emerald-100 flex items-center gap-2">
          <Check size={18} />
          Configurações salvas com sucesso! As alterações já estão ativas no site.
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Bloco 1: Identidade da Marca */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Identidade da Marca
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome da Marca */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Nome Comercial da Marca
            </label>
            <input
              type="text"
              {...register("brandName")}
              placeholder="Ex: Tatuí"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
            {errors.brandName && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.brandName.message}</p>
            )}
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              URL do Logotipo (Opcional)
            </label>
            <input
              type="text"
              {...register("logoUrl")}
              placeholder="https://sua-marca.com/logo.png"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
          </div>
        </div>
      </div>

      {/* Bloco 2: Textos Traduzíveis (Abas) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-display font-bold text-base text-slate-900">
            Conteúdo de Marketing e Avisos Traduzíveis
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
          {/* Título Principal PT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Título Principal da Home (PT)
            </label>
            <input
              type="text"
              {...register("heroTitle")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
            {errors.heroTitle && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.heroTitle.message}</p>
            )}
          </div>

          {/* Subtítulo PT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Subtítulo Descritivo (PT)
            </label>
            <textarea
              rows={3}
              {...register("heroSubtitle")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-none text-slate-950"
            />
            {errors.heroSubtitle && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.heroSubtitle.message}</p>
            )}
          </div>

          {/* Texto de Rodapé PT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Texto de Direitos Autorais e Avisos no Rodapé (PT)
            </label>
            <textarea
              rows={2}
              {...register("footerText")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-none text-slate-950"
            />
            {errors.footerText && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.footerText.message}</p>
            )}
          </div>
        </div>

        {/* ABA INGLÊS */}
        <div className={`space-y-6 ${activeTab === 'en' ? '' : 'hidden'}`}>
          {/* Título Principal EN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Home Hero Title (EN)
            </label>
            <input
              type="text"
              {...register("heroTitleEn")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
          </div>

          {/* Subtítulo EN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Hero Subtitle (EN)
            </label>
            <textarea
              rows={3}
              {...register("heroSubtitleEn")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-none text-slate-950"
            />
          </div>

          {/* Texto de Rodapé EN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Footer Copyright and Notices (EN)
            </label>
            <textarea
              rows={2}
              {...register("footerTextEn")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-none text-slate-950"
            />
          </div>
        </div>

        {/* ABA ESPANHOL */}
        <div className={`space-y-6 ${activeTab === 'es' ? '' : 'hidden'}`}>
          {/* Título Principal ES */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Título Principal de la Home (ES)
            </label>
            <input
              type="text"
              {...register("heroTitleEs")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
          </div>

          {/* Subtítulo ES */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Subtítulo Descriptivo (ES)
            </label>
            <textarea
              rows={3}
              {...register("heroSubtitleEs")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-none text-slate-950"
            />
          </div>

          {/* Texto de Rodapé ES */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Texto de Derechos de Autor y Avisos del Pie de Página (ES)
            </label>
            <textarea
              rows={2}
              {...register("footerTextEs")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-none text-slate-950"
            />
          </div>
        </div>
      </div>

      {/* Bloco 3: Informações de Contato e Redes Sociais */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Contatos e Links Sociais (Globais)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Geral */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              WhatsApp Principal (DDI + DDD + Número)
            </label>
            <input
              type="text"
              {...register("whatsappNumber")}
              placeholder="Ex: 5511999999999"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
            {errors.whatsappNumber && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.whatsappNumber.message}</p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              E-mail de Contato
            </label>
            <input
              type="text"
              {...register("contactEmail")}
              placeholder="Ex: contato@sua-marca.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
            {errors.contactEmail && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.contactEmail.message}</p>
            )}
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Instagram (Link Completo)
            </label>
            <input
              type="text"
              {...register("instagramUrl")}
              placeholder="https://instagram.com/suapagina"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
            {errors.instagramUrl && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.instagramUrl.message}</p>
            )}
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Facebook (Link Completo)
            </label>
            <input
              type="text"
              {...register("facebookUrl")}
              placeholder="https://facebook.com/suapagina"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
            {errors.facebookUrl && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.facebookUrl.message}</p>
            )}
          </div>

          {/* TikTok */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              TikTok (Link Completo)
            </label>
            <input
              type="text"
              {...register("tiktokUrl")}
              placeholder="https://tiktok.com/@suapagina"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
            {errors.tiktokUrl && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.tiktokUrl.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3.5 bg-luxury-charcoal hover:bg-luxury-bronze text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </form>
  );
}