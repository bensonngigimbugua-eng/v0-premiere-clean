"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Circle, Zap, TrendingUp, Target } from "lucide-react"

interface BotConfig {
  name: string
  tradeType: "over-under" | "even-odd" | "differs" | "matches" | "rise-fall" | ""
  stake: number
  martingale: number
  takeProfit: number
  stopLoss: number
  predictions: string[]
  multiMarketScan: boolean
  selectedMarkets: string[]
  isScanning: boolean
  scanProgress: number
}

interface MarketStats {
  symbol: string
  evenOddBalance: number
  overUnderBalance: number
  differsHottest: string
  matchesHottest: string
  riseFallBias: string
  scanProgress: number
}

const TRADE_TYPES = [
  { value: "over-under", label: "Over/Under" },
  { value: "even-odd", label: "Even/Odd" },
  { value: "differs", label: "Differs" },
  { value: "matches", label: "Matches" },
  { value: "rise-fall", label: "Rise/Fall" },
]

const MARKETS = [
  "Volatility 10 1s",
  "Volatility 15 1s",
  "Volatility 25 1s",
  "Volatility 30 1s",
  "Volatility 50 1s",
  "Volatility 75 1s",
  "Volatility 90 1s",
  "Volatility 100 1s",
  "Index 10",
  "Index 25",
  "Index 50",
  "Index 75",
  "Index 100",
]

export interface BotBuilderTabProps {
  theme?: "light" | "dark"
}

