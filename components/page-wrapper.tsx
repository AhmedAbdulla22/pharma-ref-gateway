"use client"

import type React from "react"

import { Header } from "@/components/header"
import { MedicalBackground } from "@/components/medical-background"
import { useLanguage } from "@/components/providers/language-provider"

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  const { isRTL } = useLanguage()

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      <MedicalBackground />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </div>
  )
}
