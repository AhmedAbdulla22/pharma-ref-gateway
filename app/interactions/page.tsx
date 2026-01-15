import { Suspense } from "react"
import { InteractionsPage } from "@/components/interactions-page"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InteractionsPage />
    </Suspense>
  )
}
