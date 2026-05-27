import { db } from "@/lib/db";
import { cookies } from "next/headers";
import ContactForm from "@/components/ContactForm";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "Contato | Tatuí" };
}

export default async function ContatoPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value || "pt") as "pt" | "en" | "es";

  const config = await db.config.findUnique({ where: { id: "global" } });
  const properties = await db.property.findMany({
    where: { active: true },
    select: { id: true, title: true, titleEn: true, titleEs: true },
    orderBy: { title: "asc" },
  });

  const whatsapp = config?.whatsappNumber ?? "5511999999999";
  const email = config?.contactEmail ?? "contato@tatui.com.br";
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá! Gostaria de mais informações sobre os imóveis de temporada.")}`;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-extrabold tracking-widest text-luxury-bronze uppercase block mb-2">
          {lang === "en" ? "Get in Touch" : lang === "es" ? "Contáctenos" : "Fale Conosco"}
        </span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl text-gray-900 leading-tight mb-4">
          {lang === "en" ? "We're here to help" : lang === "es" ? "Estamos aquí para ayudar" : "Estamos aqui para ajudar"}
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          {lang === "en"
            ? "Send us a message or talk directly via WhatsApp. Our team is ready to find the perfect retreat for you."
            : lang === "es"
            ? "Envíenos un mensaje o hable directamente por WhatsApp. Nuestro equipo está listo para encontrar el refugio perfecto para usted."
            : "Envie-nos uma mensagem ou fale diretamente pelo WhatsApp. Nossa equipe está pronta para encontrar o refúgio perfeito para você."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <ContactForm properties={properties} globalWhatsApp={whatsapp} globalEmail={email} />
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-gray-900">
              {lang === "en" ? "Contact Information" : lang === "es" ? "Información de Contacto" : "Informações de Contato"}
            </h2>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-luxury-cream text-luxury-bronze flex items-center justify-center shrink-0">
                <MessageCircle size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">WhatsApp</p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-800 hover:text-luxury-bronze transition-colors">
                  +{whatsapp}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-luxury-cream text-luxury-bronze flex items-center justify-center shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">E-mail</p>
                <a href={`mailto:${email}`} className="text-sm font-semibold text-gray-800 hover:text-luxury-bronze transition-colors">
                  {email}
                </a>
              </div>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-md text-sm"
          >
            <MessageCircle size={18} />
            {lang === "en" ? "Chat on WhatsApp" : lang === "es" ? "Chatear en WhatsApp" : "Conversar no WhatsApp"}
          </a>
        </div>
      </div>
    </div>
  );
}
