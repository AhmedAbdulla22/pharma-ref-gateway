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
      <div 
        className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 w-full space-y-8 md:space-y-12 py-8 md:py-12"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Hero Section */}
        <section className="text-center space-y-4 md:space-y-6 flex flex-col items-center justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
            {t("welcomeTitle")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty px-2">
            {t("welcomeDescription")}
          </p>
        </section>

        {/* Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-12">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group block outline-none">
              {/* Fixed the active:scale- missing value */}
              <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-primary/40 group-focus-visible:ring-2 group-focus-visible:ring-primary active:scale- sm:hover:-translate-y-1">
                <CardHeader className="pb-2 md:pb-3">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-2 ${
                      isRTL ? "justify-self-end" : "justify-self-start"
                    }`}
                  >
                    <feature.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${feature.color}`} />
                  </div>
                  <CardTitle className={`text-xl sm:text-2xl ${isRTL ? "text-right" : "text-left"}`}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className={`text-sm sm:text-base leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
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
