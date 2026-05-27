"use client";

import { useState } from "react";
import { logExternalClick } from "@/app/actions/properties";
import {
  Phone,
  ArrowRight,
  Share2,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface BookingCardClientProps {
  propertyId: string;
  title: string;
  priceFrom: number | null;
  externalBookingUrl: string;
  whatsappUrl?: string | null;
}

export default function BookingCardClient({
  propertyId,
  title,
  priceFrom,
  externalBookingUrl,
  whatsappUrl,
}: BookingCardClientProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { language, t } = useLanguage();

  const formattedPrice = priceFrom
    ? new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(priceFrom)
    : null;

  // Tratar clique em Reservar Agora
  const handleBookingClick = async () => {
    setLoading(true);
    try {
      // 1. Chamar Server Action para incrementar estatística de cliques
      await logExternalClick(propertyId, title);
    } catch (e) {
      console.error("Erro ao registrar clique de reserva:", e);
    } finally {
      setLoading(false);
      // 2. Redirecionar para URL de reserva externa em nova aba
      window.open(externalBookingUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Copiar link do imóvel para área de transferência
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Erro ao copiar link:", e);
    }
  };

  // Compartilhar via WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      language === 'en'
        ? `Look at this spectacular vacation property at Tatu�: ${title}\n\nCheck out details here:\n${window.location.href}`
        : language === 'es'
          ? `Mira esta espectacular propiedad de temporada en Tatu�: ${title}\n\nMira los detalles aquí:\n${window.location.href}`
          : `Olha que imóvel espetacular para temporada no Tatu�: ${title}\n\nConfira todos os detalhes no link:\n${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="glass-card bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-md space-y-6">
      {/* Preço */}
      <div className="border-b border-slate-100 pb-4">
        {formattedPrice ? (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              {t("property.priceFrom")}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-slate-900">{formattedPrice}</span>
              <span className="text-xs text-gray-500 font-medium"> {t("property.perNight")}</span>
            </div>
          </div>
        ) : (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
              {language === 'en' ? 'Daily rates' : language === 'es' ? 'Tarifas diarias' : 'Valores diários'}
            </span>
            <span className="text-xl font-bold text-luxury-bronze mt-1 block">
              {language === 'en' ? 'On Request' : language === 'es' ? 'Bajo Consulta' : 'Sob Consulta'}
            </span>
          </div>
        )}
      </div>

      {/* Ações de Reserva */}
      <div className="space-y-3">
        {/* Botão Principal: Reservar Agora */}
        <button
          onClick={handleBookingClick}
          disabled={loading}
          className="w-full py-4 bg-luxury-charcoal text-white hover:bg-luxury-bronze font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed group"
        >
          <span>{t("property.bookNow")}</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Botão Secundário: WhatsApp */}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 border border-slate-200 hover:border-slate-800 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Phone size={14} className="text-emerald-500" />
            {language === 'en' ? 'Questions on WhatsApp' : language === 'es' ? 'Dudas en WhatsApp' : 'Dúvidas no WhatsApp'}
          </a>
        )}
      </div>

      {/* Microcopy de Aviso */}
      <div className="flex gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] leading-relaxed text-gray-500 font-medium">
        <Info size={14} className="text-luxury-bronze shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-700 text-xs">
            {language === 'en' ? 'Secure External Booking' : language === 'es' ? 'Reserva Externa Segura' : 'Reserva Externa Segura'}
          </p>
          <p className="mt-0.5 text-[10px]">
            {t("property.externalBookingText")}
          </p>
        </div>
      </div>

      {/* Compartilhar Imóvel */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {t("property.share")}
        </span>
        <div className="flex gap-2.5">
          {/* Copiar Link */}
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 border border-slate-100 hover:border-slate-350 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-500" />
                {language === 'en' ? 'Copied' : language === 'es' ? 'Copiado' : 'Copiado'}
              </>
            ) : (
              <>
                <Copy size={12} />
                {language === 'en' ? 'Copy Link' : language === 'es' ? 'Copiar Enlace' : 'Copiar Link'}
              </>
            )}
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 border border-slate-100 hover:border-slate-350 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 size={12} />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
