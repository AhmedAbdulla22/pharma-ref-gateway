"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { DrugCard } from "@/components/drug-card"
import { useLanguage } from "@/components/providers/language-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, Sparkles, Database } from "lucide-react"

export function DrugSearchPage() {
  const { language, t, isRTL } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      // Use the updated API route we fixed earlier
      const response = await fetch("/api/drug-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, language }),
      })

      const data = await response.json()

      if (data.drugs && data.drugs.length > 0) {
        setSearchResults(data.drugs)
      } else {
        setSearchResults([])
      }
    } catch {
      setError("Connection failed.")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex flex-col">
        
        {/* HERO SECTION: Search Bar */}
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 space-y-8">
          
          {/* Logo / Title */}
          <div className="text-center space-y-4 max-w-2xl">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 mb-4 border border-cyan-500/20">
              <Database className="h-8 w-8 text-cyan-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              {t("drugSearch")}
            </h1>
            <p className="text-lg text-slate-400">
               {language === "en" ? "Access 100,000+ FDA records instantly." : 
                language === "ar" ? "وصول فوري لأكثر من 100,000 سجل طبي" : 
                "دەستگەیشتنی خێرا بە زیاتر لە 100,000 تۆماری پزیشکی"}
            </p>
          </div>

          {/* Search Input Container */}
          <div className="w-full max-w-2xl relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500" />
            
            <div className="relative flex shadow-2xl">
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className={`h-14 bg-slate-950/90 border-slate-800 text-lg focus-visible:ring-cyan-500/50 rounded-none ${isRTL ? "rounded-r-full text-right pr-6" : "rounded-l-full pl-6"}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
                className={`h-14 px-8 bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wide rounded-none ${isRTL ? "rounded-l-full" : "rounded-r-full"}`}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>
          </div>

        </div>

        {/* RESULTS SECTION */}
        <div className="max-w-7xl mx-auto w-full px-4 pb-20">
          
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 rounded-xl bg-slate-900/50 border border-slate-800" />
              ))}
            </div>
          )}

          {!isLoading && hasSearched && searchResults.length > 0 && (
             <div className="space-y-6">
               <div className="flex items-center gap-2 text-slate-500 uppercase text-xs font-bold tracking-widest">
                  <Sparkles className="h-4 w-4 text-cyan-500" /> Found {searchResults.length} results
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((drug, index) => (
                    <DrugCard key={`${drug.id}-${index}`} drug={drug} />
                  ))}
               </div>
             </div>
          )}

          {!isLoading && hasSearched && searchResults.length === 0 && !error && (
            <div className="text-center py-20 bg-slate-950/30 rounded-3xl border border-slate-900 border-dashed">
              <p className="text-slate-500 text-lg">{t("noResults")}</p>
              <Button variant="link" onClick={() => setSearchQuery("")} className="text-cyan-500 mt-2">
                 Clear Search
              </Button>
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  )
}