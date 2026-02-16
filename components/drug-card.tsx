"use client"

import { useState } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Beaker, Pill, Activity, Search, Loader2 } from "lucide-react"
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
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false)

  const handleFindSimilar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoadingSimilar) return
    
    setIsLoadingSimilar(true)
    try {
      // Navigate to search page with similar drugs query
      const searchQuery = encodeURIComponent(`similar to ${drug.name}`)
      window.open(`/search?q=${searchQuery}`, '_blank')
    } catch (error) {
      console.error('Failed to find similar drugs:', error)
    } finally {
      setIsLoadingSimilar(false)
    }
  }

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
      className="group relative h-full flex flex-col justify-between overflow-hidden border-border bg-card/40 hover:bg-card/60 hover:border-primary/30 transition-all duration-300 shadow-lg"
    >
      
      {/* Hover Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

      <CardContent className="relative p-5 space-y-4 z-10 flex-1">
        
        {/* Top Row: Icon & Category */}
        <div className="flex justify-between items-start">
          <div className="p-2 rounded-lg bg-muted border-border text-primary shrink-0">
            <Pill className="h-5 w-5" />
          </div>
          <Badge 
            variant="outline" 
            className="max-w-[50%] truncate border-border text-[10px] text-muted-foreground font-mono tracking-wider bg-card/50 uppercase"
          >
            {categoryText}
          </Badge>
        </div>

        {/* Drug Names */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors" title={drug.name}>
            {drug.name}
          </h3>
          
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Beaker className="h-3 w-3 shrink-0" />
            <span className="font-mono uppercase tracking-tight truncate w-full" title={drug.scientificName}>
              {drug.scientificName}
            </span>
          </div>
        </div>

        {/* Dosage / Form Pill (New Design) */}
        {dosageText && (
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/80 border-border">
              <Activity className="h-3 w-3 text-cyan-600" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase truncate max-w-[150px]">
                {dosageText}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer Buttons */}
      <CardFooter className="relative p-5 pt-0 z-10 space-y-2">
        <Link href={`/drug/${encodeURIComponent(drug.name)}`} className="w-full">
          <Button 
            variant="ghost"
            className="w-full justify-between bg-card/50 hover:bg-accent/30 border-border hover:border-primary/30 text-muted-foreground group-hover:text-foreground transition-all"
          >
            <span className="text-xs font-bold uppercase tracking-widest">{t("viewDetails")}</span>
            {/* Arrow flips automatically because of the 'dir' attribute on the Card */}
            <ArrowRight className="h-4 w-4 text-cyan-500 transition-transform duration-300 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Button>
        </Link>
        
        <Button
          onClick={handleFindSimilar}
          disabled={isLoadingSimilar}
          variant="outline"
          size="sm"
          className={`w-full gap-2 border-border hover:bg-accent/30 text-xs ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {isLoadingSimilar ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Search className="h-3 w-3" />
          )}
          {language === "en" ? "Find Similar" : 
           language === "ar" ? "ابحث عن مشابه" : 
           "دۆزینەوەی هاوشێوە"}
        </Button>
      </CardFooter>
    </Card>
  )
}