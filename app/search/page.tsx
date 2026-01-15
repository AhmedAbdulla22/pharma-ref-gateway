import { Suspense } from "react"
import { DrugSearchPage } from "@/components/drug-search-page"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DrugSearchPage />
    </Suspense>
  )
}
