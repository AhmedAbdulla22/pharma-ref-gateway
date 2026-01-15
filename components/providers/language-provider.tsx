"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Language, translations, type TranslationKey } from "@/lib/i18n/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
  dir: "ltr" | "rtl"
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("pharma-language", lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl"
  }

  useEffect(() => {
    const saved = localStorage.getItem("pharma-language") as Language | null
    if (saved && ["en", "ar", "ku"].includes(saved)) {
      setLanguage(saved)
    }
  }, [])

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key
  }

  const dir = language === "en" ? "ltr" : "rtl"
  const isRTL = language !== "en"

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
