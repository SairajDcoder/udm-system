"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { UniChainIcon } from "@/components/unichain-icon"

interface TwoFactorVerificationProps {
  maskedEmail: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
}

export function TwoFactorVerification({ 
  maskedEmail, 
  onVerify, 
  onResend 
}: TwoFactorVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [timeLeft, setTimeLeft] = useState(60)
  const [isExpired, setIsExpired] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleInputChange = (index: number, value: string) => {
    if (isExpired || isVerifying || isSuccess) return

    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1)
    
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setHasError(false)

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isExpired || isVerifying || isSuccess) return

    // Backspace goes to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (isExpired || isVerifying || isSuccess) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    
    if (pastedData.length > 0) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      setHasError(false)
      
      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex((val) => !val)
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      } else {
        inputRefs.current[5]?.focus()
      }
    }
  }

  const handleVerify = useCallback(async () => {
    const code = otp.join("")
    if (code.length !== 6) return

    setIsVerifying(true)
    
    try {
      await onVerify(code)
      setIsSuccess(true)
      
      // Fade out after success
      setTimeout(() => {
        setIsFadingOut(true)
      }, 1500)
    } catch {
      setHasError(true)
      setOtp(Array(6).fill(""))
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }, [otp, onVerify])

  const handleResend = async () => {
    await onResend()
    setTimeLeft(60)
    setIsExpired(false)
    setOtp(Array(6).fill(""))
    setHasError(false)
    inputRefs.current[0]?.focus()
  }

  const isComplete = otp.every((digit) => digit !== "")

  // Calculate stroke dash offset for timer ring
  const circumference = 2 * Math.PI * 52 // radius = 52
  const strokeDashoffset = circumference * (1 - timeLeft / 60)

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-2xl w-full max-w-[480px] p-8
        ${isFadingOut ? 'animate-card-fade-out' : 'animate-card-scale-enter'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <UniChainIcon className="w-8 h-8" />
        <span className="font-serif font-bold text-xl text-[#0E8A7E]">UniChain</span>
      </div>

      {/* Shield Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 relative">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0E8A7E" />
                <stop offset="100%" stopColor="#14B5A5" />
              </linearGradient>
            </defs>
            {/* Shield shape */}
            <path 
              d="M32 4L8 14v18c0 14.4 10.24 27.84 24 32 13.76-4.16 24-17.6 24-32V14L32 4z" 
              fill="url(#shieldGradient)"
            />
            {/* Lock icon inside */}
            <g fill="white">
              <rect x="24" y="28" width="16" height="14" rx="2" />
              <path d="M26 28v-4a6 6 0 1 1 12 0v4h-3v-4a3 3 0 1 0-6 0v4h-3z" />
              <circle cx="32" cy="35" r="2" fill="#0E8A7E" />
              <rect x="31" y="35" width="2" height="4" fill="#0E8A7E" />
            </g>
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-serif font-bold text-2xl text-[#2E3748] text-center mb-2">
        Two-Factor Authentication
      </h1>

      {/* Instruction */}
      <p className="text-[15px] text-[#5C667A] text-center mb-2">
        Enter the 6-digit verification code sent to your email.
      </p>

      {/* Masked email */}
      <p className="text-[13px] text-[#5C667A] text-center mb-6">
        Code sent to {maskedEmail}
      </p>

      {/* OTP Input */}
      <div 
        className={`flex justify-center gap-2 mb-6 ${hasError ? 'animate-shake' : ''}`}
        onPaste={handlePaste}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isExpired || isVerifying || isSuccess}
            className={`
              w-11 h-[52px] text-center text-xl font-mono rounded-lg
              border-2 outline-none transition-all duration-100
              ${isSuccess 
                ? 'border-green-500 bg-green-50' 
                : hasError 
                  ? 'border-red-500' 
                  : digit
                    ? 'border-[#0E8A7E]' 
                    : 'border-gray-300'
              }
              ${isExpired ? 'bg-gray-100 cursor-not-allowed' : ''}
              focus:border-[#0E8A7E] focus:ring-2 focus:ring-[#0E8A7E]/20
            `}
          />
        ))}
        
        {/* Success checkmark overlay */}
        {isSuccess && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-12 h-12 text-green-500 animate-success-scale" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
              <path 
                d="M8 12l3 3 5-6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="animate-checkmark-draw"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Countdown Timer */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-[120px] h-[120px]">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background track */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={isExpired ? "#ef4444" : "#0E8A7E"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 linear"
            />
          </svg>
          {/* Timer text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-mono text-2xl font-bold ${isExpired ? 'text-red-500' : 'text-[#2E3748]'}`}>
              :{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <p className="text-[13px] text-[#5C667A] mt-2">
          {isExpired ? 'Code expired' : 'Code expires in'}
        </p>
        
        {/* Resend link */}
        {isExpired && (
          <button 
            onClick={handleResend}
            className="text-[#0E8A7E] text-sm font-medium mt-2 hover:underline"
          >
            Resend Code
          </button>
        )}
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        disabled={!isComplete || isExpired || isVerifying || isSuccess}
        className="w-full h-12 bg-[#0E8A7E] hover:bg-[#0E8A7E]/90 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Verifying on blockchain...
          </>
        ) : isSuccess ? (
          'Verified!'
        ) : (
          'Verify'
        )}
      </Button>

      {/* Backup code link */}
      <p className="text-center mt-4">
        <button className="text-[#0E8A7E] text-[13px] hover:underline">
          Use backup code instead
        </button>
      </p>
    </div>
  )
}
