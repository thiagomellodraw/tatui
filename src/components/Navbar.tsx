"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface NavbarProps {
  brandName?: string;
  whatsappNumber?: string;
}

export default function Navbar({ brandName = "Tatu�", whatsappNumber = "5511999999999" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  // Apenas a home tem hero escuro — nas outras páginas o fundo é sempre claro
  const isHomePage = pathname === "/";
  // Efeito transparente só ativo na home E sem scroll
  const isTransparent = isHomePage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.properties"), path: "/imoveis" },
    { label: t("nav.about"), path: "/sobre" },
    { label: t("nav.contact"), path: "/contato" },
  ];

  // Se estiver no admin, não exibe navbar pública
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const formattedWhatsApp = `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de mais informações sobre os imóveis de temporada.`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isTransparent
            ? "py-5 bg-transparent"
            : "py-3 glass-nav shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <img
              src="/logo.png"
              alt={brandName}
              className={`h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:opacity-90 ${
                isTransparent ? "brightness-0 invert" : ""
              }`}
            />
          </Link>

          {/* Links para Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative text-sm font-medium tracking-wide transition-colors py-1 ${
                    isTransparent
                      ? "text-white/90 hover:text-white"
                      : "text-gray-800 hover:text-luxury-bronze"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-luxury-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA e Idioma para Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {/* Seletor de Idiomas */}
            <div className={`flex items-center gap-1 backdrop-blur-sm p-1 rounded-full border transition-all duration-300 ${
              isTransparent
                ? "bg-white/10 border-white/20"
                : "bg-white/60 border-gray-200/80"
            }`}>
              {(['pt', 'en', 'es'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
                    language === lang
                      ? "bg-luxury-charcoal text-luxury-cream shadow-sm"
                      : isTransparent
                        ? "text-white/70 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <a
              href={formattedWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-luxury-charcoal text-luxury-cream text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-luxury-bronze hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm"
            >
              <Phone size={14} />
              {t("contact.talkWhatsapp")}
            </a>
          </div>

          {/* Botão Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 transition-colors focus:outline-none ${
              isTransparent ? "text-white hover:text-luxury-gold" : "text-gray-800 hover:text-luxury-bronze"
            }`}
            aria-label="Abrir menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white md:hidden pt-28 px-6 flex flex-col justify-between pb-12 overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link
                      href={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`text-2xl font-display font-bold tracking-wide ${
                        isActive ? "text-luxury-bronze" : "text-gray-800"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-6 mt-8"
            >
              {/* Language Selector Mobile */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold text-center">
                  Idioma / Language / Idioma
                </span>
                <div className="flex items-center justify-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/60 w-full">
                  {(['pt', 'en', 'es'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                        language === lang
                          ? "bg-luxury-charcoal text-luxury-cream shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {lang === 'pt' ? 'PT' : lang === 'en' ? 'EN' : 'ES'}
                    </button>
                  ))}
                </div>
              </div>

              <a
                href={formattedWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-luxury-charcoal text-white rounded-xl font-bold tracking-wide shadow-md"
              >
                <Phone size={18} />
                WhatsApp
              </a>
              <p className="text-center text-xs text-gray-500">
                Tatu� - Hospedagens Premium
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
