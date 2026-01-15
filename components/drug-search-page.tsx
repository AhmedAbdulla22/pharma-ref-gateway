"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { DrugCard } from "@/components/drug-card"
import { useLanguage } from "@/components/providers/language-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import type { Drug } from "@/lib/data/drugs"

export function DrugSearchPage() {
  const { language, t, isRTL } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Drug[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch("/api/drug-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, language }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setSearchResults([])
      } else {
        setSearchResults(data.drugs || [])
      }
    } catch {
      setError("Failed to search. Please try again.")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Search className="h-6 w-6 text-sky-500" />
            </div>
            <h1 className="text-3xl font-bold">{t("drugSearch")}</h1>
          </div>
          <p className={`text-muted-foreground ${isRTL ? "text-right" : ""}`}>
            {language === "en"
              ? "Powered by AI - Search any medication"
              : language === "ar"
                ? "مدعوم بالذكاء الاصطناعي - ابحث عن أي دواء"
                : "بە هێزی زیرەکی دەستکرد - بگەڕێ بۆ هەر دەرمانێک"}
          </p>
        </div>

        {/* Search Section */}
        <section className="max-w-3xl mx-auto">
          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 h-12 text-lg"
              dir={isRTL ? "rtl" : "ltr"}
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className={`h-12 px-6 gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              {isLoading
                ? language === "en"
                  ? "Searching..."
                  : language === "ar"
                    ? "جاري البحث..."
                    : "گەڕان..."
                : language === "en"
                  ? "Search"
                  : language === "ar"
                    ? "بحث"
                    : "گەڕان"}
            </Button>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto p-4 bg-destructive/10 border border-destructive rounded-lg text-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">
              {language === "en"
                ? "Searching pharmaceutical database..."
                : language === "ar"
                  ? "جاري البحث في قاعدة البيانات الصيدلانية..."
                  : "گەڕان لە بنکەی زانیاری دەرمانسازی..."}
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && (
          <section>
            {searchResults.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((drug, index) => (
                  <DrugCard key={drug.id || `drug-${index}`} drug={drug} />
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 text-muted-foreground ${isRTL ? "text-right" : ""}`}>
                <p>{t("noResults")}</p>
              </div>
            )}
          </section>
        )}

        {/* Initial State */}
        {!isLoading && !hasSearched && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {language === "en"
                ? "Enter a drug name to search"
                : language === "ar"
                  ? "أدخل اسم الدواء للبحث"
                  : "ناوی دەرمان بنووسە بۆ گەڕان"}
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
