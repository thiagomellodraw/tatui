"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, ArrowUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface FooterProps {
  brandName?: string;
  whatsappNumber?: string;
  contactEmail?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  footerText?: string;
  footerTextEn?: string | null;
  footerTextEs?: string | null;
}

export default function Footer({
  brandName = "Tatu�",
  whatsappNumber = "5511999999999",
  contactEmail = "contato@luxehaventemporada.com.br",
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  footerText = "© 2026 Tatu�. Todos os direitos reservados. As reservas são concluídas em plataformas parceiras.",
  footerTextEn,
  footerTextEs,
}: FooterProps) {
  const pathname = usePathname();
  const { language, t } = useLanguage();

  // Ocultar rodapé no painel de administração
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const formattedWhatsApp = `https://wa.me/${whatsappNumber}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayFooterText = language === 'en' && footerTextEn ? footerTextEn : (language === 'es' && footerTextEs ? footerTextEs : footerText);

  return (
    <footer className="bg-luxury-charcoal text-gray-400 pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Coluna 1: Sobre */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="group flex items-center gap-2">
            <img
              src="/logo.png"
              alt={brandName}
              className="h-12 w-auto object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <p className="text-sm leading-relaxed text-gray-400 mt-2 font-normal">
            {language === 'en' 
              ? 'Exclusive curation of premium vacation properties. Experience memorable moments with absolute comfort, security, and style.' 
              : language === 'es' 
                ? 'Curaduría exclusiva de propiedades vacacionales de primera calidad. Viva momentos memorables con total confort, seguridad y estilo.' 
                : 'Curadoria exclusiva de imóveis de temporada premium. Vivencie momentos memoráveis com total conforto, segurança e estilo.'}
          </p>
        </div>

        {/* Coluna 2: Links Rápidos */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-semibold font-display text-sm uppercase tracking-wider">
            {t("footer.explore")}
          </h4>
          <nav className="flex flex-col gap-2 text-sm font-semibold">
            <Link href="/" className="hover:text-luxury-gold transition-colors">
              {t("nav.home")}
            </Link>
            <Link href="/imoveis" className="hover:text-luxury-gold transition-colors">
              {t("nav.properties")}
            </Link>
            <Link href="/sobre" className="hover:text-luxury-gold transition-colors">
              {t("nav.about")}
            </Link>
            <Link href="/contato" className="hover:text-luxury-gold transition-colors">
              {t("nav.contact")}
            </Link>
          </nav>
        </div>

        {/* Coluna 3: Contato */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-semibold font-display text-sm uppercase tracking-wider">
            {t("footer.contact")}
          </h4>
          <ul className="flex flex-col gap-3 text-sm font-semibold">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-luxury-gold" />
              <a href={formattedWhatsApp} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                +{whatsappNumber}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-luxury-gold" />
              <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                {contactEmail}
              </a>
            </li>
          </ul>
        </div>

        {/* Coluna 4: Redes Sociais */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-semibold font-display text-sm uppercase tracking-wider">
            {t("footer.socials")}
          </h4>
          <div className="flex items-center gap-3">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
            {language === 'en' 
              ? '*Bookings are operated on partner platforms like Airbnb, Booking, or via direct WhatsApp.' 
              : language === 'es' 
                ? '*Las reservas se realizan en plataformas asociadas como Airbnb, Booking o por WhatsApp directo.' 
                : '*As reservas são operadas em plataformas parceiras como Airbnb, Booking ou via WhatsApp direto.'}
          </p>
        </div>
      </div>

      {/* Formas de Pagamento */}
      <div className="max-w-7xl mx-auto px-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-800/60 pt-8 text-xs">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {t("footer.payment")}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {/* Pix */}
          <div className="w-11 h-7 bg-white/5 border border-white/10 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-default" title="Pix">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 3 12l9 9 9-9-9-9Z" />
              <path d="m12 8-4 4 4 4 4-4-4-4Z" />
            </svg>
          </div>
          {/* Visa */}
          <div className="w-11 h-7 bg-white/5 border border-white/10 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all font-display text-[9px] font-black italic tracking-widest cursor-default select-none" title="Visa">
            VISA
          </div>
          {/* Mastercard */}
          <div className="w-11 h-7 bg-white/5 border border-white/10 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-default" title="Mastercard">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="12" r="4.5" fill="currentColor" fillOpacity="0.4" />
              <circle cx="15" cy="12" r="4.5" fill="currentColor" fillOpacity="0.6" />
            </svg>
          </div>
          {/* Amex */}
          <div className="w-11 h-7 bg-white/5 border border-white/10 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all font-display text-[8px] font-extrabold tracking-tighter cursor-default select-none" title="American Express">
            AMEX
          </div>
          {/* Apple Pay */}
          <div className="w-11 h-7 bg-white/5 border border-white/10 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all font-sans text-[8px] font-bold tracking-tight flex items-center gap-0.5 cursor-default select-none" title="Apple Pay">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z"/>
            </svg>
            Pay
          </div>
          {/* Google Pay */}
          <div className="w-11 h-7 bg-white/5 border border-white/10 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all font-sans text-[8px] font-bold tracking-tight flex items-center gap-0.5 cursor-default select-none" title="Google Pay">
            <span className="text-[9px] font-black text-white">G</span>Pay
          </div>
        </div>
      </div>

      {/* Faixa Inferior */}
      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <p className="text-center md:text-left text-gray-500 leading-relaxed font-semibold">
          {displayFooterText}
        </p>
        <button
          onClick={scrollToTop}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-800 hover:border-luxury-gold hover:text-white transition-all text-gray-500 font-bold"
        >
          {language === 'en' ? 'Back to top' : language === 'es' ? 'Volver arriba' : 'Voltar ao topo'}
          <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </footer>
  );
}
