import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendMail } from "@/lib/utils/email"
import { registerUserProfile } from "@/lib/unichain/service"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: "Configuration Error: SUPABASE_SERVICE_ROLE_KEY is perfectly missing in your environment." },
        { status: 500 }
      )
    }

    const { email, password, data } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    // Initialize Supabase admin client to bypass the regular auth limitations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create the user and auto-confirm their email so they can log in instantly
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: data || {},
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    console.log("-----------------------------------------")
    console.log("✅ USER SUCCESSFULLY CREATED AND AUTO-CONFIRMED")
    console.log("-----------------------------------------")

    const userProfile = await registerUserProfile({
      email,
      role: data?.role || "student",
      fullName: data?.full_name,
      personalEmail: data?.personal_email,
      phone: data?.phone,
      dateOfBirth: data?.date_of_birth,
      gender: data?.gender,
      department: data?.department,
      programme: data?.programme,
      enrollmentId: data?.enrollment_id,
      joinYear: data?.join_year,
      walletAddress: data?.wallet_address,
      mfaEnabled: data?.mfa_enabled,
    })

    let mfaUri = null
    if (userProfile.mfaEnabled && userProfile.mfaSecret) {
      const speakeasy = require("speakeasy")
      mfaUri = speakeasy.otpauthURL({
        secret: userProfile.mfaSecret,
        label: email,
        issuer: "UniChain",
        encoding: "base32"
      })
    }

    return NextResponse.json({ success: true, user: authData.user, mfaUri })

  } catch (err: any) {
    console.error("Registration error:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
