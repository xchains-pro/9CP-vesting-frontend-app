import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { address: string }
  }
) {
  revalidatePath(`/users/${params.address}`)
  revalidatePath(`/schedules`)
  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    path: `/users/${params.address}`,
  })
}
