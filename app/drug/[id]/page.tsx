import { Suspense } from "react"
import { DrugDetailPage } from "@/components/drug-detail-page"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={null}>
      <DrugDetailPage drugId={id} />
    </Suspense>
  )
}
