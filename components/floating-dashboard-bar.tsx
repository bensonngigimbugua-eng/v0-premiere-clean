"use client"

import { useState, useEffect } from "react"
import { Activity, TrendingUp, Wifi, WifiOff, Zap, Menu, X } from "lucide-react"

interface FloatingDashboardBarProps {
  balance?: number
  isConnected?: boolean
  theme?: "dark" | "light"
  onQuickTradeClick?: () => void
  marketStatus?: string
}

export function FloatingDashboardBar({
  balance = 10000,
  isConnected = true,
  theme = "dark",
  onQuickTradeClick,
  marketStatus = "Active",
}: FloatingDashboardBarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-collapse on small screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!isVisible) return null

  const bgColor = theme === "dark" ? "bg-gradient-to-r from-slate-900/95 to-slate-800/95" : "bg-gradient-to-r from-white/95 to-gray-50/95"
  const borderColor = theme === "dark" ? "border-slate-700/50" : "border-gray-200"
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900"
  const secondaryText = theme === "dark" ? "text-gray-400" : "text-gray-600"

  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 ${isExpanded ? "w-full max-w-4xl px-6" : "w-auto"} transition-all duration-300 z-50`}
    >
      <div
        className={`${bgColor} border ${borderColor} rounded-2xl shadow-2xl backdrop-blur-xl ${
          isExpanded ? "px-6 py-4" : "px-4 py-3"
        } flex items-center justify-between gap-4 transition-all duration-300`}
      >
        {/* Left Section - Status & Balance */}
        {isExpanded && (
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* Connection Status */}
            <div className="flex items-center gap-2 shrink-0">
              {isConnected ? (
                <Wifi className={`h-4 w-4 text-green-500 animate-pulse`} />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs font-semibold ${isConnected ? "text-green-500" : "text-red-500"}`}>
                {isConnected ? "Connected" : "Offline"}
              </span>
            </div>

            {/* Divider */}
            <div className={`w-px h-6 ${theme === "dark" ? "bg-slate-600/50" : "bg-gray-300/50"}`} />

            {/* Market Status */}
            <div className="flex items-center gap-2 shrink-0">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className={`text-xs font-semibold ${secondaryText}`}>{marketStatus}</span>
            </div>

            {/* Divider */}
            <div className={`w-px h-6 ${theme === "dark" ? "bg-slate-600/50" : "bg-gray-300/50"}`} />

            {/* Balance Display */}
            <div className="flex items-center gap-1 shrink-0">
              <span className={`text-xs ${secondaryText}`}>Balance</span>
              <span className={`text-sm font-bold ${textColor}`}>${balance.toFixed(2)}</span>
            </div>

            {/* Divider */}
            <div className={`w-px h-6 ${theme === "dark" ? "bg-slate-600/50" : "bg-gray-300/50"}`} />

            {/* Performance Indicator */}
            <div className="flex items-center gap-1.5 shrink-0">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs font-semibold text-green-500">+2.4%</span>
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {isExpanded && (
            <>
              <button
                onClick={onQuickTradeClick}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-lg"
              >
                <Zap className="h-4 w-4" />
                Quick Trade
              </button>
            </>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              theme === "dark"
                ? "hover:bg-slate-700/50 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-200/50 text-gray-600 hover:text-gray-900"
            }`}
          >
            {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className={`p-1 rounded transition-all duration-200 ${
              theme === "dark" ? "hover:bg-slate-700/50 text-gray-500" : "hover:bg-gray-200/50 text-gray-600"
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Collapsed State Indicator */}
      {!isExpanded && (
        <div className={`text-center mt-2 text-xs ${secondaryText}`}>
          Tap to expand
        </div>
      )}
    </div>
  )
}
