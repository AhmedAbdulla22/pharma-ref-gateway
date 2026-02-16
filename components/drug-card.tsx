"use client"

import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Beaker, Pill, Activity } from "lucide-react"
import Link from "next/link"

export interface DrugCardData {
  id: string
  name: string 
  scientificName: string
  category: string | { en: string; ar: string; ku: string }
  dosage?: { en: string; ar: string; ku: string } | string
}

interface DrugCardProps {
  drug: DrugCardData
}

export function DrugCard({ drug }: DrugCardProps) {
  const { language, t, isRTL } = useLanguage()

  const getContent = (field: any) => {
    if (!field) return null
    if (typeof field === "string") return field === "N/A" ? null : field
    return field[language] || field["en"] || Object.values(field)[0] || null
  }

  const dosageText = getContent(drug.dosage)
  const categoryText = getContent(drug.category) || "GENERAL"

  return (
    <Card 
      dir={isRTL ? "rtl" : "ltr"} // <--- THIS FIXES THE LAYOUT AUTOMATICALLY
      className="group relative h-full flex flex-col justify-between overflow-hidden border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:border-cyan-500/30 transition-all duration-300 shadow-lg"
    >
      
      {/* Hover Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

      <CardContent className="relative p-5 space-y-4 z-10 flex-1">
        
        {/* Top Row: Icon & Category */}
        <div className="flex justify-between items-start">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-500 shrink-0">
            <Pill className="h-5 w-5" />
          </div>
          <Badge 
            variant="outline" 
            className="max-w-[50%] truncate border-slate-700 text-[10px] text-slate-400 font-mono tracking-wider bg-slate-950/50 uppercase"
          >
            {categoryText}
          </Badge>
        </div>

        {/* Drug Names */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors" title={drug.name}>
            {drug.name}
          </h3>
          
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Beaker className="h-3 w-3 shrink-0" />
            <span className="font-mono uppercase tracking-tight truncate w-full" title={drug.scientificName}>
              {drug.scientificName}
            </span>
          </div>
        </div>

        {/* Dosage / Form Pill (New Design) */}
        {dosageText && (
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              <Activity className="h-3 w-3 text-cyan-600" />
              <span className="text-[10px] text-slate-400 font-medium uppercase truncate max-w-[150px]">
                {dosageText}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer Button */}
      <CardFooter className="relative p-5 pt-0 z-10">
        <Link href={`/drug/${encodeURIComponent(drug.name)}`} className="w-full">
          <Button 
            variant="ghost"
            className="w-full justify-between bg-slate-900/50 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/30 text-slate-300 group-hover:text-white transition-all"
          >
            <span className="text-xs font-bold uppercase tracking-widest">{t("viewDetails")}</span>
            {/* Arrow flips automatically because of the 'dir' attribute on the Card */}
            <ArrowRight className="h-4 w-4 text-cyan-500 transition-transform duration-300 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}