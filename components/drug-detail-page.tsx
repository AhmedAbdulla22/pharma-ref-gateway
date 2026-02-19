"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageWrapper } from "@/components/page-wrapper"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, AlertTriangle, Activity, AlertCircle, ArrowLeft, QrCode, Loader2, Beaker } from "lucide-react"
import Link from "next/link"

interface APIDrug {
  id: string
  name: string
  genericName: string
  category: string
  aiSummary: {
    uses: { en: string[], ar: string[], ku: string[] }
    sideEffects: { en: string[], ar: string[], ku: string[] }
    warnings: { en: string[], ar: string[], ku: string[] }
    dosage: { en: string[], ar: string[], ku: string[] }
    contraindications: { en: string[], ar: string[], ku: string[] }
    interactions: { en: string[], ar: string[], ku: string[] }
    pregnancy: { en: string[], ar: string[], ku: string[] }
  }
  rawDetails: {
    indications: string
    dosage: string
    warnings: string
    adverseReactions: string
    contraindications: string
    interactions: string
    pregnancy: string
    pediatric: string
    geriatric: string
    ingredients: {
      active: string
      inactive: string
    }
    supply: string
    route: string
  }
  qrCode: string
}

export default function DrugDetailPage() {
  const params = useParams()
  const { language, t, isRTL } = useLanguage()
  const [drug, setDrug] = useState<APIDrug | null>(null)
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
        const response = await fetch("/api/drug-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ drugName: drugIdParam, language })
        })

        const data = await response.json()

        if (data.found && data.drug) {
          setDrug(data.drug)
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
  }, [drugIdParam, language])

  const getLocalizedText = (textObj: { en: string[], ar: string[], ku: string[] }) => {
    return textObj[language] || textObj.en || []
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
                  {drug.name || drug.genericName}
                </CardTitle>
                <div className={`flex items-center gap-2 text-muted-foreground font-mono text-lg ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                  <Beaker className="h-4 w-4" />
                  <span>{drug.genericName}</span>
                </div>
              </div>
              
              <div className={`flex flex-col gap-2 ${isRTL ? "items-end" : "items-start md:items-end"}`}>
                <Badge variant="outline" className="px-3 py-1 text-sm bg-background">
                  {drug.category}
                </Badge>
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
                {getLocalizedText(drug.aiSummary.uses).map((use, i) => (
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
                {getLocalizedText(drug.aiSummary.sideEffects).map((effect, i) => (
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
                 {/* AI Summarized Warnings */}
                 <div className={isRTL ? "text-right" : ""}>
                   <p className="text-xs font-bold uppercase text-red-600/70 mb-2">{t("warnings")}</p>
                   <ul className="space-y-1">
                     {getLocalizedText(drug.aiSummary.warnings).map((warning, i) => (
                       <li key={i} className="text-sm text-foreground/90 leading-relaxed">• {warning}</li>
                     ))}
                   </ul>
                 </div>
                 {/* AI Summarized Contraindications */}
                 <div className={isRTL ? "text-right" : ""}>
                   <p className="text-xs font-bold uppercase text-red-600/70 mb-2">Contraindications</p>
                   <ul className="space-y-1">
                     {getLocalizedText(drug.aiSummary.contraindications).map((contra, i) => (
                       <li key={i} className="text-sm text-foreground/90 leading-relaxed">• {contra}</li>
                     ))}
                   </ul>
                 </div>
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
                 <span className="block text-xs font-semibold text-emerald-600 uppercase mb-1">{t("dosage")}</span>
                 <ul className="space-y-1">
                   {getLocalizedText(drug.aiSummary.dosage).map((dosage, i) => (
                     <li key={i} className="font-medium text-sm">• {dosage}</li>
                   ))}
                 </ul>
               </div>
            </CardContent>
          </Card>

          {/* Raw Translated Data */}
          <Card className="md:col-span-2 border-blue-100">
            <CardHeader className="bg-blue-50/30 pb-3">
              <CardTitle className={`flex items-center gap-2 text-lg text-blue-700 ${isRTL ? "flex-row-reverse" : ""}`}>
                <AlertCircle className="h-5 w-5" />
                {language === "en" ? "Complete Medical Information" : 
                 language === "ar" ? "المعلومات الطبية الكاملة" : 
                 "زانیاری تەواوی پزیشکی"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              {/* Indications */}
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-xs font-bold uppercase text-blue-600/70 mb-2">
                  {language === "en" ? "Indications & Usage" : 
                   language === "ar" ? "الاستطبابات والاستخدام" : 
                   "نیشانەکان و بەکارهێنان"}
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {drug.rawDetails.indications}
                </p>
              </div>

              {/* Dosage and Administration */}
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-xs font-bold uppercase text-blue-600/70 mb-2">
                  {language === "en" ? "Dosage & Administration" : 
                   language === "ar" ? "الجرعة والإعطاء" : 
                   "دۆز و بەڕێوەبردن"}
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {drug.rawDetails.dosage}
                </p>
              </div>

              {/* Warnings and Precautions */}
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-xs font-bold uppercase text-blue-600/70 mb-2">
                  {language === "en" ? "Warnings & Precautions" : 
                   language === "ar" ? "التحذيرات والاحتياطات" : 
                   "ئاگاداریەکان و ڕێوشوێنەکان"}
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {drug.rawDetails.warnings}
                </p>
              </div>

              {/* Adverse Reactions */}
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-xs font-bold uppercase text-blue-600/70 mb-2">
                  {language === "en" ? "Adverse Reactions" : 
                   language === "ar" ? "التفاعلات العكسية" : 
                   "کارلێکەکان نەرێنی"}
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {drug.rawDetails.adverseReactions}
                </p>
              </div>

              {/* Contraindications */}
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-xs font-bold uppercase text-blue-600/70 mb-2">
                  {language === "en" ? "Contraindications" : 
                   language === "ar" ? "مضادات الاستطباب" : 
                   "دژە نیشانەکان"}
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {drug.rawDetails.contraindications}
                </p>
              </div>

              {/* Drug Interactions */}
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-xs font-bold uppercase text-blue-600/70 mb-2">
                  {language === "en" ? "Drug Interactions" : 
                   language === "ar" ? "التفاعلات الدوائية" : 
                   "کارلێکەکانی دەرمان"}
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {drug.rawDetails.interactions}
                </p>
              </div>

              {/* Pregnancy and Breastfeeding */}
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-xs font-bold uppercase text-blue-600/70 mb-2">
                  {language === "en" ? "Pregnancy & Breastfeeding" : 
                   language === "ar" ? "الحمل والرضاعة" : 
                   "منداڵبوون و شیردانی"}
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {drug.rawDetails.pregnancy}
                </p>
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
                  <div className="bg-card p-2 rounded border inline-block">
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