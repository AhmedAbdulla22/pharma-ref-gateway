"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, CheckCircle, Zap, X, Loader2, Plus, Search, ChevronDown } from "lucide-react"

interface Interaction {
  severity: "critical" | "moderate" | "minor"
  title: { en: string; ar: string; ku: string }
  description: { en: string; ar: string; ku: string }
  recommendations: { en: string[]; ar: string[]; ku: string[] }
}

interface InteractionResult {
  interactions: Interaction[]
  overallRisk: "critical" | "moderate" | "minor" | "safe" | "unknown" | "error"
  summary: { en: string; ar: string; ku: string }
  disclaimer: { en: string; ar: string; ku: string }
}

interface Drug {
  id: string
  name: string
  scientificName: string
  category: string
}

interface DrugSearchInputProps {
  value: string
  onChange: (value: string, drug?: Drug) => void
  placeholder: string
  isRTL: boolean
  language: string
  index: number
}

function DrugSearchInput({ value, onChange, placeholder, isRTL, language, index }: DrugSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState(value)
  const [searchResults, setSearchResults] = useState<Drug[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearchQuery(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsOpen(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch("/api/drug-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, language }),
      })
      
      const data = await response.json()
      setSearchResults(data.drugs || [])
      setIsOpen(true)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onChange(newValue) // Update parent state immediately
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(newValue)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const handleSelectDrug = (drug: Drug) => {
    setSearchQuery(drug.name)
    onChange(drug.name, drug)
    setIsOpen(false)
    setSearchResults([])
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchResults.length > 0 && setIsOpen(true)}
          className="flex-1 pr-10"
          dir={isRTL ? "rtl" : "ltr"}
        />
        <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2`}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className={`absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto ${isRTL ? 'text-right' : ''}`}>
          {searchResults.map((drug, idx) => (
            <button
              key={`${drug.id}-${idx}`}
              className={`w-full px-3 py-2 hover:bg-muted transition-colors flex items-center justify-between ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
              onClick={() => handleSelectDrug(drug)}
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{drug.name}</div>
                <div className="text-xs text-muted-foreground">{drug.scientificName}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground rotate-270" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function InteractionChecker() {
  const { language, t, isRTL } = useLanguage()
  const [drugs, setDrugs] = useState<{ name: string; drug?: Drug }[]>([{ name: "" }, { name: "" }])
  const [result, setResult] = useState<InteractionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateDrug = (index: number, value: string, drug?: Drug) => {
    const newDrugs = [...drugs]
    newDrugs[index] = { name: value, drug }
    setDrugs(newDrugs)
  }

  const addDrug = () => {
    if (drugs.length < 5) {
      setDrugs([...drugs, { name: "" }])
    }
  }

  const removeDrug = (index: number) => {
    if (drugs.length > 2) {
      setDrugs(drugs.filter((_, i) => i !== index))
    }
  }

  const checkInteraction = async () => {
    const filledDrugs = drugs.filter((d) => d.name.trim())
    if (filledDrugs.length < 2) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/drug-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          drugs: filledDrugs.map(d => d.name), 
          language 
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setResult(null)
      } else {
        setResult(data)
      }
    } catch {
      setError("Failed to check interactions. Please try again.")
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSelection = () => {
    setDrugs([{ name: "" }, { name: "" }])
    setResult(null)
    setError(null)
  }

  const getSeverityConfig = (severity: "critical" | "moderate" | "minor" | "safe" | "unknown" | "error") => {
    switch (severity) {
      case "critical":
        return {
          icon: AlertTriangle,
          label: t("critical"),
          desc: t("criticalDesc"),
          className: "bg-critical text-critical-foreground",
          borderClass: "border-critical",
          badgeVariant: "destructive" as const,
        }
      case "moderate":
        return {
          icon: AlertCircle,
          label: t("moderate"),
          desc: t("moderateDesc"),
          className: "bg-moderate text-moderate-foreground",
          borderClass: "border-moderate",
          badgeVariant: "secondary" as const,
        }
      case "minor":
        return {
          icon: AlertCircle,
          label: language === "en" ? "Minor" : language === "ar" ? "طفيف" : "کەم",
          desc: language === "en" ? "Low risk interaction" : language === "ar" ? "تفاعل منخفض الخطورة" : "کاریلێکی کەم خەتەر",
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          borderClass: "border-yellow-300 dark:border-yellow-700",
          badgeVariant: "outline" as const,
        }
      case "safe":
        return {
          icon: CheckCircle,
          label: t("safe"),
          desc: t("safeDesc"),
          className: "bg-safe text-safe-foreground",
          borderClass: "border-safe",
          badgeVariant: "outline" as const,
        }
      case "unknown":
        return {
          icon: AlertCircle,
          label: language === "en" ? "Unknown" : language === "ar" ? "غير معروف" : "نەزانراو",
          desc: language === "en" ? "Insufficient data" : language === "ar" ? "بيانات غير كافية" : "زانیاری پێویست نییە",
          className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          borderClass: "border-gray-300 dark:border-gray-600",
          badgeVariant: "outline" as const,
        }
      case "error":
        return {
          icon: AlertTriangle,
          label: language === "en" ? "Error" : language === "ar" ? "خطأ" : "هەڵە",
          desc: language === "en" ? "Analysis failed" : language === "ar" ? "فشل التحليل" : "شیکاری سەرکەوتوو نەبو",
          className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          borderClass: "border-red-300 dark:border-red-700",
          badgeVariant: "destructive" as const,
        }
      default:
        return {
          icon: CheckCircle,
          label: t("safe"),
          desc: t("safeDesc"),
          className: "bg-safe text-safe-foreground",
          borderClass: "border-safe",
          badgeVariant: "outline" as const,
        }
    }
  }

  const filledDrugsCount = drugs.filter((d) => d.name.trim()).length

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Zap className="h-5 w-5 text-primary" />
          {t("interactionChecker")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drug Inputs */}
        <div className="space-y-3">
          {drugs.map((drug, index) => (
            <div key={index} className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <DrugSearchInput
                value={drug.name}
                onChange={(value, selectedDrug) => updateDrug(index, value, selectedDrug)}
                placeholder={
                  language === "en"
                    ? `Drug ${index + 1} (e.g., Aspirin, Ibuprofen)`
                    : language === "ar"
                      ? `الدواء ${index + 1} (مثل: أسبرين، إيبوبروفين)`
                      : `دەرمان ${index + 1} (وەک: ئەسپرین، ئیبوپروفین)`
                }
                isRTL={isRTL}
                language={language}
                index={index}
              />
              {drugs.length > 2 && (
                <Button variant="outline" size="icon" onClick={() => removeDrug(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {drugs.length < 5 && (
            <Button variant="outline" onClick={addDrug} className={`w-full gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Plus className="h-4 w-4" />
              {language === "en" ? "Add another drug" : language === "ar" ? "أضف دواء آخر" : "دەرمانێکی تر زیاد بکە"}
            </Button>
          )}
        </div>

        {/* Check Button */}
        <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button
            onClick={checkInteraction}
            disabled={filledDrugsCount < 2 || isLoading}
            className={`flex-1 h-12 text-base ${filledDrugsCount >= 2 && !isLoading ? "animate-pulse-ring" : ""}`}
          >
            {isLoading ? <Loader2 className={`h-5 w-5 ${isRTL ? 'ms-2' : 'me-2'} animate-spin`} /> : <Zap className={`h-5 w-5 ${isRTL ? 'ms-2' : 'me-2'}`} />}
            {isLoading
              ? language === "en"
                ? "Checking..."
                : language === "ar"
                  ? "جاري الفحص..."
                  : "پشکنین..."
              : t("checkInteractions")}
          </Button>
          {filledDrugsCount > 0 && (
            <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent" onClick={clearSelection}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-center">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">
              {language === "en"
                ? "Analyzing drug interactions..."
                : language === "ar"
                  ? "جاري تحليل التفاعلات الدوائية..."
                  : "شیکاری کارلێکی دەرمانەکان..."}
            </p>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="pt-4 border-t space-y-4">
            {/* Overall Risk */}
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <h4 className="text-sm font-medium">{t("interactionResult")}</h4>
              <Badge variant={getSeverityConfig(result.overallRisk).badgeVariant}>
                {getSeverityConfig(result.overallRisk).label}
              </Badge>
            </div>

            {/* Summary */}
            <div className={`p-4 rounded-lg bg-muted/50 border ${isRTL ? "text-right" : ""}`}>
              <p className="text-sm">{result.summary[language]}</p>
            </div>

            {/* Individual Interactions */}
            {result.interactions.map((interaction, index) => {
              const config = getSeverityConfig(interaction.severity)
              const Icon = config.icon

              return (
                <div key={index} className={`rounded-lg border-2 ${config.borderClass} overflow-hidden`}>
                  <div
                    className={`${config.className} px-4 py-2 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-bold">{interaction.title[language]}</span>
                  </div>
                  <div className={`p-4 bg-card space-y-3 ${isRTL ? "text-right" : ""}`}>
                    <p className="text-sm leading-relaxed">{interaction.description[language]}</p>
                    {interaction.recommendations[language].length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {language === "en" ? "Recommendations:" : language === "ar" ? "التوصيات:" : "پێشنیارەکان:"}
                        </p>
                        <ul className={`text-sm space-y-1 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                          {interaction.recommendations[language].map((rec, i) => (
                            <li key={i} className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <span className="text-muted-foreground">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* AI Disclaimer */}
            {result.disclaimer && (
              <div className={`p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 ${isRTL ? "text-right" : ""}`}>
                <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                      {language === "en" ? "AI Analysis Disclaimer" : language === "ar" ? "إخلاء مسؤولية التحليل الذكي" : "بێبەشکردنەوەی شیکاری هوشی دەستکرد"}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                      {result.disclaimer[language]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
