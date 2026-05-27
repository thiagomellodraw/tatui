'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { i18n, Language } from '@/lib/i18n';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');
  const router = useRouter();

  useEffect(() => {
    // Load saved language
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['pt', 'en', 'es'].includes(savedLang)) {
      setLanguageState(savedLang);
    } else {
      // Check browser language
      const browserLang = navigator.language.slice(0, 2);
      if (['pt', 'en', 'es'].includes(browserLang)) {
        setLanguageState(browserLang as Language);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Also store in cookie for server-side compatibility
    document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let current: any = i18n[language];
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to Portuguese dictionary if key not found in current language
        let fallback: any = i18n['pt'];
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // return the path as key if totally missing
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    return typeof current === 'string' ? current : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
