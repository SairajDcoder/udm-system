"use client"

export function BlockchainAnimation() {
  return (
    <svg
      viewBox="0 0 300 200"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for nodes */}
        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B5A5" />
          <stop offset="100%" stopColor="#0E8A7E" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connection Lines */}
      <g className="connection-lines">
        {/* Line 1: Node 1 to Node 2 */}
        <line
          x1="60" y1="100"
          x2="150" y2="50"
          stroke="#14B5A5"
          strokeWidth="2"
          strokeOpacity="0.4"
          className="animate-line-draw"
          style={{ animationDelay: "0s" }}
        />
        {/* Line 2: Node 1 to Node 3 */}
        <line
          x1="60" y1="100"
          x2="150" y2="150"
          stroke="#14B5A5"
          strokeWidth="2"
          strokeOpacity="0.4"
          className="animate-line-draw"
          style={{ animationDelay: "0.3s" }}
        />
        {/* Line 3: Node 2 to Node 4 */}
        <line
          x1="150" y1="50"
          x2="240" y2="100"
          stroke="#14B5A5"
          strokeWidth="2"
          strokeOpacity="0.4"
          className="animate-line-draw"
          style={{ animationDelay: "0.6s" }}
        />
        {/* Line 4: Node 3 to Node 4 */}
        <line
          x1="150" y1="150"
          x2="240" y2="100"
          stroke="#14B5A5"
          strokeWidth="2"
          strokeOpacity="0.4"
          className="animate-line-draw"
          style={{ animationDelay: "0.9s" }}
        />
        {/* Line 5: Node 2 to Node 3 */}
        <line
          x1="150" y1="50"
          x2="150" y2="150"
          stroke="#14B5A5"
          strokeWidth="2"
          strokeOpacity="0.3"
          className="animate-line-draw"
          style={{ animationDelay: "1.2s" }}
        />
      </g>

      {/* Blockchain Nodes */}
      <g filter="url(#glow)">
        {/* Node 1 - Left */}
        <circle
          cx="60" cy="100"
          r="18"
          fill="url(#nodeGradient)"
          className="animate-pulse-slow"
          style={{ animationDelay: "0s" }}
        />
        <circle
          cx="60" cy="100"
          r="8"
          fill="#0A1628"
          opacity="0.6"
        />

        {/* Node 2 - Top Center */}
        <circle
          cx="150" cy="50"
          r="15"
          fill="url(#nodeGradient)"
          className="animate-pulse-slow"
          style={{ animationDelay: "0.5s" }}
        />
        <circle
          cx="150" cy="50"
          r="6"
          fill="#0A1628"
          opacity="0.6"
        />

        {/* Node 3 - Bottom Center */}
        <circle
          cx="150" cy="150"
          r="15"
          fill="url(#nodeGradient)"
          className="animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
        <circle
          cx="150" cy="150"
          r="6"
          fill="#0A1628"
          opacity="0.6"
        />

        {/* Node 4 - Right */}
        <circle
          cx="240" cy="100"
          r="18"
          fill="url(#nodeGradient)"
          className="animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        />
        <circle
          cx="240" cy="100"
          r="8"
          fill="#0A1628"
          opacity="0.6"
        />
      </g>

      {/* Animated data particles */}
      <circle r="3" fill="#14B5A5" className="animate-particle-1">
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path="M60,100 L150,50 L240,100"
        />
      </circle>
      <circle r="3" fill="#14B5A5" className="animate-particle-2">
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path="M60,100 L150,150 L240,100"
          begin="1.5s"
        />
      </circle>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes line-draw {
          0% { stroke-dashoffset: 200; opacity: 0; }
          50% { opacity: 0.4; }
          100% { stroke-dashoffset: 0; opacity: 0.4; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-line-draw {
          stroke-dasharray: 200;
          animation: line-draw 2s ease-out forwards;
        }
        
        .animate-particle-1, .animate-particle-2 {
          opacity: 0.8;
        }
      `}</style>
    </svg>
  )
}
