"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Clock } from "lucide-react"

interface SearchSectionProps {
  onSearch: (query: string) => void
}

export function SearchSection({ onSearch }: SearchSectionProps) {
  const { t, isRTL } = useLanguage()
  const [query, setQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("pharma-recent-searches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    const trimmedQuery = searchQuery.trim()
    onSearch(trimmedQuery)

    const updated = [trimmedQuery, ...recentSearches.filter((s) => s !== trimmedQuery)].slice(0, 8)
    setRecentSearches(updated)
    localStorage.setItem("pharma-recent-searches", JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("pharma-recent-searches")
  }

  const removeRecentSearch = (search: string) => {
    const updated = recentSearches.filter((s) => s !== search)
    setRecentSearches(updated)
    localStorage.setItem("pharma-recent-searches", JSON.stringify(updated))
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className={`relative flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className="relative flex-1">
          <Search
            className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-4" : "left-4"}`}
          />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            className={`h-14 text-lg ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"}`}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>
        <Button onClick={() => handleSearch(query)} size="lg" className="h-14 px-8">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="space-y-3">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
              <Clock className="h-4 w-4" />
              <span>{t("recentSearches")}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRecentSearches}
              className="text-muted-foreground hover:text-foreground"
            >
              {t("clearAll")}
            </Button>
          </div>
          <div className={`flex flex-wrap gap-2 ${isRTL ? "justify-end" : ""}`}>
            {recentSearches.map((search) => (
              <div
                key={search}
                className={`group flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm transition-colors hover:bg-secondary/80 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <button
                  onClick={() => {
                    setQuery(search)
                    handleSearch(search)
                  }}
                  className="text-secondary-foreground"
                >
                  {search}
                </button>
                <button
                  onClick={() => removeRecentSearch(search)}
                  className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remove ${search}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
