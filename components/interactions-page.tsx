"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { InteractionChecker } from "@/components/interaction-checker"
import { useLanguage } from "@/components/providers/language-provider"
import { Zap } from "lucide-react"

export function InteractionsPage() {
  const { t, isRTL } = useLanguage()

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold">{t("interactionChecker")}</h1>
          </div>
        </div>

        <InteractionChecker />
      </div>
    </PageWrapper>
  )
}
