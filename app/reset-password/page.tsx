import { BlockchainAnimation } from "@/components/blockchain-animation"
import { UniChainIcon } from "@/components/unichain-icon"
import { ResetPasswordForm } from "@/components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Navy with Blockchain Animation */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0A1628] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Blockchain Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <BlockchainAnimation />
        </div>
        
        {/* Brand Content */}
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <UniChainIcon className="w-12 h-12" />
            <span className="font-serif text-3xl font-bold text-white">UniChain</span>
          </div>
          <p className="text-[#14B5A5] text-lg font-medium mb-2">
            Secure. Verified. Immutable.
          </p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            University blockchain platform for academic credentials
          </p>
        </div>
      </div>

      {/* Right Panel - White with Form */}
      <div className="flex-1 lg:w-[55%] bg-[#F8F9FB] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[480px]">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <UniChainIcon className="w-8 h-8" />
            <span className="font-serif text-xl font-bold text-[#0A1628]">UniChain</span>
          </div>
          
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
