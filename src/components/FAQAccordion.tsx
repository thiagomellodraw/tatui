"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface FAQAccordionProps {
  faqs: {
    id: string;
    question: string;
    questionEn: string | null;
    questionEs: string | null;
    answer: string;
    answerEn: string | null;
    answerEs: string | null;
  }[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const { language, t } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const getLocalizedFaq = (faq: FAQAccordionProps["faqs"][0]) => {
    let question = faq.question;
    let answer = faq.answer;

    if (language === "en") {
      question = faq.questionEn || faq.question;
      answer = faq.answerEn || faq.answer;
    } else if (language === "es") {
      question = faq.questionEs || faq.question;
      answer = faq.answerEs || faq.answer;
    }

    return { question, answer };
  };

  if (faqs.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 border-t border-b border-slate-100 animate-fade-in">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight">
            {t("faq.title")}
          </h2>
          <p className="mt-3 text-slate-500 text-sm md:text-base max-w-xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const { question, answer } = getLocalizedFaq(faq);
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none group cursor-pointer"
                >
                  <span className="font-display font-semibold text-slate-900 text-sm md:text-base pr-4 group-hover:text-luxury-bronze transition-colors">
                    {question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400 group-hover:text-slate-900 shrink-0"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-0 border-t border-slate-50/50">
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                          {answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
