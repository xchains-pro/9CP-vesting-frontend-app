"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { formatEther } from "viem"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { CliffTableCell } from "@/components/ui/cliff-table-cell"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { EndTableCell } from "@/components/ui/end-table-cell"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { StartTableCell } from "@/components/ui/start-table-cell"
import { truncateAddress } from "@/lib/utils"
import { ProcessedSchedule } from "@/types/schedule"

export const columns: ColumnDef<ProcessedSchedule>[] = [
  {
    id: "Beneficiary",
    accessorFn: (originalRow) => {
      if (originalRow.ensName) return originalRow.ensName
      return originalRow.beneficiary
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Beneficiary" />
    ),
    cell: ({ row }) => {
      const schedule = row.original

      if (schedule.ensName) {
        return (
          <HoverCard openDelay={250}>
            <HoverCardTrigger>
              <Link
                href={`/users/${schedule.beneficiary}`}
                className="hover:underline"
              >
                {schedule.ensName}
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-[450px]" align="start">
              <div className="flex space-x-4">
                <Avatar>
                  <AvatarImage src={schedule.ensAvatar as string} />
                  <AvatarFallback>
                    {schedule.ensName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{schedule.ensName}</h4>
                  <p className="text-sm">{schedule.beneficiary}</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        )
      } else {
        return (
          <Link
            href={`/users/${schedule.beneficiary}`}
            className="hover:underline"
          >
            {truncateAddress(schedule.beneficiary)}
          </Link>
        )
      }
    },
  },
  {
    id: "Total Token Amount",
    accessorKey: "amountTotal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Token Amount" />
    ),
    cell: ({ row }) => {
      let schedule = row.original
      const totalFormatted = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
      }).format(Number(formatEther(schedule.amountTotal as bigint)))

      const releasedFormatted = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
      }).format(Number(formatEther(schedule.released as bigint)))

      const releasedPercentageFormatted = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
      }).format(
        (Number(schedule.released) / Number(schedule.amountTotal)) * 100
      )

      const releasableFormatted = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
      }).format(Number(formatEther(schedule.releasableAmount as bigint)))

      const releaseblePercentageFormatted = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
      }).format(
        (Number(schedule.releasableAmount) / Number(schedule.amountTotal)) * 100
      )

      return (
        <HoverCard openDelay={250}>
          <HoverCardTrigger>
            <span>{totalFormatted}</span>
            {schedule.status == 1 && (
              <Badge className="ml-2" variant="destructive">
                Revoked
              </Badge>
            )}
          </HoverCardTrigger>
          <HoverCardContent className="w-[450px]" align="start">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">
                Total Amount: {totalFormatted}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm">Tokens Released: {releasedFormatted}</p>
                <Badge>{releasedPercentageFormatted}%</Badge>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm">
                  Tokens Releasable Today: {releasableFormatted.toString()}
                </p>
                <Badge>{releaseblePercentageFormatted}%</Badge>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )
    },
  },
  {
    accessorKey: "start",
    header: "Start",
    cell: ({ row }) => {
      let schedule = row.original
      return <StartTableCell schedule={schedule} />
    },
  },
  {
    accessorKey: "cliff",
    header: "Cliff End",
    cell: ({ row }) => {
      const schedule = row.original
      return <CliffTableCell schedule={schedule} />
    },
  },
  {
    id: "End",
    accessorKey: "duration",
    header: "End",
    cell: ({ row }) => {
      const schedule = row.original
      return <EndTableCell schedule={schedule} />
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const schedule = row.original

      return (
        <Link
          href={`/users/${schedule.beneficiary}`}
          className={buttonVariants({ size: "sm" })}
        >
          Details
        </Link>
      )
    },
  },
]
