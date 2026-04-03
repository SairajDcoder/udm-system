import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/utils/email";
import { createOtpChallenge } from "@/lib/unichain/service";
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { code: otp } = await createOtpChallenge(normalizedEmail);
    const response = NextResponse.json({ success: true, email: normalizedEmail });
    response.cookies.set('otp_email', normalizedEmail, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 300, path: "/" });
    
    // Send email via Nodemailer SMTP
    await sendMail({
      to: normalizedEmail,
      subject: "Your UniChain Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0E8A7E;">Authentication Required</h2>
          <p>Please use the following 6-digit code to complete your login securely:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <strong style="font-size: 24px; letter-spacing: 5px; color: #0A1628;">${otp}</strong>
          </div>
          <p style="font-size: 13px; color: #888;">This code will expire in 5 minutes.</p>
          <p style="font-size: 13px; color: #888; border-top: 1px solid #eee; padding-top: 20px;">If you didn't attempt to log in, you can safely ignore this email.</p>
        </div>
      `
    });

    return response;
  } catch (error) {
    console.error("2FA Send Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
