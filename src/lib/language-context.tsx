"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const LANGUAGES = [
  { code: "en-IN", name: "English", short: "EN" },
  { code: "hi-IN", name: "Hindi", short: "HI" },
  { code: "kn-IN", name: "Kannada", short: "KN" },
  { code: "ta-IN", name: "Tamil", short: "TA" },
  { code: "te-IN", name: "Telugu", short: "TE" },
  { code: "bn-IN", name: "Bengali", short: "BN" },
  { code: "mr-IN", name: "Marathi", short: "MR" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en-IN",
  setLanguage: () => {},
  isEnglish: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en-IN");

  useEffect(() => {
    const saved = localStorage.getItem("preferred-language") as LanguageCode | null;
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("preferred-language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isEnglish: language === "en-IN" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
