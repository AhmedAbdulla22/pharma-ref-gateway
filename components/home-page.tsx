"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Zap } from "lucide-react"
import Link from "next/link"

export function HomePage() {
  const { t, isRTL } = useLanguage()

  const features = [
    {
      href: "/search",
      icon: Search,
      title: t("searchDrugsTitle"),
      description: t("searchDrugsDesc"),
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
    },
    {
      href: "/interactions",
      icon: Zap,
      title: t("interactionCheckerTitle"),
      description: t("interactionCheckerDesc"),
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <section className={`text-center space-y-4 py-12 ${isRTL ? "text-right" : ""}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">{t("welcomeTitle")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{t("welcomeDescription")}</p>
        </section>

        {/* Feature Cards */}
        <section className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 cursor-pointer">
                <CardHeader className="pb-3">
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 ${isRTL ? "ms-auto" : ""}`}
                  >
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <CardTitle className={`text-xl ${isRTL ? "text-right" : ""}`}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className={`text-base ${isRTL ? "text-right" : ""}`}>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </PageWrapper>
  )
}
