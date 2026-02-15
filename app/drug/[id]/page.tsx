"use client"

import { useEffect, useState, useRef } from "react"
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
  Stethoscope
} from "lucide-react"
import Link from "next/link"

export default function DrugDetailPage() {
  const params = useParams()
  const { language, t, isRTL } = useLanguage()
  const [drug, setDrug] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          body: JSON.stringify({ drugName: drugIdParam })
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
  }, [drugIdParam])

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

  if (isLoading) return (
    <PageWrapper>
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
        <p className="text-slate-400">Processing FDA Label with Llama 3.3 AI...</p>
      </div>
    </PageWrapper>
  )

  if (error || !drug) return (
    <PageWrapper>
      <div className="max-w-md mx-auto text-center py-20">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500/50 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Drug Not Found</h2>
        <Link href="/search"><Button className="mt-4 bg-cyan-600">Back to Search</Button></Link>
      </div>
    </PageWrapper>
  )

  const getAiData = (section: any) => section[language] || section['en'] || []

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
        
        {/* --- HEADER --- */}
        <div className="space-y-6">
          <Link href="/search">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-cyan-400 pl-0">
              <ArrowLeft className="h-4 w-4" /> {t("backToHome")}
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">{drug.name}</h1>
              <div className="flex items-center gap-2 text-slate-400 font-mono uppercase text-sm">
                <Beaker className="h-4 w-4" /> {drug.genericName}
              </div>
            </div>
            <Badge className="bg-cyan-950/50 text-cyan-400 border-cyan-800 px-3 py-1">
              {drug.category}
            </Badge>
          </div>
        </div>

        {/* --- STICKY SHORTCUT NAVIGATION --- */}
        <div className="sticky top-4 z-40 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-full px-2 py-1.5 shadow-2xl flex items-center justify-between">
           <div className={`flex items-center gap-1 overflow-x-auto no-scrollbar ${isRTL ? "flex-row-reverse" : ""}`}>
              <Button variant="ghost" size="sm" onClick={() => scrollTo('ai-summary')} className="rounded-full text-xs text-cyan-400 hover:bg-cyan-400/10">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> Summary
              </Button>
              <Button variant="ghost" size="sm" onClick={() => scrollTo('clinical')} className="rounded-full text-xs text-slate-400">
                <FileText className="h-3.5 w-3.5 mr-1" /> Clinical
              </Button>
              <Button variant="ghost" size="sm" onClick={() => scrollTo('safety')} className="rounded-full text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Safety
              </Button>
           </div>
           <div className="hidden md:block px-4 border-l border-slate-800 text-[10px] text-slate-500 font-mono">
              ID: {drug.id.substring(0,8)}
           </div>
        </div>

        {/* --- SECTION 1: AI SMART SUMMARY --- */}
        <div id="ai-summary" className="space-y-6 pt-4">
          <div className={`flex items-center gap-2 text-cyan-400 border-b border-cyan-900/50 pb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Sparkles className="h-5 w-5" />
            <h2 className="text-xl font-bold tracking-wide uppercase">AI Smart Summary</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryCard title="Key Uses" icon={<CheckCircle2 className="text-blue-500" />} data={getAiData(drug.aiSummary.uses)} border="border-t-blue-500" />
            <SummaryCard title="Side Effects" icon={<Thermometer className="text-amber-500" />} data={getAiData(drug.aiSummary.sideEffects)} border="border-t-amber-500" />
            <SummaryCard title="Dosage Guide" icon={<Activity className="text-emerald-500" />} data={getAiData(drug.aiSummary.dosage)} border="border-t-emerald-500" />
            <SummaryCard title="Safety Alerts" icon={<AlertTriangle className="text-red-500" />} data={getAiData(drug.aiSummary.warnings)} border="border-t-red-500" />
            <SummaryCard title="Avoid If..." icon={<ShieldAlert className="text-pink-600" />} data={getAiData(drug.aiSummary.contraindications)} border="border-t-pink-600" />
            <SummaryCard title="Interactions" icon={<Repeat className="text-purple-500" />} data={getAiData(drug.aiSummary.interactions)} border="border-t-purple-500" />
          </div>
        </div>

        <Separator className="bg-slate-800/50 my-10" />

        {/* --- SECTION 2: FULL CLINICAL REFERENCE --- */}
        <div id="clinical" className="space-y-8">
          <div className={`flex items-center gap-2 text-slate-500 ${isRTL ? "flex-row-reverse" : ""}`}>
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
               <Card className="bg-slate-900/30 border-slate-800">
                  <CardHeader><CardTitle className="text-sm text-slate-400 uppercase tracking-widest">Ingredients</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                     <div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Active</span>
                        <p className="text-sm text-slate-300">{drug.rawDetails.ingredients.active}</p>
                     </div>
                     <div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Inactive</span>
                        <p className="text-xs text-slate-500">{drug.rawDetails.ingredients.inactive}</p>
                     </div>
                  </CardContent>
               </Card>

               <div id="safety" className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Population Safety</h3>
                  <div className="grid gap-4">
                     <SafetyCard title="Pediatric" content={drug.rawDetails.pediatric} />
                     <SafetyCard title="Geriatric" content={drug.rawDetails.geriatric} />
                     <SafetyCard title="Pregnancy" content={drug.rawDetails.pregnancy} />
                  </div>
               </div>

               <Card className="bg-cyan-950/10 border-cyan-900/20">
                  <CardContent className="p-4 space-y-3">
                     <div className="flex items-center gap-2 text-cyan-500"><Package className="h-4 w-4" /> <span className="text-xs font-bold uppercase">Supply & Route</span></div>
                     <p className="text-xs text-slate-400 italic">Route: {drug.rawDetails.route}</p>
                     <p className="text-xs text-slate-400">{drug.rawDetails.supply}</p>
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>

        {/* --- SECTION: MEDICAL DISCLAIMER --- */}
        <Card className={`bg-red-950/10 border-red-900/20 mt-12 ${isRTL ? "text-right" : "text-left"}`}>
          <CardContent className={`p-6 flex gap-4 items-start ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
            <div className="space-y-2">
              <h4 className="text-red-500 font-bold uppercase text-xs tracking-widest">{t("medicalDisclaimer")}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-tight">{t("disclaimerText")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

// --- SUB-COMPONENTS FOR CLEANER CODE ---

function SummaryCard({ title, icon, data, border }: any) {
  return (
    <Card className={`bg-slate-950/40 border-slate-800 border-t-2 ${border} shadow-lg hover:shadow-cyan-900/5 transition-all`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.map((point: string, i: number) => (
            <li key={i} className="text-[13px] text-slate-300 leading-snug">• {point}</li>
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
      <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/20 p-4 rounded-xl border border-slate-800/50">
        {content}
      </p>
    </div>
  )
}

function SafetyCard({ title, content }: any) {
  return (
    <div className="p-3 rounded-lg bg-slate-950 border border-slate-900">
      <h5 className="text-[10px] font-bold text-slate-400 mb-1">{title} Use</h5>
      <p className="text-[11px] text-slate-500 line-clamp-3 hover:line-clamp-none cursor-pointer">{content}</p>
    </div>
  )
}