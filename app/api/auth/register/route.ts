import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendMail } from "@/lib/utils/email"

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

    // Generate an email signup link. This creates the user without automatically 
    // sending the rate-limited Supabase confirmation email if combined with Admin auth.
    // Wait, generateLink internally sends an email if not careful? No, generateLink
    // specifically generates the link *instead* of sending the email.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: data || {},
      },
    })

    if (linkError) {
      // If user already exists and is registered, Supabase will throw an error or handle it.
      return NextResponse.json({ error: linkError.message }, { status: 400 })
    }

    const actionLink = linkData.properties?.action_link

    if (!actionLink) {
      return NextResponse.json({ error: "Failed to generate verification link." }, { status: 500 })
    }

    console.log("-----------------------------------------")
    console.log("✅ REGISTRATION VERIFICATION LINK:")
    console.log(actionLink)
    console.log("-----------------------------------------")

    // Now send the registration email via our own SMTP using NodeMailer
    // Using an incredibly basic HTML structure to avoid strict spam filters silently dropping the mail.
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to UniChain!</h2>
        <p>Your account has been successfully created. Please click the link below to verify your email address:</p>
        <p><a href="${actionLink}" style="color: #0E8A7E; font-weight: bold;">Verify My Account</a></p>
        <p style="margin-top: 20px; font-size: 13px; color: #666;">
          Or copy and paste this URL into your browser:<br/>
          ${actionLink}
        </p>
        <p style="margin-top: 30px; font-size: 12px; color: #999;">
          MIT Academy of Engineering · UniChain Portal
        </p>
      </div>
    `

    await sendMail({
      to: email,
      subject: "Welcome to UniChain - Please Verify Your Account",
      html: htmlEmail,
    })

    // Return the created user object mimicking a successful register
    return NextResponse.json({ success: true, user: linkData.user })

  } catch (err: any) {
    console.error("SMTP Registration error:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
