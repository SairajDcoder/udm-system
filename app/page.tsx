import { BlockchainAnimation } from "@/components/blockchain-animation"
import { LoginForm } from "@/components/login-form"
import { UniChainIcon } from "@/components/unichain-icon"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Brand Section */}
      <div className="w-full lg:w-[45%] bg-navy-900 flex flex-col relative overflow-hidden min-h-[200px] lg:min-h-screen">
        {/* Institution Logo */}
        <div className="flex items-center gap-3 p-6 z-10">
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-white font-serif font-bold text-lg">MIT</span>
          </div>
          <span className="text-white text-sm font-sans">MIT Academy of Engineering</span>
        </div>

        {/* Centered Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-8 lg:py-0">
          {/* Blockchain Animation */}
          <div className="w-full max-w-[300px] h-[150px] lg:h-[200px] mb-6">
            <BlockchainAnimation />
          </div>

          {/* UniChain Wordmark */}
          <h1 className="text-teal-400 font-serif font-bold text-3xl lg:text-4xl mb-3">
            UniChain
          </h1>
          <p className="text-white font-serif font-light text-lg lg:text-xl tracking-wide">
            Secure. Verified. Immutable.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[55%] bg-gray-50 flex items-center justify-center p-6 lg:p-12">
        <LoginForm />
      </div>
    </main>
  )
}
