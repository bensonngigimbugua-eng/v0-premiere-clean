'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Zap, TrendingUp, Target } from 'lucide-react'

interface AIAnalyzerSignal {
  strategy: string
  confidence: number
  entrySignal: string
  market: string
  probability: number
  suggestedDigit?: number
}

interface FloatingAIAnalyzerProps {
  signal: AIAnalyzerSignal | null
  isAnalyzing: boolean
  theme: 'light' | 'dark'
}

export function FloatingAIAnalyzer({ signal, isAnalyzing, theme }: FloatingAIAnalyzerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y)),
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  if (isClosed) return null

  const bgColor = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-slate-700/50'
    : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'

  const textColor = theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
  const mutedColor = theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
  const accentBg = theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100'

  const getSignalColor = () => {
    if (!signal) return 'from-blue-500 to-cyan-500'
    if (signal.confidence > 80) return 'from-green-500 to-emerald-500'
    if (signal.confidence > 60) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-orange-500'
  }

  const getSignalLabel = () => {
    if (!signal) return 'Analyzing'
    if (signal.confidence > 80) return 'STRONG SIGNAL'
    if (signal.confidence > 60) return 'MODERATE SIGNAL'
    return 'WEAK SIGNAL'
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 cursor-grab active:cursor-grabbing select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Main Floating Icon */}
      <div
        className={`
          w-20 h-20 rounded-full flex items-center justify-center
          ${bgColor} shadow-2xl backdrop-blur-xl
          transition-all duration-300 overflow-hidden
          ${isExpanded ? 'ring-2 ring-blue-500 scale-105' : ''}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Animated AI Circles Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Outer rotating circle */}
          <div
            className={`
              absolute inset-0 rounded-full
              bg-gradient-to-r ${getSignalColor()}
              opacity-20 blur-md
              ${isAnalyzing ? 'animate-spin' : ''}
            `}
            style={{
              animationDuration: isAnalyzing ? '3s' : '0s',
            }}
          />

          {/* Middle pulsing circle */}
          {isAnalyzing && (
            <div
              className={`
                absolute inset-1 rounded-full
                bg-gradient-to-r ${getSignalColor()}
                opacity-30 blur-sm animate-pulse
              `}
            />
          )}

          {/* Inner static circle */}
          <div
            className={`
              absolute inset-2 rounded-full
              bg-gradient-to-r ${getSignalColor()}
              opacity-10
            `}
          />
        </div>

        {/* AI Icon Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
          <div className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AI
          </div>
          <div className="text-[10px] font-bold text-blue-400">TIA</div>
        </div>
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div
          className={`
            absolute top-0 left-24 w-80 p-4 rounded-2xl
            ${bgColor} shadow-2xl backdrop-blur-xl
            space-y-4 animate-in fade-in slide-in-from-left-2 duration-300
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-bold ${textColor}`}>TIA Analysis</h3>
            <button
              onClick={() => {
                setIsExpanded(false)
                setIsClosed(true)
              }}
              className={`
                p-1 rounded-lg transition-colors
                ${theme === 'dark'
                  ? 'hover:bg-slate-700/50 text-slate-400'
                  : 'hover:bg-gray-200 text-gray-600'
                }
              `}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Analyzing State */}
          {isAnalyzing && !signal && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getSignalColor()} animate-pulse`} />
                <span className={`text-xs ${mutedColor}`}>Analyzing market patterns...</span>
              </div>
              <div className={`w-full h-1 rounded-full overflow-hidden ${accentBg}`}>
                <div className={`h-full w-1/3 bg-gradient-to-r ${getSignalColor()} animate-pulse`} />
              </div>
            </div>
          )}

          {/* Signal Display */}
          {signal && (
            <div className="space-y-3">
              {/* Strategy Header */}
              <div className={`p-3 rounded-lg ${accentBg}`}>
                <div className={`text-xs font-bold text-blue-400 mb-1`}>{getSignalLabel()}</div>
                <div className={`text-lg font-black ${textColor}`}>{signal.strategy}</div>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${mutedColor}`}>Confidence</span>
                  <span className={`text-xs font-bold ${
                    signal.confidence > 80 ? 'text-green-400' :
                    signal.confidence > 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {signal.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${accentBg}`}>
                  <div
                    className={`h-full bg-gradient-to-r ${
                      signal.confidence > 80 ? 'from-green-500 to-emerald-500' :
                      signal.confidence > 60 ? 'from-yellow-500 to-orange-500' :
                      'from-red-500 to-orange-500'
                    } transition-all duration-500`}
                    style={{ width: `${signal.confidence}%` }}
                  />
                </div>
              </div>

              {/* Entry Signal */}
              <div className={`p-3 rounded-lg ${accentBg} flex items-start gap-2`}>
                <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className={`text-xs font-semibold ${mutedColor}`}>Entry Signal</div>
                  <div className={`text-sm font-bold ${textColor}`}>{signal.entrySignal}</div>
                </div>
              </div>

              {/* Market Info */}
              <div className={`p-3 rounded-lg ${accentBg} flex items-start gap-2`}>
                <Target className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className={`text-xs font-semibold ${mutedColor}`}>Market</div>
                  <div className={`text-sm font-bold ${textColor}`}>{signal.market}</div>
                </div>
              </div>

              {/* Probability */}
              <div className={`p-3 rounded-lg ${accentBg} flex items-start gap-2`}>
                <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className={`text-xs font-semibold ${mutedColor}`}>Win Probability</div>
                  <div className={`text-sm font-bold ${textColor}`}>{(signal.probability * 100).toFixed(1)}%</div>
                </div>
              </div>

              {/* Suggested Digit */}
              {signal.suggestedDigit !== undefined && (
                <div className={`p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20`}>
                  <div className={`text-xs font-semibold text-purple-400 mb-1`}>Suggested Digit</div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-lg font-black text-white">{signal.suggestedDigit}</span>
                    </div>
                    <span className={`text-sm font-bold ${textColor}`}>High Probability Target</span>
                  </div>
                </div>
              )}

              {/* Trade Button */}
              <button
                className={`
                  w-full py-2 px-3 rounded-lg font-semibold text-sm
                  bg-gradient-to-r from-blue-600 to-cyan-600
                  hover:from-blue-700 hover:to-cyan-700
                  text-white transition-all duration-200
                  active:scale-95
                `}
              >
                Execute Trade
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
