import { db } from "@/lib/db";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import HomeSearchForm from "@/components/HomeSearchForm";
import PromoBanners from "@/components/PromoBanners";
import FAQAccordion from "@/components/FAQAccordion";
import { cookies } from "next/headers";
import {
  Compass,
  Award,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Flame,
  Waves,
  Sun,
  Laptop,
} from "lucide-react";

import { getActiveTenantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value || "pt") as "pt" | "en" | "es";

  const tenantId = await getActiveTenantId();
  const config = await db.config.findUnique({ where: { tenantId } });

  const featuredProperties = await db.property.findMany({
    where: { active: true, featured: true, tenantId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const featuredIds = featuredProperties.map((p) => p.id);
  const recentProperties = await db.property.findMany({
    where: {
      active: true,
      featured: false,
      tenantId,
      id: { notIn: featuredIds.length > 0 ? featuredIds : ["none"] },
    },
    orderBy: { createdAt: "desc" },
    take: Math.max(0, 6 - featuredProperties.length),
  });

  const allHomeProperties = [...featuredProperties, ...recentProperties];

  const activeCities = await db.property.findMany({
    where: { active: true, tenantId },
    select: { city: true },
    distinct: ["city"],
    take: 4,
  });

  const activeBanners = await db.promoBanner.findMany({
    where: { active: true, tenantId },
    orderBy: { order: "asc" },
  });

  const activeFaqs = await db.fAQ.findMany({
    where: { active: true, tenantId },
    orderBy: { order: "asc" },
  });

  const heroBg = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80";

  const advantages = [
    {
      title: lang === "en" ? "Rigorous Curation" : lang === "es" ? "Curaduría Rigurosa" : "Curadoria Rigorosa",
      description:
        lang === "en"
          ? "Only high-standard properties that meet strict comfort, design, and location requirements."
          : lang === "es"
          ? "Sólo propiedades de alto nivel que cumplen con estrictos requisitos de confort, diseño y ubicación."
          : "Apenas imóveis de alto padrão que cumprem exigências rígidas de conforto, design e localização.",
      icon: Award,
    },
    {
      title: lang === "en" ? "Prime Support" : lang === "es" ? "Atención Prime" : "Atendimento Prime",
      description:
        lang === "en"
          ? "Personalized support before, during, and after your stay to ensure absolute peace of mind."
          : lang === "es"
          ? "Soporte personalizado antes, durante y después de su estancia para garantizar tranquilidad absoluta."
          : "Suporte personalizado antes, durante e após a sua estadia para garantir tranquilidade absoluta.",
      icon: HeartHandshake,
    },
    {
      title: lang === "en" ? "Guaranteed Safety" : lang === "es" ? "Seguridad Garantizada" : "Segurança Garantizada",
      description:
        lang === "en"
          ? "Transactions and bookings verified on world-leading partner platforms."
          : lang === "es"
          ? "Transacciones y reservas verificadas en plataformas asociadas líderes en el mercado mundial."
          : "Transações e reservas verificadas em plataformas parceiras líderes de mercado mundial.",
      icon: ShieldCheck,
    },
  ];

  const experiences = [
    {
      title: lang === "en" ? "Beachfront" : lang === "es" ? "Frente al Mar" : "Pé na Areia",
      desc: lang === "en" ? "Houses and villas facing the sea" : lang === "es" ? "Casas y villas frente al mar" : "Casas e vilas de frente para o mar",
      icon: Sun,
      bg: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: lang === "en" ? "Mountain Retreat" : lang === "es" ? "Refugio de Montaña" : "Refúgio da Montanha",
      desc: lang === "en" ? "Cozy chalets with fireplaces" : lang === "es" ? "Cabañas acogedoras con chimenea" : "Chalés aconchegantes com lareira",
      icon: Flame,
      bg: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: lang === "en" ? "Design & Luxury" : lang === "es" ? "Diseño y Lujo" : "Design & Luxo",
      desc: lang === "en" ? "Penthouses and architect properties" : lang === "es" ? "Penthouses y propiedades de diseño" : "Coberturas e propriedades de arquiteto",
      icon: Waves,
      bg: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: lang === "en" ? "Prime Home Office" : lang === "es" ? "Teletrabajo Prime" : "Home Office Prime",
      desc: lang === "en" ? "Properties with high-speed internet and office" : lang === "es" ? "Propiedades con internet rápido y oficina" : "Imóveis com internet veloz e escritório",
      icon: Laptop,
      bg: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const testimonials = [
    {
      name: "Mariana Vasconcellos",
      role: lang === "en" ? "Guest at Villa Trancoso" : lang === "es" ? "Huésped de Villa Trancoso" : "Hóspede da Villa Trancoso",
      comment:
        lang === "en"
          ? "An extraordinary experience! The property in Trancoso is impeccable, with amazing service. The redirecting booking process was super fast and secure. I highly recommend it."
          : lang === "es"
          ? "¡Una experiencia extraordinaria! La propiedad en Trancoso es impecable, con un servicio increíble. Lo recomiendo totalmente."
          : "Uma experiência extraordinária! O imóvel em Trancoso é impecável, com serviço incrível. O redirecionamento de reserva foi super rápido e seguro. Recomendo de olhos fechados.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
    },
    {
      name: "Roberto Albuquerque",
      role: lang === "en" ? "Guest at Ipanema Penthouse" : lang === "es" ? "Huésped de Penthouse Ipanema" : "Hóspede da Cobertura Ipanema",
      comment:
        lang === "en"
          ? "The curation is spectacular. The triplex penthouse in Ipanema is even better than in the photos."
          : lang === "es"
          ? "La curaduría es espectacular. El penthouse triplex en Ipanema es aún mejor que en las fotos."
          : "A curadoria é espetacular. A cobertura triplex em Ipanema é ainda melhor do que nas fotos. O atendimento nos deu total confiança desde o primeiro contato.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    },
  ];

  const displayHeroTitle =
    lang === "en" && config?.heroTitleEn
      ? config.heroTitleEn
      : lang === "es" && config?.heroTitleEs
      ? config.heroTitleEs
      : config?.heroTitle;

  const displayHeroSubtitle =
    lang === "en" && config?.heroSubtitleEn
      ? config.heroSubtitleEn
      : lang === "es" && config?.heroSubtitleEs
      ? config.heroSubtitleEs
      : config?.heroSubtitle;

  return (
    <div className="space-y-24 md:space-y-32">
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center -mt-24 md:-mt-28 overflow-hidden bg-luxury-charcoal">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-[10000ms] animate-float opacity-80"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-luxury-charcoal" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center text-white flex flex-col items-center pt-20">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-luxury-gold mb-6 animate-fade-in">
            <Compass size={14} className="animate-spin" style={{ animationDuration: "12s" }} />
            {lang === "en" ? "Exclusive Curation" : lang === "es" ? "Curaduría Exclusiva" : "Curadoria Exclusiva"}
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-tight max-w-4xl text-white mb-6 drop-shadow-md animate-fade-up">
            {displayHeroTitle}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-250 max-w-2xl font-light mb-12 drop-shadow-sm animate-fade-up delay-100">
            {displayHeroSubtitle}
          </p>
          <div className="w-full max-w-4xl animate-fade-up delay-200">
            <HomeSearchForm cities={activeCities.map((c) => c.city)} />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-gray-300 animate-fade-in delay-300">
            <span>{lang === "en" ? "Popular destinations:" : lang === "es" ? "Destinos populares:" : "Destinos populares:"}</span>
            {activeCities.map((item) => (
              <Link
                key={item.city}
                href={`/imoveis?city=${encodeURIComponent(item.city)}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 hover:border-white/30 transition-all"
              >
                {item.city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* IMÓVEIS EM DESTAQUE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-luxury-bronze uppercase block mb-2 font-semibold">
              {lang === "en" ? "Special Selection" : lang === "es" ? "Selección Especial" : "Seleção Especial"}
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 leading-tight">
              {lang === "en" ? "Featured Retreats" : lang === "es" ? "Refugios Destacados" : "Refúgios em Destaque"}
            </h2>
            <p className="text-gray-500 text-sm mt-2 font-normal">
              {lang === "en"
                ? "Hand-picked properties for the most exclusive experiences"
                : lang === "es"
                ? "Propiedades seleccionadas para las experiencias más exclusivas"
                : "Imóveis selecionados para as experiências mais exclusivas"}
            </p>
          </div>
          <Link
            href="/imoveis"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-luxury-bronze hover:text-luxury-gold transition-colors pb-1 border-b border-luxury-bronze hover:border-luxury-gold shrink-0"
          >
            {lang === "en" ? "View all properties" : lang === "es" ? "Ver todas las propiedades" : "Ver todos os imóveis"}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {allHomeProperties.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {lang === "en" ? "No properties available at the moment." : lang === "es" ? "Ninguna propiedad disponible en este momento." : "Nenhum imóvel disponível no momento."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allHomeProperties.slice(0, 6).map((prop, idx) => (
                <PropertyCard key={prop.id} property={prop} index={idx} />
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Link
                href="/imoveis"
                className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-luxury-charcoal text-luxury-charcoal text-xs font-bold uppercase tracking-wider rounded-full hover:bg-luxury-charcoal hover:text-white transition-all duration-300 shadow-sm"
              >
                {lang === "en" ? "Explore All Properties" : lang === "es" ? "Explorar Todas las Propiedades" : "Explorar Todos os Imóveis"}
                <span>→</span>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* BANNERS PROMOCIONAIS */}
      {activeBanners.length > 0 && (
        <div className="pt-8">
          <PromoBanners banners={activeBanners} />
        </div>
      )}

      {/* POR QUE NOS ESCOLHER */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold tracking-widest text-luxury-bronze uppercase block mb-2 font-semibold">
              {lang === "en" ? "Why Choose Us" : lang === "es" ? "Diferenciales" : "Diferenciais"}
            </span>
            <h2 className="font-display font-extrabold text-3xl text-gray-900">
              {lang === "en" ? "The Tatuí Experience" : lang === "es" ? "La Experiencia Tatuí" : "A Experiência Tatuí"}
            </h2>
            <p className="text-gray-500 text-sm mt-3 font-semibold leading-relaxed">
              {lang === "en"
                ? "We offer more than accommodation. We create the perfect conditions for your best travel memories."
                : lang === "es"
                ? "Ofrecemos más que alojamiento. Creamos las condiciones perfectas para sus mejores recuerdos de viaje."
                : "Oferecemos mais do que hospedagem. Criamos as condições perfeitas para suas melhores memórias de viagem."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {advantages.map((adv) => {
              const Icon = adv.icon;
              return (
                <div key={adv.title} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-luxury-cream text-luxury-bronze mb-6 group-hover:bg-luxury-charcoal group-hover:text-white transition-all duration-550 shadow-sm border border-gray-100">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-gray-950 mb-3">{adv.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-sm">{adv.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ESTILOS DE HOSPEDAGEM */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold tracking-widest text-luxury-bronze uppercase block mb-2 font-semibold">
            {lang === "en" ? "Inspiration" : lang === "es" ? "Inspiración" : "Inspiração"}
          </span>
          <h2 className="font-display font-extrabold text-3xl text-gray-900">
            {lang === "en" ? "Lodging Styles" : lang === "es" ? "Estilos de Alojamiento" : "Estilos de Hospedagem"}
          </h2>
          <p className="text-gray-500 text-sm mt-3 font-semibold leading-relaxed">
            {lang === "en"
              ? "Choose the ideal property based on your preferred lifestyle experiences."
              : lang === "es"
              ? "Elija la propiedad ideal según sus experiencias de estilo de vida preferidas."
              : "Escolha o imóvel ideal com base nas experiências de lifestyle de sua preferência."}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((exp) => {
            const Icon = exp.icon;
            return (
              <div key={exp.title} className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-end p-6 border border-gray-150">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105" style={{ backgroundImage: `url(${exp.bg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />
                <div className="relative z-10 text-white space-y-2">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-luxury-gold mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white">{exp.title}</h3>
                  <p className="text-xs text-gray-300 font-light">{exp.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="bg-luxury-charcoal text-white py-24 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-20%] w-[60%] aspect-square rounded-full bg-luxury-gold/5 blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold tracking-widest text-luxury-gold uppercase block mb-2 font-semibold">
              {lang === "en" ? "Reviews" : lang === "es" ? "Opiniones" : "Avaliações"}
            </span>
            <h2 className="font-display font-extrabold text-3xl text-white">
              {lang === "en" ? "Guest Approved" : lang === "es" ? "Aprobado por Huéspedes" : "Quem já se hospedou aprova"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {testimonials.map((test) => (
              <div key={test.name} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-6 flex flex-col justify-between">
                <p className="text-gray-300 text-sm leading-relaxed italic font-light">"{test.comment}"</p>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-luxury-gold/30">
                    <img src={test.avatar} alt={test.name} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{test.name}</h4>
                    <p className="text-[11px] text-luxury-gold font-semibold uppercase tracking-wider">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQAccordion faqs={activeFaqs} />

      {/* CTA FINAL */}
      <section className="max-w-5xl mx-auto px-6 text-center py-10 mb-10">
        <div className="glass-card bg-luxury-cream p-12 md:p-16 rounded-3xl border border-gray-250 flex flex-col items-center gap-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[30%] aspect-square rounded-full bg-luxury-gold/5 blur-[80px]" />
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 max-w-xl leading-tight">
            {lang === "en" ? "Ready to find your perfect retreat?" : lang === "es" ? "¿Listo para encontrar su refugio ideal?" : "Pronto para encontrar seu refúgio ideal?"}
          </h2>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed font-semibold">
            {lang === "en"
              ? "Browse our complete list of selected properties and choose the perfect accommodation for your next stay."
              : lang === "es"
              ? "Explore nuestra lista completa de propiedades seleccionadas y elija el alojamiento perfecto para su próxima estadía."
              : "Navegue por nossa lista completa de imóveis selecionados e escolha a acomodação perfeita para sua próxima temporada."}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Link href="/imoveis" className="w-full sm:w-auto px-8 py-3.5 bg-luxury-charcoal text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-luxury-bronze transition-all shadow-md text-center">
              {lang === "en" ? "View Available Properties" : lang === "es" ? "Ver Propiedades Disponibles" : "Ver Imóveis Disponíveis"}
            </Link>
            <Link href="/contato" className="w-full sm:w-auto px-8 py-3.5 border border-gray-300 bg-white text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider hover:border-luxury-charcoal transition-all text-center">
              {lang === "en" ? "Contact Us" : lang === "es" ? "Contáctenos" : "Fale Conosco"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
