import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { Award, HeartHandshake, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "Sobre Nós | Tatuí" };
}

export default async function SobrePage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value || "pt") as "pt" | "en" | "es";

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Sobre */}
      <section className="relative bg-luxury-charcoal text-white py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-charcoal/70 via-luxury-charcoal/60 to-luxury-charcoal" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-extrabold tracking-widest text-luxury-gold uppercase block mb-4">
            {lang === "en" ? "Our Story" : lang === "es" ? "Nuestra Historia" : "Nossa História"}
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-white leading-tight mb-6">
            {lang === "en" ? "About Tatuí" : lang === "es" ? "Sobre Tatuí" : "Sobre a Tatuí"}
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
            {lang === "en"
              ? "Founded with the purpose of redefining the seasonal rental experience, Tatuí was born from the desire to connect demanding travelers with the country's most spectacular properties."
              : lang === "es"
              ? "Fundada con el propósito de redefinir la experiencia de alquiler por temporada, Tatuí nació del deseo de conectar a viajeros exigentes con las propiedades más espectaculares del país."
              : "Fundada com o propósito de redefinir a experiência de aluguel por temporada, a Tatuí nasceu do desejo de conectar viajantes exigentes aos imóveis mais espetaculares do país."}
          </p>
        </div>
      </section>

      {/* Missão e Valores */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: Award,
              title: lang === "en" ? "Our Mission" : lang === "es" ? "Nuestra Misión" : "Nossa Missão",
              text: lang === "en"
                ? "To offer the most exclusive and carefully curated temporary accommodation experience in the country."
                : lang === "es"
                ? "Ofrecer la experiencia de alojamiento temporal más exclusiva y cuidadosamente seleccionada del país."
                : "Oferecer a experiência de hospedagem temporária mais exclusiva e cuidadosamente curada do país.",
            },
            {
              icon: HeartHandshake,
              title: lang === "en" ? "Our Values" : lang === "es" ? "Nuestros Valores" : "Nossos Valores",
              text: lang === "en"
                ? "Excellence, transparency, personalized service and the constant pursuit of unique experiences for each guest."
                : lang === "es"
                ? "Excelencia, transparencia, atención personalizada y búsqueda constante de experiencias únicas para cada huésped."
                : "Excelência, transparência, atendimento personalizado e busca constante por experiências únicas para cada hóspede.",
            },
            {
              icon: ShieldCheck,
              title: lang === "en" ? "Our Vision" : lang === "es" ? "Nuestra Visión" : "Nossa Visão",
              text: lang === "en"
                ? "To be the leading reference in luxury vacation rentals, connecting travelers to destinations that inspire."
                : lang === "es"
                ? "Ser la referencia líder en alquileres vacacionales de lujo, conectando viajeros con destinos que inspiran."
                : "Ser a referência líder em aluguel de temporada premium, conectando viajantes a destinos que inspiram.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center group hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-luxury-cream text-luxury-bronze flex items-center justify-center mx-auto mb-5 group-hover:bg-luxury-charcoal group-hover:text-white transition-all">
                  <Icon size={22} />
                </div>
                <h3 className="font-display font-bold text-lg text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-luxury-charcoal rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40%] aspect-square rounded-full bg-luxury-gold/5 blur-[80px]" />
          <h2 className="font-display font-extrabold text-3xl mb-4 relative z-10">
            {lang === "en" ? "Ready to start your experience?" : lang === "es" ? "¿Listo para comenzar su experiencia?" : "Pronto para começar sua experiência?"}
          </h2>
          <p className="text-gray-400 text-sm mb-8 relative z-10">
            {lang === "en" ? "Explore our properties and book through our trusted partner platforms." : lang === "es" ? "Explore nuestras propiedades y reserve a través de nuestras plataformas asociadas de confianza." : "Explore nossos imóveis e reserve pelas nossas plataformas parceiras de confiança."}
          </p>
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-luxury-gold text-luxury-charcoal font-bold text-xs uppercase tracking-wider rounded-full hover:bg-luxury-bronze hover:text-white transition-all relative z-10"
          >
            {lang === "en" ? "Browse Properties" : lang === "es" ? "Ver Propiedades" : "Ver Imóveis"}
            <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
