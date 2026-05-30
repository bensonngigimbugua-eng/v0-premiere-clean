"use client"

import { useState, useRef, useEffect } from "react"
import { SignalData } from "@/lib/signal-analyzer"
import { ChevronDown, Zap, AlertTriangle, TrendingUp, Target, RefreshCw } from "lucide-react"

interface FloatingSignalProps {
  signal: SignalData | null
  isScanning: boolean
  scanProgress: number
  theme: "light" | "dark"
  onStartScanning: () => void
}

export function FloatingSignal({ signal, isScanning, scanProgress, theme, onStartScanning }: FloatingSignalProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize position
  useEffect(() => {
    setPosition({ x: window.innerWidth - 380, y: window.innerHeight - 200 })
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const getSignalColor = () => {
    if (!signal) return "from-slate-600 to-slate-700"
    if (signal.signal === "BUY") return "from-green-600 to-green-700"
    if (signal.signal === "WAIT") return "from-yellow-600 to-yellow-700"
    return "from-red-600 to-red-700"
  }

  const getSignalIcon = () => {
    if (!signal) return <AlertTriangle className="h-5 w-5" />
    if (signal.signal === "BUY") return <Zap className="h-5 w-5 animate-pulse" />
    if (signal.signal === "WAIT") return <AlertTriangle className="h-5 w-5" />
    return <AlertTriangle className="h-5 w-5" />
  }

  const strategyLabels: Record<string, string> = {
    "even-odd": "Even/Odd",
    "over-under": "Over/Under",
    "rise-fall": "Rise/Fall",
    differs: "Differs",
    matches: "Matches",
    recovery: "Recovery",
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`
          w-80 rounded-2xl backdrop-blur-xl border shadow-2xl
          transition-all duration-300 cursor-move
          ${theme === "dark"
            ? `bg-gradient-to-br ${getSignalColor()} border-slate-400/20`
            : `bg-gradient-to-br ${getSignalColor()} border-white/20`
          }
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between" data-no-drag>
          <div className="flex items-center gap-2">
            {getSignalIcon()}
            <span className="text-white font-bold text-lg">Live Signal</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronDown
              className={`h-5 w-5 text-white transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Collapsed State - Signal Info */}
        {!isExpanded && (
          <div className="px-6 py-4 space-y-3">
            {signal ? (
              <>
                {/* Animated Waves Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="absolute inset-0 border-2 border-white/30 rounded-2xl"
                      style={{
                        animation: `ping ${0.8 + i * 0.2}s cubic-bezier(0, 0, 0.2, 1) infinite`,
                        opacity: 1 - i * 0.3,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm font-semibold">{strategyLabels[signal.strategy]}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      signal.signal === "BUY"
                        ? "bg-green-500/30 text-green-100"
                        : signal.signal === "WAIT"
                          ? "bg-yellow-500/30 text-yellow-100"
                          : "bg-red-500/30 text-red-100"
                    }`}>
                      {signal.signal}
                    </span>
                  </div>

                  <div className="text-white text-2xl font-black mb-3">
                    {signal.prediction}
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">Confidence</span>
                      <span className="text-white font-bold">{signal.confidence.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full transition-all duration-500"
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Probability */}
                  <div className="text-xs text-white/80">
                    Probability: <span className="font-bold text-white">{signal.probability.toFixed(1)}%</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <AlertTriangle className="h-8 w-8 text-white/60 mx-auto mb-2" />
                <p className="text-white/70 text-sm font-semibold">No Active Signal</p>
                <p className="text-white/50 text-xs mt-1">Start scanning to generate signals</p>
              </div>
            )}
          </div>
        )}

        {/* Expanded State - Detailed View */}
        {isExpanded && (
          <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
            {signal ? (
              <>
                {/* Strategy Info */}
                <div className="bg-white/10 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Strategy:</span>
                    <span className="text-white font-semibold">{strategyLabels[signal.strategy]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Signal:</span>
                    <span className={`font-bold ${
                      signal.signal === "BUY" ? "text-green-300" : signal.signal === "WAIT" ? "text-yellow-300" : "text-red-300"
                    }`}>
                      {signal.signal}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Market:</span>
                    <span className="text-white font-semibold">{signal.market || "N/A"}</span>
                  </div>
                </div>

                {/* Prediction */}
                {signal.prediction && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-2">Predicted:</div>
                    <div className="text-white font-bold text-lg">{signal.prediction}</div>
                  </div>
                )}

                {/* Suggested Digits */}
                {signal.suggestedDigits && signal.suggestedDigits.length > 0 && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-2">Suggested Digits:</div>
                    <div className="flex gap-2">
                      {signal.suggestedDigits.map((digit) => (
                        <button
                          key={digit}
                          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
                          data-no-drag
                        >
                          {digit}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {signal.marketStats && (
                  <div className="bg-white/10 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-white/70 font-semibold mb-2">Market Statistics:</div>
                    {signal.marketStats.even > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Even/Odd:</span>
                        <span className="text-white">{signal.marketStats.even.toFixed(1)}% / {signal.marketStats.odd.toFixed(1)}%</span>
                      </div>
                    )}
                    {signal.marketStats.over > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Over/Under:</span>
                        <span className="text-white">{signal.marketStats.over.toFixed(1)}% / {signal.marketStats.under.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Confidence Meter */}
                <div className="bg-white/10 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Confidence:</span>
                    <span className="text-white font-bold">{signal.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-300 rounded-full transition-all duration-500"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/70 text-sm font-semibold mb-2">No Signals Generated</p>
                <p className="text-white/50 text-xs">Click the scan button to analyze markets</p>
              </div>
            )}
          </div>
        )}

        {/* Scanning Status */}
        {isScanning && (
          <div className="px-6 py-3 border-t border-white/10 space-y-2" data-no-drag>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-white animate-spin" />
                <span className="text-white font-semibold">Scanning Markets</span>
              </div>
              <span className="text-white/70 text-xs">{Math.round(scanProgress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Scan Button */}
        <div className="px-6 py-3 border-t border-white/10" data-no-drag>
          <button
            onClick={onStartScanning}
            disabled={isScanning}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
              isScanning
                ? "bg-white/20 cursor-not-allowed"
                : "bg-white/30 hover:bg-white/40 active:scale-95"
            }`}
          >
            <Zap className="h-4 w-4" />
            {isScanning ? "Scanning..." : "Scan Markets"}
          </button>
        </div>

        {/* Decorative gradient border */}
        <style jsx>{`
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
