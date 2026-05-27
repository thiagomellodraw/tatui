"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface PromoBannersProps {
  banners: {
    id: string;
    title: string;
    titleEn: string | null;
    titleEs: string | null;
    subtitle: string | null;
    subtitleEn: string | null;
    subtitleEs: string | null;
    imageUrl: string;
    linkUrl: string | null;
  }[];
}

export default function PromoBanners({ banners }: PromoBannersProps) {
  const { language } = useLanguage();

  if (banners.length === 0) return null;

  const getLocalizedBanner = (banner: PromoBannersProps["banners"][0]) => {
    let title = banner.title;
    let subtitle = banner.subtitle;

    if (language === "en") {
      title = banner.titleEn || banner.title;
      subtitle = banner.subtitleEn || banner.subtitle;
    } else if (language === "es") {
      title = banner.titleEs || banner.title;
      subtitle = banner.subtitleEs || banner.subtitle;
    }

    return { title, subtitle };
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {banners.map((banner) => {
          const { title, subtitle } = getLocalizedBanner(banner);
          const content = (
            <div className="group relative w-full h-[260px] md:h-[320px] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-end p-6 md:p-8 cursor-pointer border border-slate-100">
              {/* Background Image */}
              <div className="absolute inset-0 bg-slate-200">
                <Image
                  src={banner.imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent group-hover:from-slate-950/95 transition-all duration-300" />
              
              {/* Text Content */}
              <div className="relative z-10 space-y-2 text-white">
                <span className="inline-block text-[10px] md:text-xs bg-luxury-gold text-slate-950 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mb-2">
                  {language === 'en' ? 'Offer' : language === 'es' ? 'Oferta' : 'Destaque'}
                </span>
                <h3 className="font-display font-bold text-lg md:text-2xl text-white tracking-tight leading-tight group-hover:text-luxury-gold transition-colors">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs md:text-sm text-slate-200 font-light leading-relaxed">
                    {subtitle}
                  </p>
                )}
                {banner.linkUrl && (
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-luxury-gold uppercase tracking-wider group-hover:gap-2.5 transition-all">
                    {language === 'en' ? 'Explore offer' : language === 'es' ? 'Explorar oferta' : 'Aproveitar Oferta'}
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            </div>
          );

          if (banner.linkUrl) {
            return (
              <Link href={banner.linkUrl} key={banner.id} className="block">
                {content}
              </Link>
            );
          }

          return <div key={banner.id}>{content}</div>;
        })}
      </div>
    </section>
  );
}
