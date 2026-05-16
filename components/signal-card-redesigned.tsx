import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'

interface SignalCardProps {
  market: string
  tradeType: string
  entryPoint: string
  confidence: number
  pipSize: string
  category: "even-odd" | "over-under" | "differs"
  conditions: string[]
  timestamp?: number
  theme?: "light" | "dark"
  onExecute?: () => void
}

const getCategoryColor = (category: string, theme: string) => {
  const colors = {
    "even-odd": {
      light: "from-purple-50 to-purple-100 border-purple-200",
      dark: "from-purple-950 to-purple-900 border-purple-800"
    },
    "over-under": {
      light: "from-blue-50 to-blue-100 border-blue-200",
      dark: "from-blue-950 to-blue-900 border-blue-800"
    },
    "differs": {
      light: "from-amber-50 to-amber-100 border-amber-200",
      dark: "from-amber-950 to-amber-900 border-amber-800"
    }
  }
  return colors[category as keyof typeof colors]?.[theme as keyof typeof colors["even-odd"]] || ""
}

const getCategoryBadgeColor = (category: string) => {
  const colors = {
    "even-odd": "bg-purple-500 text-white",
    "over-under": "bg-blue-500 text-white",
    "differs": "bg-amber-500 text-white"
  }
  return colors[category as keyof typeof colors] || "bg-gray-500 text-white"
}

const getConfidenceColor = (confidence: number, theme: string) => {
  if (confidence >= 75) {
    return theme === "dark" ? "text-emerald-400" : "text-emerald-600"
  } else if (confidence >= 60) {
    return theme === "dark" ? "text-yellow-400" : "text-yellow-600"
  }
  return theme === "dark" ? "text-orange-400" : "text-orange-600"
}

const getConfidenceBg = (confidence: number, theme: string) => {
  if (confidence >= 75) {
    return theme === "dark" ? "bg-emerald-500/20" : "bg-emerald-100"
  } else if (confidence >= 60) {
    return theme === "dark" ? "bg-yellow-500/20" : "bg-yellow-100"
  }
  return theme === "dark" ? "bg-orange-500/20" : "bg-orange-100"
}

export default function SignalCardRedesigned({
  market,
  tradeType,
  entryPoint,
  confidence,
  pipSize,
  category,
  conditions,
  timestamp,
  theme = "dark",
  onExecute
}: SignalCardProps) {
  const categoryColors = getCategoryColor(category, theme)
  const badgeColor = getCategoryBadgeColor(category)
  const confColor = getConfidenceColor(confidence, theme)
  const confBg = getConfidenceBg(confidence, theme)

  return (
    <Card className={`bg-gradient-to-br ${categoryColors} border-2 overflow-hidden hover:shadow-lg transition-all duration-300`}>
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <Badge className={`${badgeColor} text-xs font-semibold`}>
              {category === "even-odd" ? "EVEN/ODD" : category === "over-under" ? "OVER/UNDER" : "DIFFERS"}
            </Badge>
            <span className={`text-xs font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              {market}
            </span>
          </div>
          <Zap className={`h-4 w-4 ${theme === "dark" ? "text-yellow-400" : "text-yellow-500"}`} />
        </div>

        {/* Trade Type & Price */}
        <div className="mb-3">
          <h3 className={`text-lg font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {tradeType}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Entry:</span>
            <span className={`font-mono font-bold text-base ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}>
              {entryPoint}
            </span>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Confidence
            </span>
            <span className={`text-sm font-bold ${confColor}`}>
              {Math.round(confidence)}%
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`}>
            <div 
              className={`h-full transition-all duration-300 ${
                confidence >= 75 ? "bg-emerald-500" : confidence >= 60 ? "bg-yellow-500" : "bg-orange-500"
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className={`p-2 rounded ${theme === "dark" ? "bg-black/20" : "bg-white/50"}`}>
            <span className={`block ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Pip Size</span>
            <span className={`font-mono font-bold ${theme === "dark" ? "text-cyan-300" : "text-cyan-700"}`}>
              {pipSize}
            </span>
          </div>
          <div className={`p-2 rounded ${theme === "dark" ? "bg-black/20" : "bg-white/50"}`}>
            <span className={`block ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Validity</span>
            <span className={`font-bold ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
              5 ticks
            </span>
          </div>
        </div>

        {/* Conditions */}
        <div className={`p-2 rounded mb-3 ${confBg}`}>
          <div className={`text-xs space-y-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            {conditions.map((condition, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="leading-tight text-xs">{condition}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {onExecute && (
          <Button
            onClick={onExecute}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm py-2"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Execute Trade
          </Button>
        )}
      </div>
    </Card>
  )
}
