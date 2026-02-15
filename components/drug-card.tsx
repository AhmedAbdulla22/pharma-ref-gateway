"use client"

import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Beaker, Pill } from "lucide-react"
import Link from "next/link"

export interface DrugCardData {
  id: string
  name: string 
  scientificName: string
  category: string
  dosage?: { en: string; ar: string; ku: string } | string
}

interface DrugCardProps {
  drug: DrugCardData
}

export function DrugCard({ drug }: DrugCardProps) {
  const { language, t, isRTL } = useLanguage()

  // Safe content getter that avoids "N/A" spam
  const getContent = (field: any) => {
    if (!field) return null
    if (typeof field === "string") return field === "N/A" ? null : field
    return field[language] || field["en"] || null
  }

  const dosageText = getContent(drug.dosage)

  return (
    <Card className="group relative h-full flex flex-col justify-between overflow-hidden border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:border-cyan-500/30 transition-all duration-500 shadow-lg">
      
      {/* Background Gradient Blob on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

      <CardContent className="relative p-6 space-y-5 z-10">
        
        {/* Top Row: Category Badge */}
        <div className={`flex justify-between items-start ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-500`}>
            <Pill className="h-5 w-5" />
          </div>
          <Badge 
            variant="outline" 
            className="max-w-[140px] truncate border-slate-700 text-[10px] text-slate-400 font-mono tracking-wider bg-slate-950/50"
          >
            {drug.category || "GENERAL"}
          </Badge>
        </div>

        {/* Main Info */}
        <div className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors" title={drug.name}>
            {drug.name}
          </h3>
          
          <div className={`flex items-center gap-2 text-slate-500 text-xs ${isRTL ? "flex-row-reverse" : ""}`}>
            <Beaker className="h-3 w-3 shrink-0" />
            <span className="font-mono uppercase tracking-tight line-clamp-1" title={drug.scientificName}>
              {drug.scientificName}
            </span>
          </div>
        </div>

        {/* Dosage / Form Preview */}
        {dosageText && (
          <div className={`p-3 rounded-md bg-slate-900/50 border border-slate-800/50 ${isRTL ? "text-right" : "text-left"}`}>
            <p className="text-xs text-slate-400 line-clamp-2">
              <span className="text-cyan-600 font-bold uppercase text-[10px] mr-2">Form:</span>
              {dosageText}
            </p>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="relative p-6 pt-0 z-10">
        <Link href={`/drug/${encodeURIComponent(drug.name)}`} className="w-full">
          <Button 
            variant="ghost"
            className={`w-full justify-between bg-slate-900/50 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/30 text-slate-300 group-hover:text-white transition-all ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">{t("viewDetails")}</span>
            <ArrowRight className={`h-4 w-4 text-cyan-500 transition-transform duration-300 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}