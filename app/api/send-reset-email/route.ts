import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, resetLink } = await req.json()

    if (!email || !resetLink) {
      return NextResponse.json(
        { error: "Email and reset link are required" },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: "UniChain <no-reply@resend.dev>",
      to: [email],
      subject: "Reset your UniChain password",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Password Reset</title>
        </head>
        <body style="margin:0;padding:0;background-color:#F0F4F8;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F4F8;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#0A1628 0%,#0E3D38 100%);padding:32px 40px;text-align:center;">
                      <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                        <tr>
                          <td style="padding-right:10px;vertical-align:middle;">
                            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="16" cy="16" r="14" stroke="#14B5A5" stroke-width="2" fill="none"/>
                              <circle cx="10" cy="16" r="3" fill="#14B5A5"/>
                              <circle cx="22" cy="16" r="3" fill="#14B5A5"/>
                              <circle cx="16" cy="10" r="2.5" fill="#14B5A5"/>
                              <circle cx="16" cy="22" r="2.5" fill="#14B5A5"/>
                              <line x1="10" y1="16" x2="16" y2="10" stroke="#14B5A5" stroke-width="1.5" stroke-opacity="0.6"/>
                              <line x1="16" y1="10" x2="22" y2="16" stroke="#14B5A5" stroke-width="1.5" stroke-opacity="0.6"/>
                              <line x1="22" y1="16" x2="16" y2="22" stroke="#14B5A5" stroke-width="1.5" stroke-opacity="0.6"/>
                              <line x1="16" y1="22" x2="10" y2="16" stroke="#14B5A5" stroke-width="1.5" stroke-opacity="0.6"/>
                            </svg>
                          </td>
                          <td style="vertical-align:middle;">
                            <span style="color:#14B5A5;font-size:22px;font-weight:700;letter-spacing:-0.5px;">UniChain</span>
                          </td>
                        </tr>
                      </table>
                      <p style="color:#94A3B8;margin:8px 0 0;font-size:13px;">Secure Academic Credentials</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      
                      <!-- Lock Icon -->
                      <div style="text-align:center;margin-bottom:24px;">
                        <div style="width:64px;height:64px;margin:0 auto;background:linear-gradient(135deg,#0E8A7E22,#14B5A522);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #14B5A540;">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto;margin-top:18px;">
                            <rect x="5" y="11" width="14" height="10" rx="2" fill="#0E8A7E"/>
                            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#0E8A7E" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="12" cy="16" r="1.5" fill="white"/>
                          </svg>
                        </div>
                      </div>

                      <h1 style="color:#0A1628;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">Reset Your Password</h1>
                      <p style="color:#5C667A;font-size:15px;text-align:center;margin:0 0 28px;line-height:1.6;">
                        We received a request to reset your UniChain account password. Click the button below to create a new password.
                      </p>

                      <!-- CTA Button -->
                      <div style="text-align:center;margin-bottom:28px;">
                        <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#0E8A7E,#14B5A5);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
                          Reset Password
                        </a>
                      </div>

                      <!-- Expiry Notice -->
                      <div style="background:#FFF8EC;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;margin-bottom:28px;text-align:center;">
                        <p style="color:#92400E;font-size:13px;margin:0;">
                          ⏱ This link expires in <strong>15 minutes</strong>
                        </p>
                      </div>

                      <!-- Fallback URL -->
                      <p style="color:#5C667A;font-size:13px;text-align:center;margin:0 0 4px;">If the button doesn't work, copy this link:</p>
                      <p style="color:#0E8A7E;font-size:12px;text-align:center;word-break:break-all;margin:0 0 28px;">
                        <a href="${resetLink}" style="color:#0E8A7E;">${resetLink}</a>
                      </p>

                      <!-- Warning -->
                      <div style="background:#F8F9FB;border-radius:8px;padding:14px 16px;">
                        <p style="color:#5C667A;font-size:13px;margin:0;line-height:1.6;">
                          🔒 If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#F8F9FB;padding:20px 40px;text-align:center;border-top:1px solid #E5E9F0;">
                      <p style="color:#94A3B8;font-size:12px;margin:0;">
                        MIT Academy of Engineering · UniChain Portal<br/>
                        This email was sent automatically. Please do not reply.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error("Send reset email error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
