import { format, fromUnixTime, isAfter } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { ProcessedSchedule } from "@/types/schedule"

export function StartTableCell({ schedule }: { schedule: ProcessedSchedule }) {
  return (
    <>
      {isAfter(fromUnixTime(Number(schedule.start)), new Date()) ? (
        <Badge variant="secondary">
          {format(fromUnixTime(Number(schedule.start)), "MMM dd, yyyy")}
        </Badge>
      ) : (
        <Badge variant="outline">
          {format(fromUnixTime(Number(schedule.start)), "MMM dd, yyyy")}
        </Badge>
      )}
    </>
  )
}
