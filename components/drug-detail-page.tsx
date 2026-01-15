"use client"

import { useEffect, useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, AlertTriangle, Activity, AlertCircle, ArrowLeft, QrCode, Loader2 } from "lucide-react"
import Link from "next/link"

interface Drug {
  id: string
  name: string | { en: string; ar: string; ku: string }
  genericName: string
  category: string
  description: { en: string; ar: string; ku: string }
  uses: { en: string[]; ar: string[]; ku: string[] }
  sideEffects: { en: string[]; ar: string[]; ku: string[] }
  dosage: { en: string; ar: string; ku: string }
  warnings: { en: string[]; ar: string[]; ku: string[] }
  qrCode: string
}

interface DrugDetailPageProps {
  drugId: string
}

export function DrugDetailPage({ drugId }: DrugDetailPageProps) {
  const { language, t, isRTL } = useLanguage()
  const [drug, setDrug] = useState<Drug | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDrug = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/drug-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ drugName: drugId, language }),
        })

        const data = await response.json()

        if (data.found && data.drug) {
          setDrug(data.drug)
        } else {
          setError("Drug not found")
        }
      } catch {
        setError("Failed to load drug information")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrug()
  }, [drugId, language])

  const getDrugName = (name: string | { en: string; ar: string; ku: string }) => {
    if (typeof name === "string") return name
    return name[language]
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto text-center py-20">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">
            {language === "en"
              ? "Loading drug information..."
              : language === "ar"
                ? "جاري تحميل معلومات الدواء..."
                : "زانیاری دەرمان بارکراوە..."}
          </p>
        </div>
      </PageWrapper>
    )
  }

  if (error || !drug) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto text-center py-20">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-muted-foreground mb-4">{error || "Drug not found"}</p>
          <Link href="/search">
            <Button>
              {language === "en" ? "Back to Search" : language === "ar" ? "العودة للبحث" : "گەڕانەوە بۆ گەڕان"}
            </Button>
          </Link>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link href="/search">
          <Button variant="ghost" className={`gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            {t("backToHome")}
          </Button>
        </Link>

        {/* Drug Header */}
        <Card>
          <CardHeader>
            <div className={`flex items-start justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                <CardTitle className="text-3xl">{getDrugName(drug.name)}</CardTitle>
                <p className="text-lg text-muted-foreground font-mono">{drug.genericName}</p>
                <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Badge variant="secondary" className="text-sm">
                    {drug.category}
                  </Badge>
                  <Badge variant="outline" className={`text-sm gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <QrCode className="h-3 w-3" />
                    {drug.qrCode}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          {drug.description && (
            <CardContent>
              <p className={`text-muted-foreground ${isRTL ? "text-right" : ""}`}>{drug.description[language]}</p>
            </CardContent>
          )}
        </Card>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Common Uses */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
                <Pill className="h-5 w-5 text-primary" />
                {t("commonUses")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                {drug.uses[language].map((use, index) => (
                  <li key={index} className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Side Effects */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {t("sideEffects")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                {drug.sideEffects[language].map((effect, index) => (
                  <li key={index} className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Dosage */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
                <Activity className="h-5 w-5 text-emerald-500" />
                {t("dosage")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-muted-foreground ${isRTL ? "text-right" : ""}`}>{drug.dosage[language]}</p>
            </CardContent>
          </Card>

          {/* Warnings */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
                <AlertCircle className="h-5 w-5 text-red-500" />
                {t("warnings")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                {drug.warnings[language].map((warning, index) => (
                  <li key={index} className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
