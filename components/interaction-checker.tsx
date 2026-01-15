"use client"

import { useState } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, CheckCircle, Zap, X, Loader2, Plus } from "lucide-react"

interface Interaction {
  severity: "critical" | "moderate" | "safe"
  title: { en: string; ar: string; ku: string }
  description: { en: string; ar: string; ku: string }
  recommendations: { en: string[]; ar: string[]; ku: string[] }
}

interface InteractionResult {
  interactions: Interaction[]
  overallRisk: "critical" | "moderate" | "safe"
  summary: { en: string; ar: string; ku: string }
}

export function InteractionChecker() {
  const { language, t, isRTL } = useLanguage()
  const [drugs, setDrugs] = useState<string[]>(["", ""])
  const [result, setResult] = useState<InteractionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateDrug = (index: number, value: string) => {
    const newDrugs = [...drugs]
    newDrugs[index] = value
    setDrugs(newDrugs)
  }

  const addDrug = () => {
    if (drugs.length < 5) {
      setDrugs([...drugs, ""])
    }
  }

  const removeDrug = (index: number) => {
    if (drugs.length > 2) {
      setDrugs(drugs.filter((_, i) => i !== index))
    }
  }

  const checkInteraction = async () => {
    const filledDrugs = drugs.filter((d) => d.trim())
    if (filledDrugs.length < 2) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/drug-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs: filledDrugs, language }),
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
    setDrugs(["", ""])
    setResult(null)
    setError(null)
  }

  const getSeverityConfig = (severity: "critical" | "moderate" | "safe") => {
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
      case "safe":
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

  const filledDrugsCount = drugs.filter((d) => d.trim()).length

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
              <Input
                placeholder={
                  language === "en"
                    ? `Drug ${index + 1} (e.g., Aspirin, Ibuprofen)`
                    : language === "ar"
                      ? `الدواء ${index + 1} (مثل: أسبرين، إيبوبروفين)`
                      : `دەرمان ${index + 1} (وەک: ئەسپرین، ئیبوپروفین)`
                }
                value={drug}
                onChange={(e) => updateDrug(index, e.target.value)}
                className="flex-1"
                dir={isRTL ? "rtl" : "ltr"}
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
            {isLoading ? <Loader2 className="h-5 w-5 me-2 animate-spin" /> : <Zap className="h-5 w-5 me-2" />}
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
                        <ul className={`text-sm space-y-1 ${isRTL ? "mr-4" : "ml-4"}`}>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
