"use client"

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Filter, X, Check } from 'lucide-react'

export type StrategyType = "even-odd" | "over-under" | "differs" | "all"

interface StrategyFilterProps {
  selectedStrategies: StrategyType[]
  onStrategyChange: (strategies: StrategyType[]) => void
  selectedMarkets: string[]
  onMarketChange: (markets: string[]) => void
  availableMarkets: string[]
  theme?: "light" | "dark"
  minConfidence: number
  onConfidenceChange: (confidence: number) => void
}

const STRATEGY_OPTIONS = [
  {
    value: "even-odd" as StrategyType,
    label: "Even/Odd",
    description: "Pattern analysis for even/odd digits",
    color: "bg-purple-500 text-white"
  },
  {
    value: "over-under" as StrategyType,
    label: "Over/Under",
    description: "High/Low digit analysis",
    color: "bg-blue-500 text-white"
  },
  {
    value: "differs" as StrategyType,
    label: "Differs",
    description: "Rare digit probability",
    color: "bg-amber-500 text-white"
  }
]

export default function StrategyFilter({
  selectedStrategies,
  onStrategyChange,
  selectedMarkets,
  onMarketChange,
  availableMarkets,
  theme = "dark",
  minConfidence,
  onConfidenceChange
}: StrategyFilterProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("strategies")
  const [marketSearch, setMarketSearch] = useState("")

  const toggleStrategy = (strategy: StrategyType) => {
    if (selectedStrategies.includes(strategy)) {
      onStrategyChange(selectedStrategies.filter(s => s !== strategy))
    } else {
      onStrategyChange([...selectedStrategies, strategy])
    }
  }

  const toggleMarket = (market: string) => {
    if (selectedMarkets.includes(market)) {
      onMarketChange(selectedMarkets.filter(m => m !== market))
    } else {
      onMarketChange([...selectedMarkets, market])
    }
  }

  const selectAllMarkets = () => {
    onMarketChange(availableMarkets)
  }

  const clearAllMarkets = () => {
    onMarketChange([])
  }

  const filteredMarkets = availableMarkets.filter(m =>
    m.toLowerCase().includes(marketSearch.toLowerCase())
  )

  const bgClass = theme === "dark" ? "bg-gray-800" : "bg-gray-50"
  const borderClass = theme === "dark" ? "border-gray-700" : "border-gray-200"
  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-900"
  const labelClass = theme === "dark" ? "text-gray-400" : "text-gray-600"

  return (
    <Card className={`${bgClass} border ${borderClass}`}>
      <div className="p-4 space-y-4">
        {/* Strategies Section */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "strategies" ? null : "strategies")}
            className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-opacity-50 transition-colors ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className={`font-semibold ${textClass}`}>Strategies</span>
              <Badge variant="outline" className="ml-2">
                {selectedStrategies.length}/{STRATEGY_OPTIONS.length}
              </Badge>
            </div>
            <span className={`text-sm ${labelClass}`}>
              {expandedSection === "strategies" ? "−" : "+"}
            </span>
          </button>

          {expandedSection === "strategies" && (
            <div className="mt-2 grid grid-cols-1 gap-2 pl-4">
              {STRATEGY_OPTIONS.map(strategy => (
                <button
                  key={strategy.value}
                  onClick={() => toggleStrategy(strategy.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedStrategies.includes(strategy.value)
                      ? `border-${strategy.color.split(" ")[0].replace("bg-", "")} ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        }`
                      : `border-${borderClass.replace("border-", "")} ${
                          theme === "dark" ? "hover:bg-gray-700/50" : "hover:bg-gray-100/50"
                        }`
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${textClass}`}>{strategy.label}</span>
                    {selectedStrategies.includes(strategy.value) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <span className={`text-xs ${labelClass}`}>{strategy.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Markets Section */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "markets" ? null : "markets")}
            className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-opacity-50 transition-colors ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">📊</span>
              <span className={`font-semibold ${textClass}`}>Markets</span>
              <Badge variant="outline" className="ml-2">
                {selectedMarkets.length}/{availableMarkets.length}
              </Badge>
            </div>
            <span className={`text-sm ${labelClass}`}>
              {expandedSection === "markets" ? "−" : "+"}
            </span>
          </button>

          {expandedSection === "markets" && (
            <div className="mt-2 space-y-3 pl-4">
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectAllMarkets}
                  className="flex-1 text-xs"
                >
                  All Markets
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAllMarkets}
                  className="flex-1 text-xs"
                >
                  Clear
                </Button>
              </div>

              {/* Search */}
              <Input
                placeholder="Search markets..."
                value={marketSearch}
                onChange={(e) => setMarketSearch(e.target.value)}
                className="text-xs"
              />

              {/* Market List */}
              <div className={`grid grid-cols-2 gap-2 max-h-64 overflow-y-auto ${
                theme === "dark" ? "bg-gray-900/50" : "bg-gray-50/50"
              } p-2 rounded`}>
                {filteredMarkets.map(market => (
                  <button
                    key={market}
                    onClick={() => toggleMarket(market)}
                    className={`p-2 rounded text-xs font-medium transition-all border ${
                      selectedMarkets.includes(market)
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : `border-${borderClass.replace("border-", "")} ${
                            theme === "dark"
                              ? "text-gray-400 hover:bg-gray-700/50"
                              : "text-gray-600 hover:bg-gray-200/50"
                          }`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{market}</span>
                      {selectedMarkets.includes(market) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confidence Threshold Section */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "confidence" ? null : "confidence")}
            className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-opacity-50 transition-colors ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">⚡</span>
              <span className={`font-semibold ${textClass}`}>Min Confidence</span>
              <Badge variant="secondary">{minConfidence}%</Badge>
            </div>
            <span className={`text-sm ${labelClass}`}>
              {expandedSection === "confidence" ? "−" : "+"}
            </span>
          </button>

          {expandedSection === "confidence" && (
            <div className="mt-2 space-y-3 pl-4">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minConfidence}
                onChange={(e) => onConfidenceChange(parseInt(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-xs">
                <span className={labelClass}>0%</span>
                <span className={`font-bold ${textClass}`}>{minConfidence}%</span>
                <span className={labelClass}>100%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
