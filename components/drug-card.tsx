"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/providers/language-provider"
import { 
  ArrowRight, 
  Loader2, 
  Pill, 
  Beaker, 
  Activity,
  Sparkles,
  ShieldCheck,
  SearchX,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import Link from "next/link"
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

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
  const [showSimilar, setShowSimilar] = useState(false)
  const [similarDrugs, setSimilarDrugs] = useState<any[]>([])
  const [alternatives, setAlternatives] = useState<any[]>([])

  // --- 1. HANDLE FIND SIMILAR (Opens Sheet Immediately) ---
  const handleFindSimilar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Open sheet immediately to show loader
    setShowSimilar(true)
    
    if (isLoadingSimilar) return
    setIsLoadingSimilar(true)

    try {
      const response = await fetch('/api/similar-drugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          drugName: drug.name,
          category: drug.category,
          limit: 8
        })
      })
      
      const data = await response.json()
      setSimilarDrugs(data.similar || [])
      setAlternatives(data.alternatives || [])
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
    <>
      <Card 
        dir={isRTL ? "rtl" : "ltr"}
        className="group relative h-full flex flex-col justify-between overflow-hidden border-border bg-card hover:bg-muted/30 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-lg"
      >
        {/* Hover Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardContent className="relative p-5 space-y-4 z-10 flex-1">
          
          {/* Top Row: Icon & Category */}
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Pill className="h-5 w-5" />
            </div>
            <Badge 
              variant="secondary" 
              className="max-w-[60%] truncate border-transparent bg-muted text-[10px] text-muted-foreground font-medium tracking-wider uppercase group-hover:bg-primary/10 group-hover:text-primary transition-colors"
            >
              {categoryText}
            </Badge>
          </div>

          {/* Drug Names */}
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-2" title={drug.name}>
              {drug.name}
            </h3>
            
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Beaker className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <span className="font-mono uppercase tracking-tight truncate w-full opacity-80" title={drug.scientificName}>
                {drug.scientificName}
              </span>
            </div>
          </div>

          {/* Dosage Tag */}
          {dosageText && (
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50">
                <Activity className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase truncate max-w-[150px]">
                  {dosageText}
                </span>
              </div>
            </div>
          )}
        </CardContent>

        {/* --- IMPROVED FOOTER BUTTONS --- */}
        <CardFooter className="relative p-4 pt-0 z-10 grid grid-cols-2 gap-3">
          
          {/* 1. Find Similar Button */}
          <Button
            onClick={handleFindSimilar}
            variant="outline"
            size="sm"
            className="w-full border-border hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all text-xs font-medium h-9"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {language === "en" ? "Similar" : 
             language === "ar" ? "مشابه" : 
             "هاوشێوە"}
          </Button>

          {/* 2. View Details Button */}
          <Link href={`/drug/${encodeURIComponent(drug.name)}`} className="w-full">
            <Button 
              variant="default"
              size="sm"
              className="w-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-all text-xs font-bold h-9"
            >
              {t("viewDetails")}
              {isRTL ? <ArrowRight className="h-3.5 w-3.5 mr-1.5 rotate-180" /> : <ArrowRight className="h-3.5 w-3.5 ml-1.5" />}
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* --- POLISHED SHEET UI --- */}
      <Sheet open={showSimilar} onOpenChange={setShowSimilar}>
        <SheetContent 
          side={isRTL ? "left" : "right"} 
          className="w-full sm:max-w-md flex flex-col h-full p-0 gap-0 border-l"
        >
          {/* Sticky Header */}
          <SheetHeader className="p-6 border-b bg-background/95 backdrop-blur-sm z-10 shadow-sm">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              {language === "en" ? "Related Medications" : 
               language === "ar" ? "أدوية ذات صلة" : 
               "دەرمانە پەیوەندیدارەکان"}
            </SheetTitle>
            <div className="text-xs text-muted-foreground font-normal">
              {language === "en" ? `Matches for ${drug.name}` :
               language === "ar" ? `نتائج لـ ${drug.name}` :
               `ئەنجامەکان بۆ ${drug.name}`}
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            
            {/* Loading State */}
            {isLoadingSimilar && (
              <div className="flex flex-col items-center justify-center h-[50vh] space-y-6 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-sm font-medium">Processing chemical structure...</p>
                  <p className="text-xs text-muted-foreground">AI Analysis</p>
                </div>
              </div>
            )}

            {/* Results State */}
            {!isLoadingSimilar && (
              <div className="space-y-8 pb-10">
                
                {/* Alternatives */}
                {alternatives.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      {language === "en" ? "Exact Alternatives" : language === "ar" ? "بدائل مطابقة" : "بەدیلەکان"}
                    </h3>
                    <div className="grid gap-3">
                      {alternatives.map((item: any, i: number) => (
                        <SimilarDrugCard key={`alt-${i}`} item={item} isRTL={isRTL} onClick={() => setShowSimilar(false)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Class */}
                {similarDrugs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Beaker className="h-3.5 w-3.5 text-blue-500" />
                      {language === "en" ? "Similar Class" : language === "ar" ? "من نفس الفئة" : "لە هەمان جۆر"}
                    </h3>
                    <div className="grid gap-3">
                      {similarDrugs.map((item: any, i: number) => (
                        <SimilarDrugCard key={`sim-${i}`} item={item} isRTL={isRTL} onClick={() => setShowSimilar(false)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {similarDrugs.length === 0 && alternatives.length === 0 && (
                  <div className="h-[40vh] flex flex-col items-center justify-center text-center opacity-80">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <SearchX className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No matches found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

// --- REUSABLE MINI CARD COMPONENT ---
function SimilarDrugCard({ item, isRTL, onClick }: { item: any, isRTL: boolean, onClick: () => void }) {
  return (
    <Link href={`/drug/${encodeURIComponent(item.name)}`} onClick={onClick} className="block group">
      <div className="relative overflow-hidden p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md">
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Pill className="h-4.5 w-4.5" />
          </div>
          <div className={`flex-1 min-w-0 max-w-70 text-left ${isRTL ? "text-right" : ""}`}>
            <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
            <p className="text-[10px] text-muted-foreground font-mono truncate opacity-90 whitespace-pre-wrap">{item.scientificName}</p>
          </div>
          <div className="text-muted-foreground/30 group-hover:text-primary transition-colors">
            {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </div>
      </div>
    </Link>
  )
}