"use client"

import { useEffect, useState, useRef } from "react"
import { DrugChatbot } from "@/components/drug-chatbot"
import { useParams } from "next/navigation"
import { PageWrapper } from "@/components/page-wrapper"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  AlertTriangle, 
  Activity, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  Beaker, 
  Info,
  Thermometer,
  Sparkles,
  FileText,
  CheckCircle2,
  ShieldAlert,
  Repeat,
  Package,
  ShieldCheck,
  Stethoscope,
  Baby,
  Search,
  Pill
} from "lucide-react"
import Link from "next/link"

export default function DrugDetailPage() {
  const params = useParams()
  const { language, t, isRTL } = useLanguage()
  const [drug, setDrug] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSimilar, setShowSimilar] = useState(false)
  const [similarDrugs, setSimilarDrugs] = useState<any[]>([])
  const [alternatives, setAlternatives] = useState<any[]>([])
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false)

  const drugIdParam = decodeURIComponent(
    (Array.isArray(params.id) ? params.id[0] : params.id) || ''
  )

  useEffect(() => {
    const fetchDrug = async () => {
      if (!drugIdParam) return
      setIsLoading(true)
      try {
        const response = await fetch('/api/drug-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ drugName: drugIdParam, language })
        })
        const data = await response.json()
        if (data.found) {
          setDrug(data.drug)
        } else {
          setError("Medication details not found.")
        }
      } catch (err) {
        setError("Network error. Please check your connection.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDrug()
  }, [drugIdParam, language])

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky nav
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  const handleFindSimilar = async () => {
    if (!drug || isLoadingSimilar) return
    
    setIsLoadingSimilar(true)
    try {
      const response = await fetch('/api/similar-drugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          drugName: drug.genericName || drug.name,
          category: drug.category,
          limit: 8
        })
      })
      
      const data = await response.json()
      setSimilarDrugs(data.similar || [])
      setAlternatives(data.alternatives || [])
      setShowSimilar(true)
    } catch (error) {
      console.error('Failed to find similar drugs:', error)
    } finally {
      setIsLoadingSimilar(false)
    }
  }

  if (isLoading) return (
    <PageWrapper>
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
        <p className="text-muted-foreground">Processing FDA Label with Llama 3.3 AI...</p>
      </div>
    </PageWrapper>
  )

  if (error || !drug) return (
    <PageWrapper>
      <div className="max-w-md mx-auto text-center py-20">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500/50 mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Drug Not Found</h2>
        <Link href="/search"><Button className="mt-4 bg-primary">Back to Search</Button></Link>
      </div>
    </PageWrapper>
  )

  const getAiData = (section: any) => {
  const data = section[language] || section['en'] || []
  // Check if AI service is unavailable
  const isUnavailable = data.some((item: string) => 
    item.includes("temporarily unavailable") || 
    item.includes("Summary unavailable") ||
    item.includes("ملخص غير متوفر") ||
    item.includes("کورتە بەردەست نییە") ||
    item.includes("All AI services unavailable") ||
    item.includes("جميع خدمات الذكاء الاصطناعي غير متاحة") ||
    item.includes("هەموو خزمەتگوزارییەکانی هوشی دەستکرد بەردەست نییە")
  )
  return { data, isUnavailable }
}

  return (
    <>
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
        
        {/* --- HEADER --- */}
        <div className="space-y-6">
          <Link href="/search">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary pl-0">
              <ArrowLeft className="h-4 w-4" /> {t("backToHome")}
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">{drug.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground font-mono uppercase text-sm">
                <Beaker className="h-4 w-4" /> {drug.genericName}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                {drug.category}
              </Badge>
              <Button
                onClick={handleFindSimilar}
                disabled={isLoadingSimilar}
                variant="outline"
                className="gap-2 border-border hover:bg-accent/30"
              >
                {isLoadingSimilar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {language === "en" ? "Find Similar" : 
                 language === "ar" ? "ابحث عن مشابه" : 
                 "دۆزینەوەی هاوشێوە"}
              </Button>
            </div>
          </div>
        </div>

        {/* --- STICKY SHORTCUT NAVIGATION --- */}
        <div className="sticky top-4 z-40 bg-background/90 backdrop-blur-md border border-border rounded-full px-2 py-1.5 shadow-2xl flex items-center justify-between">
           <div className={`flex items-center gap-1 overflow-x-auto no-scrollbar ${isRTL ? "flex-row-reverse" : ""}`}>
              <Button variant="ghost" size="sm" onClick={() => scrollTo('ai-summary')} className="rounded-full text-xs text-primary hover:bg-primary/10">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> AI Summary
              </Button>
              <Button variant="ghost" size="sm" onClick={() => scrollTo('clinical')} className="rounded-full text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 mr-1" /> Clinical
              </Button>
              <Button variant="ghost" size="sm" onClick={() => scrollTo('safety')} className="rounded-full text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Safety
              </Button>
           </div>
           <div className="hidden md:block px-4 border-l border-border text-[10px] text-muted-foreground font-mono">
              ID: {drug.id.substring(0,8)}
           </div>
        </div>

        {/* --- SECTION 1: AI SMART SUMMARY --- */}
        <div id="ai-summary" className="space-y-6 pt-4">
          <div className={`flex items-center gap-2 text-primary border-b border-primary/20 pb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Sparkles className="h-5 w-5" />
            <h2 className="text-xl font-bold tracking-wide uppercase">AI Smart Summary</h2>
          </div>

          {/* Rate Limit Warning */}
          {getAiData(drug.aiSummary.uses).isUnavailable && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {language === "en" ? "AI service temporarily unavailable due to rate limits. Raw FDA data is still available below." :
                   language === "ar" ? "خدمة الذكاء الاصطناعي غير متاحة مؤقتاً بسبب حدود الاستخدام. بيانات FDA الأصلية لا تزال متوفرة أدناه." :
                   "خزمەتگوزاری هوشی دەستکردی کاتی بەردەست نییە بە هۆی سنوردارکردن. زانیاری بنەڕەتی FDA هێشتا بەردەستە."}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryCard title="Key Uses" icon={<CheckCircle2 className="text-blue-500" />} data={getAiData(drug.aiSummary.uses)} border="border-t-blue-500" />
            <SummaryCard title="Side Effects" icon={<Thermometer className="text-amber-500" />} data={getAiData(drug.aiSummary.sideEffects)} border="border-t-amber-500" />
            <SummaryCard title="Dosage Guide" icon={<Activity className="text-emerald-500" />} data={getAiData(drug.aiSummary.dosage)} border="border-t-emerald-500" />
            <SummaryCard title="Safety Alerts" icon={<AlertTriangle className="text-red-500" />} data={getAiData(drug.aiSummary.warnings)} border="border-t-red-500" />
            <SummaryCard title="Avoid If..." icon={<ShieldAlert className="text-pink-600" />} data={getAiData(drug.aiSummary.contraindications)} border="border-t-pink-600" />
            <SummaryCard title="Interactions" icon={<Repeat className="text-purple-500" />} data={getAiData(drug.aiSummary.interactions)} border="border-t-purple-500" />
            <div className="md:col-span-2 lg:col-span-3">
              <SummaryCard 
                title="Pregnancy & Nursing" 
                icon={<Baby className="text-rose-400" />} 
                data={getAiData(drug.aiSummary.pregnancy)} 
                border="border-t-rose-400 bg-muted/10" 
              />
            </div>
          </div>
        </div>

        <Separator className="bg-border my-10" />

        {/* --- SECTION 2: FULL CLINICAL REFERENCE --- */}
        <div id="clinical" className="space-y-8">
          <div className={`flex items-center gap-2 text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
            <Stethoscope className="h-5 w-5" />
            <h2 className="text-xl font-bold tracking-wide uppercase">FDA Clinical Reference</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Clinical Text */}
            <div className="lg:col-span-8 space-y-8">
               <ClinicalBlock title="Dosage and Administration" icon={<Activity />} content={drug.rawDetails.dosage} color="text-emerald-500" />
               <ClinicalBlock title="Indications and Usage" icon={<Info />} content={drug.rawDetails.indications} color="text-blue-500" />
               <ClinicalBlock title="Warnings & Precautions" icon={<AlertTriangle />} content={drug.rawDetails.warnings} color="text-red-500" />
               <ClinicalBlock title="Adverse Reactions" icon={<Thermometer />} content={drug.rawDetails.adverseReactions} color="text-amber-500" />
            </div>

            {/* Side Column: Technical Specs */}
            <div className="lg:col-span-4 space-y-6">
               <Card className="bg-card/30 border-border">
                  <CardHeader><CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">Ingredients</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                     <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Active</span>
                        <p className="text-sm text-foreground">{drug.rawDetails.ingredients.active}</p>
                     </div>
                     <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Inactive</span>
                        <p className="text-xs text-muted-foreground">{drug.rawDetails.ingredients.inactive}</p>
                     </div>
                  </CardContent>
               </Card>

               <div id="safety" className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Population Safety</h3>
                  <div className="grid gap-4">
                     <SafetyCard title="Pediatric" content={drug.rawDetails.pediatric} />
                     <SafetyCard title="Geriatric" content={drug.rawDetails.geriatric} />
                     <SafetyCard title="Pregnancy" content={drug.rawDetails.pregnancy} />
                  </div>
               </div>

               <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 space-y-3">
                     <div className="flex items-center gap-2 text-primary"><Package className="h-4 w-4" /> <span className="text-xs font-bold uppercase">Supply & Route</span></div>
                     <p className="text-xs text-muted-foreground italic">Route: {drug.rawDetails.route}</p>
                     <p className="text-xs text-muted-foreground">{drug.rawDetails.supply}</p>
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>

        {/* Similar Drugs Section */}
        {showSimilar && (
          <SimilarDrugsSection 
            similarDrugs={similarDrugs} 
            alternatives={alternatives} 
            language={language} 
            isRTL={isRTL} 
          />
        )}

        {/* --- SECTION: MEDICAL DISCLAIMER --- */}
        <Card className={`bg-red-950/10 border-red-900/20 mt-12 ${isRTL ? "text-right" : "text-left"}`}>
          <CardContent className={`p-6 flex gap-4 items-start ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
            <div className="space-y-2">
              <h4 className="text-red-500 font-bold uppercase text-xs tracking-widest">{t("medicalDisclaimer")}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-tight">{t("disclaimerText")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
    
    {drug && (
        <DrugChatbot drugName={drug.name} drugContext={drug.rawDetails} />
      )}
    </>
  )
}

// --- SUB-COMPONENTS FOR CLEANER CODE ---

function SummaryCard({ title, icon, data, border }: any) {
  return (
    <Card className={`bg-card/40 border-border border-t-2 ${border} shadow-lg hover:shadow-primary/5 transition-all`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.data.map((point: string, i: number) => (
            <li key={i} className="text-[13px] text-foreground leading-snug">• {point}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function ClinicalBlock({ title, icon, content, color }: any) {
  return (
    <div className="space-y-3">
      <h4 className={`text-sm font-bold flex items-center gap-2 ${color} italic`}>
        {icon} {title}
      </h4>
      <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/50">
        {content}
      </p>
    </div>
  )
}

function SafetyCard({ title, content }: any) {
  return (
    <div className="p-3 rounded-lg bg-card border-border">
      <h5 className="text-[10px] font-bold text-muted-foreground mb-1">{title} Use</h5>
      <p className="text-[11px] text-muted-foreground line-clamp-3 hover:line-clamp-none cursor-pointer">{content}</p>
    </div>
  )
}

// Similar Drugs Component
function SimilarDrugsSection({ similarDrugs, alternatives, language, isRTL }: any) {
  if (similarDrugs.length === 0 && alternatives.length === 0) return null;

  return (
    <div className="space-y-6 pt-4">
      <div className={`flex items-center gap-2 text-primary border-b border-primary/20 pb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Search className="h-5 w-5" />
        <h2 className="text-xl font-bold tracking-wide uppercase">
          {language === "en" ? "Similar & Alternative Medications" : 
           language === "ar" ? "أدوية مماثلة وبديلة" : 
           "دەرمانە هاوشێوە و بەدیلەکان"}
        </h2>
      </div>

      {alternatives.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {language === "en" ? "Alternatives" : 
             language === "ar" ? "البدائل" : 
             "بەدیلەکان"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alternatives.map((drug: any, index: number) => (
              <Link key={`alt-${index}`} href={`/drug/${encodeURIComponent(drug.name)}`}>
                <div className="p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer">
                  <div className="font-medium text-foreground">{drug.name}</div>
                  <div className="text-sm text-muted-foreground">{drug.scientificName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{drug.category}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {similarDrugs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {language === "en" ? "Similar Medications" : 
             language === "ar" ? "أدوية مماثلة" : 
             "دەرمانە هاوشێوەکان"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {similarDrugs.map((drug: any, index: number) => (
              <Link key={`sim-${index}`} href={`/drug/${encodeURIComponent(drug.name)}`}>
                <div className="p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer">
                  <div className="font-medium text-foreground">{drug.name}</div>
                  <div className="text-sm text-muted-foreground">{drug.scientificName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{drug.category}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}