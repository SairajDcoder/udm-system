"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, ChevronDown, Upload, Lock, Eye, EyeOff, Copy, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
import { QRCodeSVG } from "qrcode.react"

type Role = "student" | "faculty" | "admin"
type Gender = "male" | "female" | "prefer-not-to-say"

interface FormData {
  // Step 1
  fullName: string
  dateOfBirth: string
  gender: Gender | ""
  phoneNumber: string
  personalEmail: string
  profilePhoto: File | null
  
  // Step 2
  institutionalEmail: string
  enrollmentId: string
  role: Role
  department: string
  programme: string
  joinYear: string
  
  // Step 3
  password: string
  confirmPassword: string
  enableMfa: boolean
  totpCode: string[]
  acceptTerms: boolean
}

const initialFormData: FormData = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  phoneNumber: "",
  personalEmail: "",
  profilePhoto: null,
  institutionalEmail: "",
  enrollmentId: "",
  role: "student",
  department: "",
  programme: "",
  joinYear: "",
  password: "",
  confirmPassword: "",
  enableMfa: true,
  totpCode: ["", "", "", "", "", ""],
  acceptTerms: false,
}

const departments = ["CSE", "IT", "ENTC", "Mechanical", "Civil"]
const programmes = ["B.Tech", "M.Tech", "PhD"]

