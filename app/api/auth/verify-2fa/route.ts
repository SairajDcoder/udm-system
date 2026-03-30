import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json();
    if (!code || !email) {
      return NextResponse.json({ error: "Code and email required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const hash = cookieStore.get('otp_hash')?.value;
    const cookieEmail = cookieStore.get('otp_email')?.value;
    
    if (!hash || !cookieEmail || cookieEmail !== email) {
      return NextResponse.json({ error: "Code expired or invalid. Please request a new one." }, { status: 400 });
    }
    
    const computedHash = crypto.createHash('sha256').update(code + process.env.NEXT_PUBLIC_SUPABASE_URL).digest('hex');
    
    if (computedHash === hash) {
      // Clear OTP logic inside successful match
      cookieStore.delete('otp_hash');
      cookieStore.delete('otp_email');
      
      // Optionally store a simple passed flag cookie for middleware validation
      cookieStore.set('2fa_passed', 'true', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid 6-digit code" }, { status: 400 });
    }
  } catch (error) {
    console.error("2FA Verification Error:", error);
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
