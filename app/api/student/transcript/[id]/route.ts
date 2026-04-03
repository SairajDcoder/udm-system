import { NextResponse } from "next/server"
import { getTranscriptRequestById } from "@/lib/unichain/service"

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const transcript = await getTranscriptRequestById(id)

  if (!transcript) {
    return NextResponse.json({ error: "Transcript request not found." }, { status: 404 })
  }

  return NextResponse.json(transcript)
}
