import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin" />
      <p className="mt-2 text-sm">
        Getting all schedules, this can take a while…
      </p>
    </div>
  )
}
