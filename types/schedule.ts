export interface Schedule {
  amountTotal: BigInt
  beneficiary: string
  cliff: BigInt
  duration: BigInt
  released: BigInt
  revokable: boolean
  start: BigInt
  status: number
}

export interface ProcessedSchedule extends Schedule {
  id: string
  releasableAmount: BigInt
  ensName: string | null
  ensAvatar: string | null
}
