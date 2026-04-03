import { NextResponse } from "next/server"
import { listFacultyTransfers } from "@/lib/unichain/service"

export async function GET() {
  const transfers = await listFacultyTransfers()
  return NextResponse.json({ transfers })
}
