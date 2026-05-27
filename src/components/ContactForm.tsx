'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { createLead } from "@/app/actions/leads";
import {
  Send,
  Loader2,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ContactFormProps {
  properties: Array<{ id: string; title: string; titleEn?: string | null; titleEs?: string | null }>;
  globalWhatsApp: string;
  globalEmail: string;
}

export default function ContactForm({ properties = [], globalWhatsApp, globalEmail }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const leadSchema = zod.object({
    name: zod.string().min(3, language === 'en' ? "Name must be at least 3 characters." : language === 'es' ? "El nombre debe tener al menos 3 caracteres." : "O nome deve ter pelo menos 3 caracteres."),
    email: zod.string().email(language === 'en' ? "Enter a valid email address." : language === 'es' ? "Ingrese un correo electrónico válido." : "Insira um e-mail de contato válido."),
    phone: zod.string().min(8, language === 'en' ? "Invalid phone number." : language === 'es' ? "Teléfono inválido." : "Telefone inválido."),
    message: zod.string().min(10, language === 'en' ? "Message must be at least 10 characters." : language === 'es' ? "El mensaje debe tener al menos 10 caracteres." : "A mensagem deve ter pelo menos 10 caracteres."),
    propertyId: zod.string().optional(),
  });

  type LeadFields = zod.infer<typeof leadSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFields>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      propertyId: "",
    },
  });

  const onSubmit = async (data: LeadFields) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const selectedProperty = properties.find(p => p.id === data.propertyId);
      const res = await createLead({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        propertyId: data.propertyId || undefined,
        propertyName: selectedProperty ? selectedProperty.title : undefined,
      });

      if (res.success) {
        setSuccess(true);
        reset();
      } else {
        setError(res.error || (language === 'en' ? 'An error occurred while sending your message.' : language === 'es' ? 'Ocurrió un error al enviar su mensaje.' : "Ocorreu um erro ao enviar sua mensagem."));
      }
    } catch (err) {
      setError(language === 'en' ? 'Connection error. Try again.' : language === 'es' ? 'Error de conexión. Inténtelo de nuevo.' : "Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formattedWhatsApp = `https://wa.me/${globalWhatsApp}?text=Olá! Gostaria de falar sobre aluguel de temporada.`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-7xl mx-auto">
      {/* Informações de Contato (Col 5) */}
      <div className="lg:col-span-5 space-y-8 bg-luxury-charcoal text-white p-8 md:p-10 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] aspect-square rounded-full bg-luxury-gold/5 blur-[80px]" />
        
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">
            {language === 'en' ? 'Support Channels' : language === 'es' ? 'Canales de Atención' : 'Canais de Atendimento'}
          </span>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl mt-2">
            {language === 'en' ? 'We are here to help' : language === 'es' ? 'Estamos aquí para ayudar' : 'Estamos aqui para ajudar'}
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            {language === 'en' 
              ? 'Have questions about a property, dates, or concierge services? Speak with our team.' 
              : language === 'es' 
              ? '¿Tiene preguntas sobre una propiedad, fechas o servicios de conserjería? Hable con nuestro equipo.' 
              : 'Dúvidas sobre propriedades, datas disponíveis ou serviços? Nossa equipe está à disposição.'}
          </p>
        </div>

        <div className="space-y-6 relative z-10">
          {/* WhatsApp */}
          <a 
            href={formattedWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <MessageCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">WhatsApp</h4>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'en' ? 'Fast support on chat' : language === 'es' ? 'Atención rápida por chat' : 'Atendimento rápido no chat'}
              </p>
              <span className="inline-block text-xs font-bold text-luxury-gold mt-2 hover:underline">
                +{globalWhatsApp}
              </span>
            </div>
          </a>

          {/* Email */}
          <a 
            href={`mailto:${globalEmail}`}
            className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
          >
            <div className="p-3 bg-luxury-gold/10 text-luxury-gold rounded-xl group-hover:scale-110 transition-transform">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">E-mail</h4>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'en' ? 'Detailed requests and partnerships' : language === 'es' ? 'Propuestas y dudas detalladas' : 'Dúvidas comerciais e propostas'}
              </p>
              <span className="inline-block text-xs font-bold text-luxury-gold mt-2 hover:underline">
                {globalEmail}
              </span>
            </div>
          </a>

          {/* Localização */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'en' ? 'Headquarters' : language === 'es' ? 'Sede' : 'Localização'}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Tatuí, São Paulo, Brasil
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário (Col 7) */}
      <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="font-display font-extrabold text-2xl text-slate-900">
            {language === 'en' ? 'Send a message' : language === 'es' ? 'Envíe un mensaje' : 'Envie uma mensagem'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'en' ? 'Fill out the form below and we will contact you shortly.' : language === 'es' ? 'Complete el formulario y nos comunicaremos con usted a la brevedad.' : 'Preencha os campos abaixo e entraremos em contato o mais rápido possível.'}
          </p>
        </div>

        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-2xl border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span>
              {language === 'en' ? 'Message sent successfully!' : language === 'es' ? '¡Mensaje enviado con éxito!' : 'Mensagem enviada com sucesso! Entraremos em contato em breve.'}
            </span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-800 text-sm font-semibold rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {language === 'en' ? 'Full Name' : language === 'es' ? 'Nombre Completo' : 'Nome Completo'}
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder={language === 'en' ? 'John Doe' : language === 'es' ? 'Juan Pérez' : 'Ex: João da Silva'}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* E-mail */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                E-mail
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="Ex: joao@email.com"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {language === 'en' ? 'Phone Number' : language === 'es' ? 'Teléfono' : 'Telefone'}
              </label>
              <input
                type="text"
                {...register("phone")}
                placeholder="Ex: (11) 99999-9999"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Imóvel de Interesse */}
          {properties && properties.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {language === 'en' ? 'Property of Interest' : language === 'es' ? 'Propiedad de Interés' : 'Imóvel de Interesse (Opcional)'}
              </label>
              <select
                {...register("propertyId")}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-950 cursor-pointer"
              >
                <option value="">
                  {language === 'en' ? 'Select a property...' : language === 'es' ? 'Seleccione una propiedad...' : 'Selecione um imóvel...'}
                </option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {language === 'en' && prop.titleEn ? prop.titleEn : language === 'es' && prop.titleEs ? prop.titleEs : prop.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mensagem */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {language === 'en' ? 'Message' : language === 'es' ? 'Mensaje' : 'Mensagem'}
            </label>
            <textarea
              rows={4}
              {...register("message")}
              placeholder={language === 'en' ? 'Describe your inquiry...' : language === 'es' ? 'Escriba su mensaje...' : 'Digite sua mensagem em detalhes...'}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-none text-slate-950"
            />
            {errors.message && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.message.message}</p>
            )}
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-luxury-charcoal text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-luxury-bronze transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {language === 'en' ? 'Sending...' : language === 'es' ? 'Enviando...' : 'Enviando...'}
              </>
            ) : (
              <>
                <Send size={16} />
                {language === 'en' ? 'Send Message' : language === 'es' ? 'Enviar Mensaje' : 'Enviar Mensagem'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}