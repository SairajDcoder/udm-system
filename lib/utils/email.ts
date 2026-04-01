import nodemailer from "nodemailer"

const smtpHost = process.env.SMTP_HOST
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM || "no-reply@unichain.com"

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
})

export async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("SMTP credentials are not fully configured in environment variables.")
  }
  
  return await transporter.sendMail({
    from: `"UniChain" <${smtpFrom}>`,
    to,
    subject,
    html,
  })
}
