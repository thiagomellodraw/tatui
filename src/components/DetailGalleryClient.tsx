"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Grid } from "lucide-react";

interface DetailGalleryClientProps {
  images: string[];
}

export default function DetailGalleryClient({ images = [] }: DetailGalleryClientProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (images.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev! - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev! + 1));
  };

  return (
    <>
      {/* 1. GRID DESKTOP (AIRBNB STYLE - MÍNIMO 5 IMAGENS PARA GRADE COMPLETA) */}
      <div className="hidden md:grid grid-cols-12 gap-3 h-[420px] rounded-3xl overflow-hidden shadow-sm">
        {/* Foto Principal (Esquerda - Col 6) */}
        <div
          onClick={() => setActiveIdx(0)}
          className="col-span-6 relative h-full w-full overflow-hidden bg-slate-100 cursor-pointer group"
        >
          <Image
            src={images[0]}
            alt="Foto principal"
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-102"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        </div>

        {/* Fotos Secundárias (Direita - Col 6, divididas em 4 grids) */}
        <div className="col-span-6 grid grid-cols-2 gap-3 h-full">
          {[1, 2, 3, 4].map((idx) => {
            const hasImage = !!images[idx];
            return (
              <div
                key={idx}
                onClick={() => hasImage && setActiveIdx(idx)}
                className={`relative h-full w-full overflow-hidden bg-slate-100 ${
                  hasImage ? "cursor-pointer group" : "opacity-40"
                }`}
              >
                {hasImage ? (
                  <>
                    <Image
                      src={images[idx]}
                      alt={`Foto galeria ${idx}`}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-350">
                    <ImageIconPlaceholder />
                  </div>
                )}
                
                {/* Botão flutuante na última imagem do grid para abrir galeria */}
                {idx === 4 && hasImage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIdx(0);
                    }}
                    className="absolute bottom-4 right-4 bg-white/90 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md backdrop-blur-sm hover:bg-white transition-all transform active:scale-95 cursor-pointer"
                  >
                    <Grid size={14} />
                    Ver todas
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CARROSSEL MOBILE (HORIZONTAL SCROLL / SWIPE) */}
      <div className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 scrollbar-hide">
        {images.map((url, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className="snap-center shrink-0 w-[85vw] aspect-[4/3] relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-150"
          >
            <Image
              src={url}
              alt={`Galeria móvel ${idx + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
            {/* Indicador de fotos */}
            <span className="absolute bottom-4 right-4 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {idx + 1} / {images.length}
            </span>
          </div>
        ))}
      </div>

      {/* 3. LIGHTBOX PREVIEW (FULLSCREEN CAROUSEL OVERLAY) */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex flex-col justify-between p-6"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
              <span className="text-sm font-semibold">
                Galeria - {activeIdx + 1} de {images.length}
              </span>
              <button
                onClick={() => setActiveIdx(null)}
                className="p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                aria-label="Fechar galeria"
              >
                <X size={20} />
              </button>
            </div>

            {/* Slider Central */}
            <div className="relative flex-1 flex items-center justify-center py-6">
              {/* Imagem Centralizada com animação */}
              <div className="relative w-full max-w-4xl aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-2xl border border-white/5">
                <Image
                  src={images[activeIdx]}
                  alt={`Galeria visualizada ${activeIdx + 1}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Botão Anterior */}
              <button
                onClick={handlePrev}
                className="absolute left-2 md:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 text-white transition-all cursor-pointer z-10"
                aria-label="Anterior"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Botão Posterior */}
              <button
                onClick={handleNext}
                className="absolute right-2 md:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 text-white transition-all cursor-pointer z-10"
                aria-label="Próxima"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Info */}
            <div className="text-center text-white/50 text-xs py-2 font-medium">
              Use as setas laterais ou toque para navegar. Tatu� Curadoria.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Icon placeholder
function ImageIconPlaceholder() {
  return (
    <svg
      className="w-8 h-8 opacity-20"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2555/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
