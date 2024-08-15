import { format, fromUnixTime, isAfter } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { ProcessedSchedule } from "@/types/schedule"

export function CliffTableCell({ schedule }: { schedule: ProcessedSchedule }) {
  return (
    <>
      {schedule.cliff == schedule.start ? (
        <Badge variant="outline">No Cliff</Badge>
      ) : (
        <>
          {isAfter(fromUnixTime(Number(schedule.cliff)), new Date()) ? (
            <Badge variant="secondary">
              {format(fromUnixTime(Number(schedule.cliff)), "MMM dd, yyyy")}
            </Badge>
          ) : (
            <Badge variant="outline">
              {format(fromUnixTime(Number(schedule.cliff)), "MMM dd, yyyy")}
            </Badge>
          )}
        </>
      )}
    </>
  )
}
