import Link from "next/link";
import { Compass, Home, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] text-slate-800 px-6 py-12 relative overflow-hidden text-center">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-luxury-gold/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] aspect-square rounded-full bg-luxury-bronze/5 blur-[120px]" />
      </div>

      <div className="max-w-md space-y-6 relative z-10 animate-fade-up">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-luxury-cream text-luxury-bronze flex items-center justify-center border border-gray-200 shadow-sm mx-auto animate-float">
          <Compass size={28} className="text-luxury-bronze" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold tracking-widest text-luxury-bronze uppercase">
            Erro 404
          </span>
          <h1 className="font-display font-extrabold text-3xl text-gray-900 leading-tight">
            Refúgio Não Encontrado
          </h1>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed font-semibold mx-auto">
            A página que você tentou acessar não existe ou foi removida temporariamente do Tatu�.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full justify-center">
          <Link
            href="/"
            className="px-5 py-3 bg-luxury-charcoal text-white hover:bg-luxury-bronze font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2"
          >
            <Home size={14} />
            Voltar ao Início
          </Link>
          <Link
            href="/imoveis"
            className="px-5 py-3 border border-gray-300 bg-white text-gray-700 hover:border-luxury-charcoal font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Ver Imóveis
          </Link>
        </div>
      </div>
    </main>
  );
}
