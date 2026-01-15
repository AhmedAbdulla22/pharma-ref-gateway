import { Suspense } from "react"
import { QRScannerPage } from "@/components/qr-scanner-page"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <QRScannerPage />
    </Suspense>
  )
}