export function RegistrationForm() {
  const router = useRouter()
  const supabase = createClient()
  const { open } = useAppKit()
  const { address: connectedWallet, isConnected } = useAppKitAccount()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
  const [isComplete, setIsComplete] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [registeredWalletAddress, setRegisteredWalletAddress] = useState("")
  const [mfaUri, setMfaUri] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { number: 1, label: "Personal Info" },
    { number: 2, label: "Institutional Details" },
    { number: 3, label: "Security Setup" },
  ]

  const updateFormData = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleNext = () => {
    setSlideDirection("right")
    setCurrentStep(prev => Math.min(prev + 1, steps.length))
  }

  const handleBack = () => {
    setSlideDirection("left")
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const submitRegistration = async () => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.institutionalEmail,
          password: formData.password,
          data: {
            full_name: formData.fullName,
            personal_email: formData.personalEmail,
            role: formData.role,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            department: formData.department,
            programme: formData.programme,
            enrollment_id: formData.enrollmentId,
            phone: formData.phoneNumber,
            join_year: formData.joinYear,
            wallet_address: connectedWallet || null,
            mfa_enabled: formData.enableMfa,
          }
        })
      })

      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.error || "Failed to register account")
      }

      if (resData.mfaUri) {
        setMfaUri(resData.mfaUri)
      }

      setRegisteredWalletAddress(connectedWallet || resData.user?.id?.slice(0, 42) || "")
      setIsSubmitting(false)
      setIsComplete(true)
      return true
    } catch (err: any) {
      setSubmitError(err.message)
      setIsSubmitting(false)
      return false
    }
  }

  const handleStep3Submit = async () => {
    await submitRegistration()
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateFormData("profilePhoto", file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(registeredWalletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isInstitutionalEmailValid = formData.institutionalEmail.endsWith("@mitaoe.ac.in")

  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: "", color: "" }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    const levels = [
      { level: 1, label: "Weak", color: "bg-red-500" },
      { level: 2, label: "Fair", color: "bg-orange-500" },
      { level: 3, label: "Good", color: "bg-yellow-500" },
      { level: 4, label: "Strong", color: "bg-green-500" },
    ]

    return levels[score - 1] || { level: 0, label: "", color: "" }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordsMatch = !!(formData.password && formData.confirmPassword && formData.password === formData.confirmPassword)

  if (isComplete) {
    return (
      <div className="text-center py-8">
        {/* Animated Checkmark */}
        <div className="w-24 h-24 mx-auto mb-6 animate-success-scale">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#0E8A7E"
              strokeWidth="3"
              opacity="0.2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="#0E8A7E"
              opacity="0.1"
            />
            <path
              d="M30 50 L45 65 L70 35"
              fill="none"
              stroke="#0E8A7E"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-checkmark-draw"
            />
          </svg>
        </div>

        <h3 className="text-2xl font-serif font-bold text-[#2E3748] mb-2">
          Account Created!
        </h3>
        
        {mfaUri ? (
          <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm inline-block mx-auto">
             <h4 className="font-bold text-navy-900 mb-2">Configure Multi-Factor Authentication</h4>
             <p className="text-sm text-gray-500 mb-4 max-w-sm">Scan this QR code with Google Authenticator or Authy. You will need to enter a generated code when logging in.</p>
             <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <QRCodeSVG value={mfaUri} size={200} />
             </div>
          </div>
        ) : (
          <p className="text-[#5C667A] mb-8 max-w-sm mx-auto">
            Your account was effectively created. Please check your email inbox to verify your account before logging in.
          </p>
        )}

        {/* Wallet Address */}
        <div className="bg-[#F8F9FB] rounded-lg p-4 flex items-center justify-between gap-3">
          <code className="font-mono text-[13px] text-[#5C667A] truncate">
            {registeredWalletAddress || "No wallet connected"}
          </code>
          <button
            onClick={copyWalletAddress}
            className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-md transition-colors"
            aria-label="Copy wallet address"
          >
            {copied ? (
              <CheckCircle2 className="w-5 h-5 text-[#0E8A7E]" />
            ) : (
              <Copy className="w-5 h-5 text-[#5C667A]" />
            )}
          </button>
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-8 w-full h-11 bg-[#0E8A7E] hover:bg-[#14B5A5] text-white font-medium rounded-md transition-colors"
        >
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  currentStep > step.number
                    ? "bg-[#0E8A7E] text-white"
                    : currentStep === step.number
                    ? "bg-[#0E8A7E] text-white"
                    : "bg-[#DDE1EA] text-[#5C667A]"
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1.5 font-medium transition-colors",
                  currentStep >= step.number ? "text-[#0E8A7E]" : "text-[#5C667A]"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-16 sm:w-24 h-0.5 mx-2 transition-colors duration-300",
                  currentStep > step.number ? "bg-[#0E8A7E]" : "bg-[#DDE1EA]"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="overflow-hidden">
        <div
          key={currentStep}
          className={cn(
            slideDirection === "right" ? "animate-slide-in-right" : "animate-slide-in-left"
          )}
        >
          {currentStep === 1 && (
            <Step1
              formData={formData}
              updateFormData={updateFormData}
              photoPreview={photoPreview}
              fileInputRef={fileInputRef}
              handlePhotoUpload={handlePhotoUpload}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <Step2
              formData={formData}
              updateFormData={updateFormData}
              isInstitutionalEmailValid={isInstitutionalEmailValid}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {currentStep === 3 && (
            <Step3
              formData={formData}
              updateFormData={updateFormData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              passwordStrength={passwordStrength}
              passwordsMatch={passwordsMatch}
              onBack={handleBack}
              onNext={handleStep3Submit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
        
        {submitError && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 animate-fade-in">
            {submitError}
          </div>
        )}
      </div>
    </div>
  )
}

// Step 1: Personal Information
function Step1({
  formData,
  updateFormData,
  photoPreview,
  fileInputRef,
  handlePhotoUpload,
  onNext,
}: {
  formData: FormData
  updateFormData: <K extends keyof FormData>(key: K, value: FormData[K]) => void
  photoPreview: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-5">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => updateFormData("fullName", e.target.value)}
          className="w-full h-11 px-4 rounded-md border border-gray-200 bg-white text-[#2E3748] placeholder:text-[#5C667A]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 focus:border-[#0E8A7E] transition-all"
          placeholder="Enter your full name"
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          Date of Birth
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
          className="w-full h-11 px-4 rounded-md border border-gray-200 bg-white text-[#2E3748] focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 focus:border-[#0E8A7E] transition-all"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-2">
          Gender
        </label>
        <div className="flex flex-wrap gap-4">
          {[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "prefer-not-to-say", label: "Prefer not to say" },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  formData.gender === option.value
                    ? "border-[#0E8A7E]"
                    : "border-gray-300"
                )}
              >
                {formData.gender === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0E8A7E]" />
                )}
              </div>
              <input
                type="radio"
                name="gender"
                value={option.value}
                checked={formData.gender === option.value}
                onChange={(e) => updateFormData("gender", e.target.value as Gender)}
                className="sr-only"
              />
              <span className="text-sm text-[#2E3748]">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          Phone Number
        </label>
        <div className="flex">
          <span className="flex items-center justify-center px-3 h-11 bg-[#F8F9FB] border border-r-0 border-gray-200 rounded-l-md text-sm text-[#5C667A]">
            +91
          </span>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => updateFormData("phoneNumber", e.target.value)}
            className="flex-1 h-11 px-4 rounded-r-md border border-gray-200 bg-white text-[#2E3748] placeholder:text-[#5C667A]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 focus:border-[#0E8A7E] transition-all"
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* Personal Email */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          Personal Email
        </label>
        <input
          type="email"
          value={formData.personalEmail}
          onChange={(e) => updateFormData("personalEmail", e.target.value)}
          className="w-full h-11 px-4 rounded-md border border-gray-200 bg-white text-[#2E3748] placeholder:text-[#5C667A]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 focus:border-[#0E8A7E] transition-all"
          placeholder="Enter personal email"
        />
      </div>

      {/* Profile Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          Profile Photo
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "w-[200px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#0E8A7E] hover:bg-[#0E8A7E]/5 transition-colors overflow-hidden",
            photoPreview && "border-solid border-[#0E8A7E]"
          )}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-[#5C667A] mb-2" />
              <span className="text-sm text-[#5C667A] text-center px-4">
                Drag & drop or click to upload
              </span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="h-11 px-6 bg-[#0E8A7E] hover:bg-[#14B5A5] text-white font-medium rounded-md transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  )
}

// Step 2: Institutional Details
function Step2({
  formData,
  updateFormData,
  isInstitutionalEmailValid,
  onBack,
  onNext,
}: {
  formData: FormData
  updateFormData: <K extends keyof FormData>(key: K, value: FormData[K]) => void
  isInstitutionalEmailValid: boolean
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-5">
      {/* Institutional Email */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          Institutional Email
        </label>
        <div className="relative">
          <input
            type="email"
            value={formData.institutionalEmail}
            onChange={(e) => updateFormData("institutionalEmail", e.target.value)}
            className={cn(
              "w-full h-11 px-4 pr-10 rounded-md border bg-white text-[#2E3748] placeholder:text-[#5C667A]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 transition-all",
              isInstitutionalEmailValid
                ? "border-green-500 focus:border-green-500"
                : "border-gray-200 focus:border-[#0E8A7E]"
            )}
            placeholder="yourname@mitaoe.ac.in"
          />
          {isInstitutionalEmailValid && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
        </div>
      </div>

      {/* Enrollment / Employee ID */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          Enrollment / Employee ID
        </label>
        <input
          type="text"
          value={formData.enrollmentId}
          onChange={(e) => updateFormData("enrollmentId", e.target.value)}
          className="w-full h-11 px-4 rounded-md border border-gray-200 bg-white text-[#2E3748] placeholder:text-[#5C667A]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 focus:border-[#0E8A7E] transition-all"
          placeholder="Enter your ID"
        />
      </div>

      {/* Role Selector */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-2">
          Role
        </label>
        <div className="flex rounded-lg border border-gray-200 p-1 bg-[#F8F9FB]">
          {(["student", "faculty", "admin"] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => updateFormData("role", role)}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all",
                formData.role === role
                  ? "bg-[#0E8A7E] text-white shadow-sm"
                  : "text-[#5C667A] hover:text-[#2E3748]"
              )}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Department Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          Department
        </label>
        <div className="relative">
          <select
            value={formData.department}
            onChange={(e) => updateFormData("department", e.target.value)}
            className="w-full h-11 px-4 pr-10 rounded-md border border-gray-200 bg-white text-[#2E3748] focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 focus:border-[#0E8A7E] transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>Select department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5C667A] pointer-events-none" />
        </div>
      </div>

      {/* Programme Dropdown (conditional) */}
      {formData.role === "student" && (
        <div>
          <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
            Programme
          </label>
          <div className="relative">
            <select
              value={formData.programme}
              onChange={(e) => updateFormData("programme", e.target.value)}
              className="w-full h-11 px-4 pr-10 rounded-md border border-gray-200 bg-white text-[#2E3748] focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 focus:border-[#0E8A7E] transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>Select programme</option>
              {programmes.map((prog) => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5C667A] pointer-events-none" />
          </div>
        </div>
      )}

      {/* Admission / Join Year */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          {formData.role === "student" ? "Admission Year" : "Join Year"}
        </label>
        <div className="relative">
          <select
            value={formData.joinYear}
            onChange={(e) => updateFormData("joinYear", e.target.value)}
            className="w-full h-11 px-4 pr-10 rounded-md border border-gray-200 bg-white text-[#2E3748] focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 focus:border-[#0E8A7E] transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>Select year</option>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5C667A] pointer-events-none" />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="h-11 px-6 border border-gray-200 text-[#5C667A] hover:bg-gray-50 font-medium rounded-md transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="h-11 px-6 bg-[#0E8A7E] hover:bg-[#14B5A5] text-white font-medium rounded-md transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  )
}

// Step 3: Security Setup
function Step3({
  formData,
  updateFormData,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordStrength,
  passwordsMatch,
  onBack,
  onNext,
  isSubmitting,
}: {
  formData: FormData
  updateFormData: <K extends keyof FormData>(key: K, value: FormData[K]) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (show: boolean) => void
  passwordStrength: { level: number; label: string; color: string }
  passwordsMatch: boolean
  onBack: () => void
  onNext: () => void
  isSubmitting: boolean
}) {
  return (
    <div className="space-y-5">
      {/* Create Password */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          Create Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateFormData("password", e.target.value)}
            className="w-full h-11 px-4 pr-10 rounded-md border border-gray-200 bg-white text-[#2E3748] placeholder:text-[#5C667A]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 focus:border-[#0E8A7E] transition-all"
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C667A] hover:text-[#2E3748]"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Password Strength Meter */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    level <= passwordStrength.level ? passwordStrength.color : "bg-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-[#5C667A]">{passwordStrength.label}</span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-[#2E3748] mb-1.5">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => updateFormData("confirmPassword", e.target.value)}
            className={cn(
              "w-full h-11 px-4 pr-20 rounded-md border bg-white text-[#2E3748] placeholder:text-[#5C667A]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8A7E]/20 transition-all",
              formData.confirmPassword && (
                passwordsMatch ? "border-green-500" : "border-red-500"
              ),
              !formData.confirmPassword && "border-gray-200 focus:border-[#0E8A7E]"
            )}
            placeholder="Confirm your password"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {formData.confirmPassword && (
              passwordsMatch ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-red-500 text-lg font-bold">×</span>
              )
            )}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[#5C667A] hover:text-[#2E3748]"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Enable MFA Toggle */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-[#2E3748]">Enable MFA</span>
        <button
          type="button"
          onClick={() => updateFormData("enableMfa", !formData.enableMfa)}
          className={cn(
            "w-12 h-6 rounded-full transition-colors relative",
            formData.enableMfa ? "bg-[#0E8A7E]" : "bg-gray-300"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
              formData.enableMfa ? "translate-x-6" : "translate-x-0.5"
            )}
          />
        </button>
      </div>

      {/* Accept Terms Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
            formData.acceptTerms
              ? "bg-[#0E8A7E] border-[#0E8A7E]"
              : "border-gray-300"
          )}
        >
          {formData.acceptTerms && <Check className="w-3 h-3 text-white" />}
        </div>
        <input
          type="checkbox"
          checked={formData.acceptTerms}
          onChange={(e) => updateFormData("acceptTerms", e.target.checked)}
          className="sr-only"
        />
        <span className="text-sm text-[#5C667A]">
          I accept the{" "}
          <a href="#" className="text-[#0E8A7E] hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-[#0E8A7E] hover:underline">Privacy Policy</a>
        </span>
      </label>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={onNext}
          disabled={!formData.acceptTerms || !passwordsMatch || isSubmitting}
          className="w-full h-11 flex items-center justify-center bg-[#0E8A7E] hover:bg-[#14B5A5] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
        >
          {isSubmitting ? (
             <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
          ) : formData.enableMfa ? (
            "Create Account & Set Up MFA"
          ) : (
            "Complete Registration"
          )}
        </button>
        <button
          onClick={onBack}
          className="w-full h-11 border border-gray-200 text-[#5C667A] hover:bg-gray-50 font-medium rounded-md transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  )
}
