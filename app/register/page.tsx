import { BlockchainAnimation } from "@/components/blockchain-animation"
import { UniChainIcon } from "@/components/unichain-icon"
import { RegistrationForm } from "@/components/registration-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="w-full lg:w-[45%] bg-[#0A1628] flex flex-col items-center justify-center p-8 lg:p-12 min-h-[300px] lg:min-h-screen relative overflow-hidden">
        {/* Blockchain Animation */}
        <div className="absolute inset-0 opacity-30">
          <BlockchainAnimation />
        </div>
        
        {/* Branding Content */}
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <UniChainIcon className="w-12 h-12" />
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white">
              UniChain
            </h1>
          </div>
          
          <p className="text-[#14B5A5] text-lg lg:text-xl font-medium tracking-wide">
            Secure. Verified. Immutable.
          </p>
          
          <p className="text-gray-400 mt-4 max-w-xs mx-auto text-sm lg:text-base">
            Join the blockchain-powered academic credential platform
          </p>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-[55%] bg-[#F8F9FB] flex items-center justify-center p-6 lg:p-12 min-h-screen">
        <div className="w-full max-w-[520px]">
          <div className="bg-white rounded-xl shadow-lg p-8 animate-card-enter">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-[#2E3748]">
                Create Your Account
              </h2>
              <p className="text-[#5C667A] mt-2">
                Register to access the UniChain platform
              </p>
            </div>

            <RegistrationForm />

            <p className="text-center text-sm text-[#5C667A] mt-6">
              Already have an account?{" "}
              <Link href="/" className="text-[#0E8A7E] hover:text-[#14B5A5] font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
