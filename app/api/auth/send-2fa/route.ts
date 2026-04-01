import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { sendMail } from "@/lib/utils/email";
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash it for simple security
    const hash = crypto.createHash('sha256').update(otp + process.env.NEXT_PUBLIC_SUPABASE_URL).digest('hex');
    
    const cookieStore = await cookies();
    cookieStore.set('otp_hash', hash, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 300 }); // 5 minutes
    cookieStore.set('otp_email', email, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 300 });
    
    // Send email via Nodemailer SMTP
    await sendMail({
      to: email,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA Send Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
