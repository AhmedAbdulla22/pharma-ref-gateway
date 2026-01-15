"use client"

import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, AlertTriangle, Activity, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Drug } from "@/lib/data/drugs"

interface DrugCardProps {
  drug: Drug
}

export function DrugCard({ drug }: DrugCardProps) {
  const { language, t, isRTL } = useLanguage()

  // Safety helper to get content based on language with fallbacks
  const getLangContent = (field: any) => {
    if (!field) return null
    return field[language] || field["en"] || null
  }

  const getDrugName = (name: string | { en: string; ar: string; ku: string }) => {
    if (!name) return "Unknown Drug"
    if (typeof name === "string") return name
    return name[language] || name["en"] || "Unknown Drug"
  }

  const getScientificName = () => {
    return drug.scientificName || drug.genericName || "N/A"
  }

  // Fallback text for missing data
  const noDataText = {
    ar: "غير متوفر",
    ku: "بەردەست نییە",
    en: "Not available"
  }[language]

  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className={`flex items-start justify-between gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`space-y-1 ${isRTL ? "text-right" : ""}`}>
            <CardTitle className="text-xl">{getDrugName(drug.name)}</CardTitle>
            <p className="text-sm text-muted-foreground font-mono">{getScientificName()}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {drug.category || "General"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Common Uses */}
        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-sm font-medium ${isRTL ? "flex-row-reverse" : ""}`}>
            <Pill className="h-4 w-4 text-primary" />
            <span>{t("commonUses")}</span>
          </div>
          <div className={`flex flex-wrap gap-1.5 ${isRTL ? "justify-end" : ""}`}>
            {getLangContent(drug.uses) ? (
              getLangContent(drug.uses).slice(0, 3).map((use: string, index: number) => (
                <Badge key={index} variant="outline" className="font-normal">
                  {use}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">{noDataText}</span>
            )}
          </div>
        </div>

        {/* Side Effects */}
        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-sm font-medium ${isRTL ? "flex-row-reverse" : ""}`}>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>{t("sideEffects")}</span>
          </div>
          <div className={`flex flex-wrap gap-1.5 ${isRTL ? "justify-end" : ""}`}>
            {getLangContent(drug.sideEffects) ? (
              <>
                {getLangContent(drug.sideEffects).slice(0, 2).map((effect: string, index: number) => (
                  <Badge key={index} variant="outline" className="font-normal text-muted-foreground">
                    {effect}
                  </Badge>
                ))}
                {getLangContent(drug.sideEffects).length > 2 && (
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    +{getLangContent(drug.sideEffects).length - 2}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">{noDataText}</span>
            )}
          </div>
        </div>

        {/* Dosage */}
        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-sm font-medium ${isRTL ? "flex-row-reverse" : ""}`}>
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>{t("dosage")}</span>
          </div>
          <p className={`text-sm text-muted-foreground line-clamp-2 ${isRTL ? "text-right" : ""}`}>
            {getLangContent(drug.dosage) || noDataText}
          </p>
        </div>

        {/* View Details Button */}
        <div className="mt-auto pt-4">
          <Link href={`/drug/${drug.id || '#'}`}>
            <Button variant="outline" className={`w-full gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              {t("viewDetails")}
              <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}