export function BotBuilderTab({ theme = "dark" }: BotBuilderTabProps) {
  const [botConfig, setBotConfig] = useState<BotConfig>({
    name: "My Trading Bot",
    tradeType: "",
    stake: 1,
    martingale: 2,
    takeProfit: 100,
    stopLoss: -50,
    predictions: [],
    multiMarketScan: true,
    selectedMarkets: MARKETS,
    isScanning: false,
    scanProgress: 0,
  })

  const [marketStats, setMarketStats] = useState<MarketStats[]>([])
  const [selectedPrediction, setSelectedPrediction] = useState("")
  const [botRunning, setBotRunning] = useState(false)

  // Simulate market scanning
  const startScan = () => {
    setBotConfig({ ...botConfig, isScanning: true, scanProgress: 0 })
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setBotConfig((prev) => ({ ...prev, isScanning: false, scanProgress: 100 }))
        // Simulate market stats
        setMarketStats(
          botConfig.selectedMarkets.map((market) => ({
            symbol: market,
            evenOddBalance: Math.random() * 20 - 10,
            overUnderBalance: Math.random() * 30 - 15,
            differsHottest: String(Math.floor(Math.random() * 10)),
            matchesHottest: String(Math.floor(Math.random() * 10)),
            riseFallBias: Math.random() > 0.5 ? "Rise" : "Fall",
            scanProgress: 100,
          }))
        )
      } else {
        setBotConfig((prev) => ({ ...prev, scanProgress: progress }))
      }
    }, 300)
  }

  const addPrediction = () => {
    if (selectedPrediction && !botConfig.predictions.includes(selectedPrediction)) {
      setBotConfig({
        ...botConfig,
        predictions: [...botConfig.predictions, selectedPrediction],
      })
      setSelectedPrediction("")
    }
  }

  const removePrediction = (pred: string) => {
    setBotConfig({
      ...botConfig,
      predictions: botConfig.predictions.filter((p) => p !== pred),
    })
  }

  const startBot = () => {
    if (botConfig.tradeType && botConfig.predictions.length > 0) {
      setBotRunning(true)
    }
  }

  const getPredictionOptions = () => {
    switch (botConfig.tradeType) {
      case "over-under":
        return ["Over 5-9", "Over 5-6", "Over 7-8", "Over 9", "Under 0-4", "Under 0-1", "Under 2-3", "Under 4"]
      case "even-odd":
        return ["Even", "Odd"]
      case "rise-fall":
        return ["Rise", "Fall"]
      case "matches":
        return ["Digit 0", "Digit 1", "Digit 2", "Digit 3", "Digit 4", "Digit 5", "Digit 6", "Digit 7", "Digit 8", "Digit 9"]
      case "differs":
        return ["Digit 0", "Digit 1", "Digit 2", "Digit 3", "Digit 4", "Digit 5", "Digit 6", "Digit 7", "Digit 8", "Digit 9"]
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Scanner Circle */}
      <Card
        className={`border-2 overflow-hidden ${
          theme === "dark"
            ? "bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/50"
            : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300"
        }`}
      >
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 mb-6">
            {/* Animated Circle */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" style={{ animationDirection: "reverse" }}></div>

            {/* AI Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent`}>
                  AI
                </div>
                <div className={`text-xs font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  SCANNER
                </div>
              </div>
            </div>

            {/* Wave Animation */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <defs>
                <style>{`
                  @keyframes wave {
                    0%, 100% { d: path("M0,50 Q25,30 50,50 T100,50"); }
                    50% { d: path("M0,50 Q25,70 50,50 T100,50"); }
                  }
                  .wave { animation: wave 2s ease-in-out infinite; }
                `}</style>
              </defs>
              <path className="wave" stroke="url(#grad1)" strokeWidth="1" fill="none" opacity="0.6" />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h3 className={`text-lg font-bold text-center mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Market Scanner
          </h3>
          <p className={`text-sm text-center mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Click to scan all markets for optimal trading opportunities
          </p>

          <Button onClick={startScan} disabled={botConfig.isScanning} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            {botConfig.isScanning ? `Scanning... ${Math.round(botConfig.scanProgress)}%` : "Start Scan"}
          </Button>

          {botConfig.isScanning && (
            <div className="mt-4 w-full max-w-xs">
              <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${botConfig.scanProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Bot Configuration */}
      <Card className={`border ${theme === "dark" ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="p-6 space-y-6">
          <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Bot Configuration</h3>

          {/* Bot Name */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Bot Name
            </label>
            <Input
              value={botConfig.name}
              onChange={(e) => setBotConfig({ ...botConfig, name: e.target.value })}
              placeholder="Enter bot name"
              className={theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}
            />
          </div>

          {/* Trade Type Selection */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Trade Type
            </label>
            <Select value={botConfig.tradeType} onValueChange={(value: any) => setBotConfig({ ...botConfig, tradeType: value, predictions: [] })}>
              <SelectTrigger className={theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}>
                <SelectValue placeholder="Select trade type" />
              </SelectTrigger>
              <SelectContent>
                {TRADE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trade Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Stake
              </label>
              <Input
                type="number"
                value={botConfig.stake}
                onChange={(e) => setBotConfig({ ...botConfig, stake: Number(e.target.value) })}
                placeholder="Stake amount"
                className={theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Martingale
              </label>
              <Input
                type="number"
                value={botConfig.martingale}
                onChange={(e) => setBotConfig({ ...botConfig, martingale: Number(e.target.value) })}
                placeholder="Martingale multiplier"
                className={theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Take Profit
              </label>
              <Input
                type="number"
                value={botConfig.takeProfit}
                onChange={(e) => setBotConfig({ ...botConfig, takeProfit: Number(e.target.value) })}
                placeholder="Take profit amount"
                className={theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Stop Loss
              </label>
              <Input
                type="number"
                value={botConfig.stopLoss}
                onChange={(e) => setBotConfig({ ...botConfig, stopLoss: Number(e.target.value) })}
                placeholder="Stop loss amount"
                className={theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}
              />
            </div>
          </div>

          {/* Predictions */}
          {botConfig.tradeType && (
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Predictions (Max 3)
              </label>
              <div className="flex gap-2 mb-3">
                <Select value={selectedPrediction} onValueChange={setSelectedPrediction}>
                  <SelectTrigger className={`flex-1 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}>
                    <SelectValue placeholder="Add prediction" />
                  </SelectTrigger>
                  <SelectContent>
                    {getPredictionOptions().map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addPrediction} disabled={botConfig.predictions.length >= 3} className="bg-green-600 hover:bg-green-700 text-white">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {botConfig.predictions.map((pred) => (
                  <Badge key={pred} className="bg-blue-600 text-white cursor-pointer" onClick={() => removePrediction(pred)}>
                    {pred} ✕
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Multi-Market Scan */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div>
              <h4 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Multi-Market Scan</h4>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Scan all {botConfig.selectedMarkets.length} markets simultaneously
              </p>
            </div>
            <input
              type="checkbox"
              checked={botConfig.multiMarketScan}
              onChange={(e) => setBotConfig({ ...botConfig, multiMarketScan: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Market Statistics */}
      {marketStats.length > 0 && (
        <Card className={`border ${theme === "dark" ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="p-6 space-y-4">
            <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Market Analysis</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketStats.map((market) => (
                <div
                  key={market.symbol}
                  className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}
                >
                  <h4 className={`font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{market.symbol}</h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Even/Odd Balance:</span>
                      <span className={`font-semibold ${market.evenOddBalance > 0 ? "text-green-400" : "text-red-400"}`}>
                        {market.evenOddBalance.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Over/Under Balance:</span>
                      <span className={`font-semibold ${market.overUnderBalance > 0 ? "text-green-400" : "text-red-400"}`}>
                        {market.overUnderBalance.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Hottest (Matches):</span>
                      <span className="font-semibold text-blue-400">Digit {market.matchesHottest}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Coldest (Differs):</span>
                      <span className="font-semibold text-purple-400">Digit {market.differsHottest}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Trend:</span>
                      <span className={`font-semibold flex items-center gap-1 ${market.riseFallBias === "Rise" ? "text-green-400" : "text-red-400"}`}>
                        {market.riseFallBias === "Rise" ? <TrendingUp className="w-4 h-4" /> : "Fall"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Start Bot Button */}
      <div className="flex justify-center">
        <Button
          onClick={startBot}
          disabled={!botConfig.tradeType || botConfig.predictions.length === 0}
          className={`px-8 py-6 text-lg font-bold ${
            botRunning
              ? "bg-red-600 hover:bg-red-700"
              : botConfig.tradeType && botConfig.predictions.length > 0
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50"
                : "bg-gray-600 cursor-not-allowed"
          } text-white`}
        >
          {botRunning ? "Bot Running... Click to Stop" : "Start Bot"}
        </Button>
      </div>

      {botRunning && (
        <Card className="border-2 border-green-500/50 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
          <div className="p-6 flex items-center justify-center gap-3">
            <Circle className="w-3 h-3 bg-green-500 rounded-full animate-pulse fill-green-500" />
            <span className="text-green-400 font-semibold">Bot is actively monitoring markets and executing trades...</span>
          </div>
        </Card>
      )}
    </div>
  )
}
