"use client"

import { useState, useRef, useEffect } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { QrCode, Camera, CameraOff, Search, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface DrugResult {
  id: string
  name: string
  genericName: string
  category: string
}

export function QRScannerPage() {
  const { language, t, isRTL } = useLanguage()
  const [manualCode, setManualCode] = useState("")
  const [searchResult, setSearchResult] = useState<{ found: boolean; drug?: DrugResult } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleManualSearch = async () => {
    if (!manualCode.trim()) return

    setIsLoading(true)
    setSearchResult(null)

    try {
      const response = await fetch("/api/drug-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: manualCode.trim(), language }),
      })

      const data = await response.json()

      if (data.found && data.drug) {
        setSearchResult({
          found: true,
          drug: {
            id: data.drug.id,
            name: data.drug.name[language] || data.drug.name,
            genericName: data.drug.genericName,
            category: data.drug.category,
          },
        })
      } else {
        setSearchResult({ found: false })
      }
    } catch {
      setSearchResult({ found: false })
    } finally {
      setIsLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
        setCameraError(false)
      }
    } catch {
      setCameraError(true)
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <QrCode className="h-6 w-6 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold">{t("scanQRCode")}</h1>
          </div>
          <p className={`text-muted-foreground ${isRTL ? "text-right" : ""}`}>{t("qrInstructions")}</p>
        </div>

        {/* Camera Section */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Camera className="h-5 w-5" />
              {t("scanQRCode")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-4 p-8">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground">{cameraError ? t("cameraError") : t("qrInstructions")}</p>
                </div>
              )}

              {/* Scanner overlay */}
              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-scan" />
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={cameraActive ? stopCamera : startCamera}
              variant={cameraActive ? "destructive" : "default"}
              className={`w-full gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {cameraActive ? (
                <>
                  <CameraOff className="h-4 w-4" />
                  {t("stopCamera")}
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  {t("startCamera")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Entry Section */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Search className="h-5 w-5" />
              {t("enterManually")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm text-muted-foreground ${isRTL ? "text-right" : ""}`}>
              {language === "en"
                ? "Enter a QR code or drug name to search using AI"
                : language === "ar"
                  ? "أدخل رمز QR أو اسم الدواء للبحث باستخدام الذكاء الاصطناعي"
                  : "کۆدی QR یان ناوی دەرمان بنووسە بۆ گەڕان بە زیرەکی دەستکرد"}
            </p>
            <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Input
                placeholder={t("qrCodePlaceholder")}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                className="flex-1"
                dir={isRTL ? "rtl" : "ltr"}
              />
              <Button
                onClick={handleManualSearch}
                disabled={isLoading || !manualCode.trim()}
                className={`gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {t("searchByCode")}
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                  {language === "en"
                    ? "Looking up drug information..."
                    : language === "ar"
                      ? "جاري البحث عن معلومات الدواء..."
                      : "گەڕان بۆ زانیاری دەرمان..."}
                </p>
              </div>
            )}

            {/* Search Result */}
            {searchResult && !isLoading && (
              <div
                className={`p-4 rounded-lg border ${searchResult.found ? "bg-emerald-500/10 border-emerald-500" : "bg-red-500/10 border-red-500"}`}
              >
                <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  {searchResult.found && searchResult.drug ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                        <p className="font-medium">{searchResult.drug.name}</p>
                        <p className="text-sm text-muted-foreground">{searchResult.drug.genericName}</p>
                        <Link href={`/drug/${searchResult.drug.id}`} className="text-sm text-primary hover:underline">
                          {t("viewDetails")}
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                      <p className={`${isRTL ? "text-right" : ""}`}>{t("noResults")}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
