"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LastDigitsChart } from "@/components/charts/last-digits-chart"
import { LastDigitsLineChart } from "@/components/charts/last-digits-line-chart"
import { OverUnderAnalyzer } from "@/components/over-under-analyzer"
import { TrendingUp, TrendingDown, Zap, AlertCircle, Target } from "lucide-react"
import type { Signal, AnalysisResult } from "@/lib/analysis-engine"

interface OverUnderTabProps {
  analysis: AnalysisResult | null
  signals: Signal[]
  currentDigit: number | null
  currentPrice: number | null
  recentDigits: number[]
  theme?: "light" | "dark"
}

export function OverUnderTab({
  analysis,
  signals,
  currentDigit,
  currentPrice,
  recentDigits,
  theme = "dark",
}: OverUnderTabProps) {
  const [selectedDigit, setSelectedDigit] = useState<number>(4)
  const [tradeTimer, setTradeTimer] = useState<number>(0)
  const [marketChangeReason, setMarketChangeReason] = useState<string>("")
  const [maxPercentage, setMaxPercentage] = useState<number>(0)
  const [favored, setFavored] = useState<string>("")

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (tradeTimer > 0) {
      interval = setInterval(() => {
        setTradeTimer((prev) => (prev > 1 ? prev - 1 : 0))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [tradeTimer])

  useEffect(() => {
    const prevMaxPercentage = maxPercentage
    if (prevMaxPercentage >= 60 && maxPercentage < 60) {
      setMarketChangeReason("Market momentum shifted - Strong bias dropped below 60% threshold")
    } else if (prevMaxPercentage >= 55 && maxPercentage < 50) {
      setMarketChangeReason("Market reversed direction - Trend completely changed")
    }
  }, [maxPercentage])

  useEffect(() => {
    const underCount = recentDigits.filter((d) => d >= 0 && d <= 4).length
    const overCount = recentDigits.filter((d) => d >= 5 && d <= 9).length
    const underPercent = recentDigits.length > 0 ? (underCount / recentDigits.length) * 100 : 50
    const overPercent = recentDigits.length > 0 ? (overCount / recentDigits.length) * 100 : 50

    const newFavored = underPercent > overPercent ? "under" : "over"
    const newMaxPercentage = Math.max(underPercent, overPercent)

    setMaxPercentage(newMaxPercentage)
    setFavored(newFavored)
  }, [recentDigits])

  if (!analysis || !recentDigits || recentDigits.length === 0) {
    return (
      <div className="text-center py-16">
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Loading analysis...</p>
      </div>
    )
  }

  const last20Digits = recentDigits.slice(-20)
  const analysisDigits = recentDigits // Use all available digits for analysis

  const calculateStreak = (digits: number[]) => {
    if (digits.length === 0) return { type: "none", count: 0 }

    const streakType = digits[digits.length - 1] >= 5 ? "over" : "under"
    let count = 1

    for (let i = digits.length - 2; i >= 0; i--) {
      const currentType = digits[i] >= 5 ? "over" : "under"
      if (currentType === streakType) {
        count++
      } else {
        break
      }
    }

    return { type: streakType, count }
  }

  const calculateDigitPower = (digit: number) => {
    const digitOccurrences = analysisDigits.filter((d) => d === digit).length
    const frequency = analysisDigits.length > 0 ? (digitOccurrences / analysisDigits.length) * 100 : 0

    const momentumSampleSize = Math.max(10, Math.floor(analysisDigits.length * 0.1))
    const recentSample = analysisDigits.slice(-momentumSampleSize)
    const recentOccurrences = recentSample.filter((d) => d === digit).length
    const momentum = (recentOccurrences / recentSample.length) * 100

    const confidence = frequency * 0.6 + momentum * 0.4

    let strength: "VERY STRONG" | "STRONG" | "MODERATE" | "WEAK" = "WEAK"
    if (confidence >= 25) strength = "VERY STRONG"
    else if (confidence >= 15) strength = "STRONG"
    else if (confidence >= 10) strength = "MODERATE"

    return {
      digit,
      frequency: frequency.toFixed(1),
      momentum: momentum.toFixed(1),
      confidence: confidence.toFixed(1),
      strength,
      occurrences: digitOccurrences,
      recentOccurrences,
    }
  }

  const digitPower = calculateDigitPower(selectedDigit)

  const streak = calculateStreak(analysisDigits)

  const calculateUnderOverStats = () => {
    const underDigits = recentDigits.filter((d) => d >= 0 && d <= 4)
    const overDigits = recentDigits.filter((d) => d >= 5 && d <= 9)

    const underCounts = [0, 1, 2, 3, 4].map((digit) => ({
      digit,
      count: underDigits.filter((d) => d === digit).length,
    }))
    const overCounts = [5, 6, 7, 8, 9].map((digit) => ({
      digit,
      count: overDigits.filter((d) => d === digit).length,
    }))

    const highestUnder = underCounts.reduce((max, curr) => (curr.count > max.count ? curr : max), underCounts[0])
    const highestOver = overCounts.reduce((max, curr) => (curr.count > max.count ? curr : max), overCounts[0])

    const underCount = underDigits.length
    const overCount = overDigits.length
    const underPercent = recentDigits.length > 0 ? (underCount / recentDigits.length) * 100 : 50
    const overPercent = recentDigits.length > 0 ? (overCount / recentDigits.length) * 100 : 50

    return { underPercent, overPercent, highestUnder, highestOver }
  }

  const { underPercent, overPercent, highestUnder, highestOver } = calculateUnderOverStats()

  let signalStatus: "TRADE NOW" | "WAIT" | "NEUTRAL" = "NEUTRAL"
  let signalMessage = ""
  let entryPoint = ""

  if (maxPercentage >= 70) {
    signalStatus = "TRADE NOW"
    const favoredDigit = favored === "under" ? highestUnder.digit : highestOver.digit
    signalMessage = `VERY STRONG ${favored.toUpperCase()} signal at ${maxPercentage.toFixed(1)}% (Digit ${favoredDigit} leading)`
    entryPoint = `Enter ${favored.toUpperCase()} position at price ${currentPrice?.toFixed(5) || "---"} targeting digit ${favoredDigit}`
    if (tradeTimer === 0) setTradeTimer(60)
  } else if (maxPercentage >= 60) {
    signalStatus = "TRADE NOW"
    const favoredDigit = favored === "under" ? highestUnder.digit : highestOver.digit
    signalMessage = `STRONG ${favored.toUpperCase()} signal at ${maxPercentage.toFixed(1)}% (Digit ${favoredDigit} leading)`
    entryPoint = `Enter ${favored.toUpperCase()} position at price ${currentPrice?.toFixed(5) || "---"} targeting digit ${favoredDigit}`
    if (tradeTimer === 0) setTradeTimer(60)
  } else if (maxPercentage >= 55) {
    signalStatus = "WAIT"
    signalMessage = `Building ${favored.toUpperCase()} bias at ${maxPercentage.toFixed(1)}% - Wait for stronger confirmation`
  } else {
    signalMessage = "Market is balanced - No clear signal yet"
  }

  return (
    <div className="space-y-6">
      {/* Main Signal Card */}
      <Card
        className={`border-2 overflow-hidden ${
          signalStatus === "TRADE NOW"
            ? theme === "dark"
              ? "bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
              : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
            : signalStatus === "WAIT"
              ? theme === "dark"
                ? "bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                : "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300"
              : theme === "dark"
                ? "bg-gradient-to-br from-gray-900/20 to-slate-900/20 border-gray-600/30"
                : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {signalStatus === "TRADE NOW" ? (
                  <Zap className="h-6 w-6 text-green-500 animate-pulse" />
                ) : signalStatus === "WAIT" ? (
                  <AlertCircle className="h-6 w-6 text-blue-500" />
                ) : (
                  <Target className="h-6 w-6 text-gray-500" />
                )}
                <Badge
                  className={`text-base px-4 py-2 font-bold ${
                    signalStatus === "TRADE NOW"
                      ? "bg-green-500 text-white shadow-lg animate-pulse"
                      : signalStatus === "WAIT"
                        ? "bg-blue-500 text-white shadow-lg animate-pulse"
                        : "bg-gray-500 text-white"
                  }`}
                >
                  {signalStatus} {tradeTimer > 0 && `(${tradeTimer}s)`}
                </Badge>
              </div>
              <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {signalMessage}
              </h3>
            </div>
          </div>

          {entryPoint && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                theme === "dark" ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <Target className="h-4 w-4 text-yellow-600" />
              <p className={`text-sm font-semibold ${theme === "dark" ? "text-yellow-400" : "text-yellow-700"}`}>
                {entryPoint}
              </p>
            </div>
          )}

          {marketChangeReason && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg ${
                theme === "dark" ? "bg-red-500/10 border border-red-500/30" : "bg-red-50 border border-red-200"
              }`}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
              <p className={`text-sm font-semibold ${theme === "dark" ? "text-red-400" : "text-red-700"}`}>
                {marketChangeReason}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Under/Over Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Under Card */}
        <Card
          className={`border overflow-hidden ${
            underPercent > overPercent
              ? theme === "dark"
                ? "border-blue-500/50 bg-gradient-to-br from-blue-900/10 to-blue-800/5"
                : "border-blue-300 bg-blue-50"
              : theme === "dark"
                ? "border-gray-600/30 bg-gray-900/20"
                : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className={`h-5 w-5 ${underPercent > overPercent ? "text-blue-500" : "text-gray-500"}`} />
                <h4 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Under (0-4)
                </h4>
              </div>
              <Badge className="bg-blue-500 text-white">
                {highestUnder.digit}
              </Badge>
            </div>

            <div className="mb-3">
              <div className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                {underPercent.toFixed(1)}%
              </div>
              <Progress value={underPercent} className={`h-2 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`} />
            </div>

            <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Leading: Digit <span className="font-bold">{highestUnder.digit}</span> ({highestUnder.count} occurrences)
            </div>
          </div>
        </Card>

        {/* Over Card */}
        <Card
          className={`border overflow-hidden ${
            overPercent > underPercent
              ? theme === "dark"
                ? "border-green-500/50 bg-gradient-to-br from-green-900/10 to-green-800/5"
                : "border-green-300 bg-green-50"
              : theme === "dark"
                ? "border-gray-600/30 bg-gray-900/20"
                : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-5 w-5 ${overPercent > underPercent ? "text-green-500" : "text-gray-500"}`} />
                <h4 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Over (5-9)
                </h4>
              </div>
              <Badge className="bg-green-500 text-white">
                {highestOver.digit}
              </Badge>
            </div>

            <div className="mb-3">
              <div className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                {overPercent.toFixed(1)}%
              </div>
              <Progress value={overPercent} className={`h-2 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`} />
            </div>

            <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Leading: Digit <span className="font-bold">{highestOver.digit}</span> ({highestOver.count} occurrences)
            </div>
          </div>
        </Card>
      </div>

      {/* Digit Analysis Section */}
      <Card
        className={`border overflow-hidden ${
          theme === "dark"
            ? "bg-gradient-to-br from-slate-900/50 to-slate-900/30 border-slate-700/50"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="p-6">
          <h3 className={`text-xl font-bold mb-5 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Digit Analysis
          </h3>

          <div className="mb-6">
            <p className={`text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Select a digit to compare:
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  onClick={() => setSelectedDigit(digit)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    selectedDigit === digit
                      ? theme === "dark"
                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.6)] scale-110 border-2 border-amber-400"
                        : "bg-amber-500 text-white shadow-lg scale-110"
                      : theme === "dark"
                        ? "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-gray-200"
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {digit}
                </button>
              ))}
            </div>
          </div>

          {/* Digit Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div
              className={`p-4 rounded-lg border ${
                theme === "dark"
                  ? "bg-cyan-900/20 border-cyan-500/30"
                  : "bg-cyan-50 border-cyan-200"
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${theme === "dark" ? "text-cyan-300" : "text-cyan-700"}`}>
                Frequency
              </div>
              <div className={`text-2xl font-bold ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}>
                {digitPower.frequency}%
              </div>
              <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {digitPower.occurrences}x total
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                theme === "dark"
                  ? "bg-green-900/20 border-green-500/30"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${theme === "dark" ? "text-green-300" : "text-green-700"}`}>
                Momentum
              </div>
              <div className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                {digitPower.momentum}%
              </div>
              <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Last 10%
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                theme === "dark"
                  ? "bg-purple-900/20 border-purple-500/30"
                  : "bg-purple-50 border-purple-200"
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${theme === "dark" ? "text-purple-300" : "text-purple-700"}`}>
                Confidence
              </div>
              <div className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
                {digitPower.confidence}%
              </div>
              <div
                className={`text-xs font-bold ${
                  digitPower.strength === "VERY STRONG"
                    ? "text-green-500"
                    : digitPower.strength === "STRONG"
                      ? "text-blue-500"
                      : digitPower.strength === "MODERATE"
                        ? "text-yellow-500"
                        : "text-gray-500"
                }`}
              >
                {digitPower.strength}
              </div>
            </div>
          </div>

          {/* Confidence Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Prediction Strength
              </span>
            </div>
            <div className={`w-full rounded-full h-3 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
              <div
                className={`h-3 rounded-full transition-all ${
                  digitPower.strength === "VERY STRONG"
                    ? "bg-gradient-to-r from-green-600 to-green-400"
                    : digitPower.strength === "STRONG"
                      ? "bg-gradient-to-r from-blue-600 to-blue-400"
                      : digitPower.strength === "MODERATE"
                        ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                        : "bg-gradient-to-r from-gray-600 to-gray-400"
                }`}
                style={{ width: `${Math.min(Number.parseFloat(digitPower.confidence), 100)}%` }}
              />
            </div>
          </div>

          {/* Digit Comparison */}
          <div className="space-y-4 mt-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Over ({selectedDigit + 1}-9)
                </span>
                <span className={`text-lg font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                  {overPercent.toFixed(1)}%
                </span>
              </div>
              <Progress value={overPercent} className={`h-3 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Under (0-{selectedDigit - 1})
                </span>
                <span className={`text-lg font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                  {underPercent.toFixed(1)}%
                </span>
              </div>
              <Progress value={underPercent} className={`h-3 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`} />
            </div>
          </div>

          {/* Recent Digits */}
          <div className="mt-6">
            <h4 className={`text-sm font-bold mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
              Recent Pattern (Last {Math.min(20, analysisDigits.length)} digits)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {last20Digits.map((digit, idx) => {
                const isCurrentDigit = digit === selectedDigit
                const isOver = digit > selectedDigit

                return (
                  <div
                    key={idx}
                    className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrentDigit
                        ? "bg-amber-500 text-white shadow-[0_0_10px_rgba(217,119,6,0.6)] scale-105"
                        : isOver
                          ? theme === "dark"
                            ? "bg-green-600 text-white"
                            : "bg-green-500 text-white"
                          : theme === "dark"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                    }`}
                  >
                    {digit}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Charts Section */}
      <OverUnderAnalyzer ticks={analysisDigits} currentPrice={currentPrice} theme={theme} />

      <div
        className={`rounded-xl p-4 border text-center ${
          theme === "dark"
            ? "bg-gradient-to-br from-slate-900/50 to-slate-900/30 border-slate-700/50"
            : "bg-white border-gray-200 shadow-lg"
        }`}
      >
        <div className={`text-sm mb-2 font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
          Current Digit:
        </div>
        <div
          className={`text-4xl font-bold animate-pulse ${
            theme === "dark"
              ? "bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent"
              : "text-orange-600"
          }`}
        >
          {currentDigit !== null ? currentDigit : "0"}
        </div>
        <div className={`text-xl mt-2 font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Price: {currentPrice?.toFixed(5) || "---"}
        </div>
      </div>

      {last20Digits.length > 0 && (
        <div
          className={`rounded-xl p-6 border ${
            theme === "dark"
              ? "bg-gradient-to-br from-[#0f1629]/80 to-[#1a2235]/80 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
              : "bg-white border-gray-200 shadow-lg"
          }`}
        >
          <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Last 20 Digits
          </h3>
          <LastDigitsChart digits={last20Digits} />
        </div>
      )}

      {last20Digits.length > 0 && (
        <div
          className={`rounded-xl p-6 border ${
            theme === "dark"
              ? "bg-gradient-to-br from-[#0f1629]/80 to-[#1a2235]/80 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
              : "bg-white border-gray-200 shadow-lg"
          }`}
        >
          <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Digits Line Chart
          </h3>
          <LastDigitsLineChart digits={last20Digits} />
        </div>
      )}

      {signalStatus === "TRADE NOW" && (
        <Button
          size="lg"
          className={`w-full px-8 py-6 text-xl font-bold text-white ${
            favored === "under"
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-[0_0_30px_rgba(59,130,246,0.7)]"
              : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-[0_0_30px_rgba(34,197,94,0.7)]"
          } animate-pulse`}
        >
          TRADE NOW {favored.toUpperCase()}
        </Button>
      )}
    </div>
  )
}
