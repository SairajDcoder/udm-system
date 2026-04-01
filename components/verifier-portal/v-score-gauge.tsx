"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface VScoreGaugeProps {
  score: number
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function VScoreGauge({ score, size = "lg", animated = true }: VScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)

  useEffect(() => {
    if (!animated) return
    
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score, animated])

  const radius = size === "lg" ? 90 : size === "md" ? 70 : 50
  const strokeWidth = size === "lg" ? 12 : size === "md" ? 10 : 8
  const circumference = 2 * Math.PI * radius
  const progress = (displayScore / 100) * circumference
  const offset = circumference - progress

  const getScoreColor = () => {
    if (displayScore >= 80) return "text-success"
    if (displayScore >= 50) return "text-warning"
    return "text-destructive"
  }

  const getStrokeColor = () => {
    if (displayScore >= 80) return "#22c55e" // success
    if (displayScore >= 50) return "#eab308" // warning
    return "#ef4444" // destructive
  }

  const dimensions = {
    sm: { viewBox: 120, fontSize: "text-2xl", label: "text-xs" },
    md: { viewBox: 160, fontSize: "text-4xl", label: "text-sm" },
    lg: { viewBox: 200, fontSize: "text-5xl", label: "text-base" },
  }

  const dim = dimensions[size]

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={dim.viewBox}
        height={dim.viewBox}
        viewBox={`0 0 ${dim.viewBox} ${dim.viewBox}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dim.viewBox / 2}
          cy={dim.viewBox / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={dim.viewBox / 2}
          cy={dim.viewBox / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-serif font-bold", dim.fontSize, getScoreColor())}>
          {displayScore}
        </span>
        <span className={cn("text-muted-foreground", dim.label)}>V-Score</span>
      </div>
    </div>
  )
}
