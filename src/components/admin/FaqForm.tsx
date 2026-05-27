"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { createFaq, updateFaq } from "@/app/actions/faqs";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const faqSchema = zod.object({
  question: zod.string().min(5, "A pergunta deve ter pelo menos 5 caracteres."),
  questionEn: zod.string().optional(),
  questionEs: zod.string().optional(),
  answer: zod.string().min(5, "A resposta deve ter pelo menos 5 caracteres."),
  answerEn: zod.string().optional(),
  answerEs: zod.string().optional(),
  active: zod.boolean(),
  order: zod.number().min(0, "A ordem deve ser positiva."),
});

type FaqFields = zod.infer<typeof faqSchema>;

interface FaqFormProps {
  initialFaq?: any;
}

export default function FaqForm({ initialFaq }: FaqFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pt' | 'en' | 'es'>('pt');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FaqFields>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: initialFaq?.question || "",
      questionEn: initialFaq?.questionEn || "",
      questionEs: initialFaq?.questionEs || "",
      answer: initialFaq?.answer || "",
      answerEn: initialFaq?.answerEn || "",
      answerEs: initialFaq?.answerEs || "",
      active: initialFaq?.active !== undefined ? initialFaq.active : true,
      order: initialFaq?.order || 0,
    },
  });

  const onSubmit = async (data: FaqFields) => {
    setLoading(true);
    setError(null);

    try {
      let res;
      if (initialFaq?.id) {
        res = await updateFaq(initialFaq.id, data);
      } else {
        res = await createFaq(data);
      }

      if (res.success) {
        router.push("/admin/faqs");
        router.refresh();
      } else {
        setError(res.error || "Ocorreu um erro ao salvar a FAQ.");
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
            href="/admin/faqs"
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">
              {initialFaq ? "Editar Pergunta Frequente" : "Nova Pergunta Frequente"}
            </h1>
            <p className="text-sm text-slate-500">
              {initialFaq ? "Edite a pergunta, resposta e suas respectivas traduções." : "Crie uma nova pergunta frequente com suporte multilíngue."}
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
          Salvar FAQ
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Configurações Gerais da FAQ */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Configurações da FAQ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Pergunta Ativa (Exibir no site)
            </label>
          </div>
        </div>
      </div>

      {/* Conteúdo Traduzível */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-display font-bold text-base text-slate-900">
            Perguntas e Respostas
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
              Pergunta (PT) *
            </label>
            <input
              type="text"
              {...register("question")}
              placeholder="Ex: Como faço para reservar um imóvel?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.question && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.question.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Resposta (PT) *
            </label>
            <textarea
              rows={4}
              {...register("answer")}
              placeholder="Ex: Basta clicar no botão Reservar Agora..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-none"
            />
            {errors.answer && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.answer.message}</p>
            )}
          </div>
        </div>

        {/* ABA INGLÊS */}
        <div className={`space-y-6 ${activeTab === 'en' ? '' : 'hidden'}`}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Question (EN)
            </label>
            <input
              type="text"
              {...register("questionEn")}
              placeholder="Ex: How do I book a property?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Answer (EN)
            </label>
            <textarea
              rows={4}
              {...register("answerEn")}
              placeholder="Ex: Just click the Book Now button..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-none"
            />
          </div>
        </div>

        {/* ABA ESPANHOL */}
        <div className={`space-y-6 ${activeTab === 'es' ? '' : 'hidden'}`}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Pregunta (ES)
            </label>
            <input
              type="text"
              {...register("questionEs")}
              placeholder="Ex: ¿Cómo reservo una propiedad?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Respuesta (ES)
            </label>
            <textarea
              rows={4}
              {...register("answerEs")}
              placeholder="Ex: Simplemente haga clic en el botón Reservar ahora..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
