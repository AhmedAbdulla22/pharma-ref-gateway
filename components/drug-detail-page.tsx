"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageWrapper } from "@/components/page-wrapper"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, AlertTriangle, Activity, AlertCircle, ArrowLeft, QrCode, Loader2, Beaker } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

// Exact shape of your Supabase Table
interface DBDrug {
  id: string
  trade_name: string
  generic_name: string
  drug_class: string
  indications: string
  side_effects: string
  contraindications: string
  warnings: string
  dosage_form: string
  pregnancy_category: string
}

export default function DrugDetailPage() {
  const params = useParams()
  const { language, t, isRTL } = useLanguage()
  const [drug, setDrug] = useState<DBDrug | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const drugIdParam = decodeURIComponent(
    (Array.isArray(params.id) ? params.id[0] : params.id) || ''
  );

  useEffect(() => {
    const fetchDrug = async () => {
      if (!drugIdParam) return
      
      setIsLoading(true)
      setError(null)

      try {
        // We search by trade_name OR generic_name to be safe
        const { data, error } = await supabase
          .from('drugs')
          .select('*')
          .or(`trade_name.ilike.%${drugIdParam}%,generic_name.ilike.%${drugIdParam}%`)
          .limit(1)
          .single()

        if (error) throw error
        if (data) {
          setDrug(data)
        } else {
          setError("Drug not found")
        }
      } catch (err) {
        console.error("Fetch Error:", err)
        setError("Could not find this medication in the database.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrug()
  }, [drugIdParam])

  // Helper to split DB strings (comma separated) into arrays
  const parseDBList = (text: string | null) => {
    if (!text) return []
    return text.split(',').map(s => s.trim()).filter(Boolean)
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            {language === "ar" ? "جاري البحث..." : language === "ku" ? "گەڕان..." : "Loading Information..."}
          </p>
        </div>
      </PageWrapper>
    )
  }

  if (error || !drug) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive/50 mb-6" />
          <h2 className="text-2xl font-bold mb-2">{language === "en" ? "Drug Not Found" : "الدواء غير موجود"}</h2>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Link href="/search">
            <Button size="lg">
              {language === "en" ? "Back to Search" : language === "ar" ? "العودة للبحث" : "گەڕانەوە"}
            </Button>
          </Link>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Navigation */}
        <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
          <Link href="/search">
            <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
              {t("backToHome")}
            </Button>
          </Link>
        </div>

        {/* Hero Card */}
        <Card className="border-primary/20 shadow-md overflow-hidden">
          <div className="bg-primary/5 h-2 w-full" />
          <CardHeader>
            <div className={`flex flex-col md:flex-row gap-4 justify-between items-start ${isRTL ? "md:flex-row-reverse text-right" : ""}`}>
              <div className="space-y-2">
                <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
                  {drug.trade_name || drug.generic_name}
                </CardTitle>
                <div className={`flex items-center gap-2 text-muted-foreground font-mono text-lg ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                  <Beaker className="h-4 w-4" />
                  <span>{drug.generic_name}</span>
                </div>
              </div>
              
              <div className={`flex flex-col gap-2 ${isRTL ? "items-end" : "items-start md:items-end"}`}>
                <Badge variant="outline" className="px-3 py-1 text-sm bg-background">
                  {drug.drug_class}
                </Badge>
                {drug.pregnancy_category && (
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    Pregnancy Category: {drug.pregnancy_category}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Indications / Uses */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-xl ${isRTL ? "flex-row-reverse" : ""}`}>
                <Pill className="h-5 w-5 text-primary" />
                {t("commonUses")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex flex-wrap gap-2 ${isRTL ? "justify-end" : ""}`}>
                {parseDBList(drug.indications).map((use, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1 text-sm font-normal">
                    {use}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Side Effects */}
          <Card className="border-amber-100">
            <CardHeader className="bg-amber-50/30 pb-3">
              <CardTitle className={`flex items-center gap-2 text-lg text-amber-700 ${isRTL ? "flex-row-reverse" : ""}`}>
                <AlertTriangle className="h-5 w-5" />
                {t("sideEffects")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                {parseDBList(drug.side_effects).map((effect, i) => (
                  <li key={i} className={`flex items-start gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <span className="text-sm">{effect}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Warnings & Contraindications */}
          <Card className="border-red-100">
            <CardHeader className="bg-red-50/30 pb-3">
              <CardTitle className={`flex items-center gap-2 text-lg text-red-700 ${isRTL ? "flex-row-reverse" : ""}`}>
                <AlertCircle className="h-5 w-5" />
                {t("warnings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
               <div className="space-y-4">
                 {/* Explicit Warnings */}
                 {drug.warnings && (
                    <div className={isRTL ? "text-right" : ""}>
                      <p className="text-xs font-bold uppercase text-red-600/70 mb-1">Warnings</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{drug.warnings}</p>
                    </div>
                 )}
                 {/* Contraindications */}
                 {drug.contraindications && (
                    <div className={isRTL ? "text-right" : ""}>
                      <p className="text-xs font-bold uppercase text-red-600/70 mb-1">Contraindications</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{drug.contraindications}</p>
                    </div>
                 )}
               </div>
            </CardContent>
          </Card>

          {/* Dosage Information */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
                <Activity className="h-5 w-5 text-emerald-600" />
                {t("dosage")}
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className={`p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 ${isRTL ? "text-right" : ""}`}>
                 <span className="block text-xs font-semibold text-emerald-600 uppercase mb-1">Form</span>
                 <p className="font-medium text-lg">{drug.dosage_form || "N/A"}</p>
               </div>
            </CardContent>
          </Card>

           {/* ID / QR */}
           <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
                <QrCode className="h-5 w-5 text-primary" />
                Ref.
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
                <div className="text-center space-y-2">
                  <div className="bg-white p-2 rounded border inline-block">
                     <QrCode className="h-24 w-24 text-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">ID: {drug.id.split('-')[0]}</p>
                </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </PageWrapper>
  )
}