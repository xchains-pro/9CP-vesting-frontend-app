import { format, fromUnixTime, isAfter } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { ProcessedSchedule } from "@/types/schedule"

export function EndTableCell({ schedule }: { schedule: ProcessedSchedule }) {
  let end = Number(schedule.start) + Number(schedule.duration)
  return (
    <>
      {isAfter(fromUnixTime(end), new Date()) ? (
        <Badge variant="secondary">
          {format(fromUnixTime(end), "MMM dd, yyyy")}
        </Badge>
      ) : (
        <Badge variant="outline">
          {format(fromUnixTime(end), "MMM dd, yyyy")}
        </Badge>
      )}
    </>
  )
}
