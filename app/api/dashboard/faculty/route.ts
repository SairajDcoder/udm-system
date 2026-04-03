import { NextResponse } from "next/server"
import { getDashboardData } from "@/lib/unichain/service"

export async function GET() {
  const data = await getDashboardData("faculty")
  return NextResponse.json(data)
}
