"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, CheckCircle, Zap, X, Loader2, Plus, Search, ChevronDown, ShieldCheck } from "lucide-react"

// --- TYPES ---
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
  onRemove?: () => void
  placeholder: string
  isRTL: boolean
  language: string
  index: number
}

// --- COMPONENT: Drug Search Input ---
function DrugSearchInput({ value, onChange, onRemove, placeholder, isRTL, language, index }: DrugSearchInputProps) {
  // Initialize state with prop, but don't strictly sync it on every render to avoid cursor jumps
  const [searchQuery, setSearchQuery] = useState(value)
  const [searchResults, setSearchResults] = useState<Drug[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null) // FIXED: Use ref for debounce

  // Sync internal state if parent changes it externally (e.g. "Clear All" button)
  useEffect(() => {
    if (value !== searchQuery) {
      setSearchQuery(value)
    }
  }, [value])

  // Handle click outside to close dropdown
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
      setIsSearching(false)
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
    onChange(newValue, undefined) // Notify parent that strict drug selection is cleared
    
    // FIXED: Proper debounce logic
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      handleSearch(newValue)
    }, 500) // Increased to 500ms for better performance
  }

  const handleSelectDrug = (drug: Drug) => {
    setSearchQuery(drug.name)
    onChange(drug.name, drug) // Pass the full drug object
    setIsOpen(false)
    setSearchResults([])
  }

  return (
    <div className="flex gap-2 w-full" ref={dropdownRef}>
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchResults.length > 0) setIsOpen(true)
          }}
          className={`flex-1 ${isRTL ? 'pl-10' : 'pr-10'}`} // Fix padding based on RTL
          dir={isRTL ? "rtl" : "ltr"}
        />
        
        {/* Search Icon / Loader */}
        <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 pointer-events-none`}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Dropdown Results */}
        {isOpen && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((drug, idx) => (
              <button
                key={`${drug.id}-${idx}`}
                className={`w-full px-4 py-2.5 hover:bg-muted/80 transition-colors flex items-center justify-between group ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                onClick={() => handleSelectDrug(drug)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{drug.name}</div>
                  <div className="text-xs text-muted-foreground truncate opacity-80 group-hover:opacity-100">{drug.scientificName}</div>
                </div>
                {/* <ChevronDown className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                <Plus className="h-3 w-3 text-muted-foreground/50" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Remove Button (Moved inside the component to handle layout better) */}
      {onRemove && (
        <Button variant="outline" size="icon" onClick={onRemove} className="shrink-0">
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  )
}

// --- MAIN COMPONENT ---
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
    // Clear results if user changes input, forcing them to re-check
    if (result) setResult(null)
  }

  const addDrug = () => {
    if (drugs.length < 5) {
      setDrugs([...drugs, { name: "" }])
    }
  }

  const removeDrug = (index: number) => {
    if (drugs.length > 2) {
      const newDrugs = drugs.filter((_, i) => i !== index)
      setDrugs(newDrugs)
      setResult(null)
    } else {
      // If only 2 drugs, just clear the field instead of removing the row
      updateDrug(index, "")
    }
  }

  const checkInteraction = async () => {
    const filledDrugs = drugs.filter((d) => d.name.trim())
    
    if (filledDrugs.length < 2) {
      setError(language === "en" ? "Please enter at least two medications." : language === "ar" ? "يرجى إدخال دواءين على الأقل." : "تکایە لانی کەم دوو دەرمان داخل بکە.")
      return
    }

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

  // FIXED: Logic was returning objects in default case incorrectly
  const getSeverityConfig = (severity: string) => {
    const s = severity?.toLowerCase()
    
    switch (s) {
      case "critical":
      case "high": // Handle potential AI variations
      case "major":
        return {
          icon: AlertTriangle,
          label: t("critical"),
          className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          borderClass: "border-red-500",
          badgeVariant: "destructive" as const,
        }
      case "moderate":
      case "medium":
        return {
          icon: AlertCircle,
          label: t("moderate"),
          className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
          borderClass: "border-amber-500",
          badgeVariant: "secondary" as const, // Changed to secondary (usually gray/orange) vs default
        }
      case "minor":
      case "low":
        return {
          icon: CheckCircle, // Changed icon for minor
          label: language === "en" ? "Minor" : language === "ar" ? "طفيف" : "کەم",
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          borderClass: "border-blue-400",
          badgeVariant: "outline" as const,
        }
      case "safe":
      case "none":
        return {
          icon: ShieldCheck,
          label: t("safe"),
          className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          borderClass: "border-green-500",
          badgeVariant: "outline" as const,
        }
      case "unknown":
        return {
          icon: AlertCircle,
          label: language === "en" ? "Unknown" : language === "ar" ? "غير معروف" : "نەزانراو",
          className: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
          borderClass: "border-gray-400",
          badgeVariant: "outline" as const,
        }
      default:
        // Fallback for "error" or unmapped types
        return {
          icon: AlertTriangle,
          label: language === "en" ? "Attention" : language === "ar" ? "تنبيه" : "ئاگاداری",
          className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          borderClass: "border-gray-300",
          badgeVariant: "secondary" as const,
        }
    }
  }

  const filledDrugsCount = drugs.filter((d) => d.name.trim()).length

  return (
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader className="pb-4 border-b">
        <CardTitle className={`flex items-center gap-2.5 text-xl ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          {t("interactionChecker")}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Drug Inputs */}
        <div className="space-y-3">
          {drugs.map((drug, index) => (
            <DrugSearchInput
              key={index} // Note: Using index as key is okay for simple inputs, ideally use unique IDs
              index={index}
              value={drug.name}
              onChange={(value, selectedDrug) => updateDrug(index, value, selectedDrug)}
              onRemove={drugs.length > 2 ? () => removeDrug(index) : undefined}
              placeholder={
                language === "en"
                  ? `Drug ${index + 1} (e.g., Aspirin)`
                  : language === "ar"
                    ? `الدواء ${index + 1} (مثل: أسبرين)`
                    : `دەرمان ${index + 1} (وەک: ئەسپرین)`
              }
              isRTL={isRTL}
              language={language}
            />
          ))}

          {drugs.length < 5 && (
            <Button 
              variant="ghost" 
              onClick={addDrug} 
              className={`w-full gap-2 border border-dashed border-border hover:border-primary/50 h-12 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <Plus className="h-4 w-4" />
              {language === "en" ? "Add another drug" : language === "ar" ? "أضف دواء آخر" : "دەرمانێکی تر زیاد بکە"}
            </Button>
          )}
        </div>

        {/* Check Button */}
        <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button
            onClick={checkInteraction}
            disabled={filledDrugsCount < 2 || isLoading}
            className={`flex-1 h-12 text-base font-semibold shadow-md transition-all ${filledDrugsCount >= 2 && !isLoading ? "bg-primary hover:bg-primary/90" : ""}`}
          >
            {isLoading ? <Loader2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} /> : <Zap className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
            {isLoading
              ? language === "en" ? "Analyzing..." : language === "ar" ? "جاري التحليل..." : "شیکردنەوە..."
              : t("checkInteractions")}
          </Button>
          
          {filledDrugsCount > 0 && (
            <Button 
              variant="outline" 
              className="h-12 px-4 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50" 
              onClick={clearSelection}
              title="Clear all"
            >
              {language === "en" ? "Reset" : language === "ar" ? "إعادة تعيين" : "سڕینەوە"}
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && !isLoading && (
          <div className="pt-6 border-t animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Overall Status Badge */}
            <div className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
              <h4 className="text-lg font-bold">{t("interactionResult")}</h4>
              <Badge 
                variant={getSeverityConfig(result.overallRisk).badgeVariant}
                className="px-3 py-1 text-sm uppercase tracking-wide"
              >
                {getSeverityConfig(result.overallRisk).label}
              </Badge>
            </div>

            {/* AI Summary Box */}
            <div className={`p-5 rounded-xl bg-muted/40 border border-border/50 mb-6 ${isRTL ? "text-right" : ""}`}>
              <p className="text-sm leading-relaxed text-foreground/90">{result.summary[language]}</p>
            </div>

            {/* Interactions List */}
            <div className="space-y-4">
              {result.interactions.map((interaction, index) => {
                const config = getSeverityConfig(interaction.severity)
                const Icon = config.icon

                return (
                  <div key={index} className={`rounded-xl border overflow-hidden bg-card ${config.borderClass} shadow-sm transition-all hover:shadow-md`}>
                    {/* Header */}
                    <div className={`${config.className} px-4 py-3 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="font-bold text-sm md:text-base">{interaction.title[language]}</span>
                    </div>
                    
                    {/* Body */}
                    <div className={`p-5 space-y-4 ${isRTL ? "text-right" : ""}`}>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {interaction.description[language]}
                      </p>
                      
                      {interaction.recommendations[language].length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 opacity-70">
                            {language === "en" ? "Recommendation" : language === "ar" ? "التوصيات" : "پێشنیار"}
                          </p>
                          <ul className={`text-sm space-y-1.5 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                            {interaction.recommendations[language].map((rec, i) => (
                              <li key={i} className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                                <span className="text-primary mt-1">•</span>
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
            </div>

            {/* Disclaimer */}
            {result.disclaimer && (
              <div className={`mt-6 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg ${isRTL ? "flex-row-reverse text-right" : ""}`}>
                <AlertTriangle className="h-4 w-4 shrink-0 opacity-70 mt-0.5" />
                <p>{result.disclaimer[language]}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}