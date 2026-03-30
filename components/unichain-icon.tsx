export function UniChainIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B5A5" />
          <stop offset="100%" stopColor="#0E8A7E" />
        </linearGradient>
      </defs>
      
      {/* Outer ring */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="url(#iconGradient)"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Inner blockchain nodes */}
      <circle cx="10" cy="16" r="3" fill="url(#iconGradient)" />
      <circle cx="22" cy="16" r="3" fill="url(#iconGradient)" />
      <circle cx="16" cy="10" r="2.5" fill="url(#iconGradient)" />
      <circle cx="16" cy="22" r="2.5" fill="url(#iconGradient)" />
      
      {/* Connection lines */}
      <line x1="10" y1="16" x2="16" y2="10" stroke="#14B5A5" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="16" y1="10" x2="22" y2="16" stroke="#14B5A5" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="22" y1="16" x2="16" y2="22" stroke="#14B5A5" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="16" y1="22" x2="10" y2="16" stroke="#14B5A5" strokeWidth="1.5" strokeOpacity="0.6" />
    </svg>
  )
}
