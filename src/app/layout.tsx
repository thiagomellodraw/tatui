import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tatu� | Aluguel de Temporada Premium",
  description: "Encontre os melhores imóveis de temporada selecionados para quem busca sofisticação, conforto e experiências memoráveis.",
  keywords: ["aluguel de temporada", "luxo", "casas de praia", "chalés de montanha", "hospedagem premium"],
  openGraph: {
    title: "Tatu� | Hospedagens de Temporada Premium",
    description: "Imóveis exclusivos selecionados com curadoria de alto padrão.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${displayFont.variable} ${sansFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#faf9f6] text-[#111827]">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
