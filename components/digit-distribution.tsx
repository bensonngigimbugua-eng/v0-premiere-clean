"use client"

interface DigitDistributionProps {
  frequencies: Record<number, { count: number; percentage: number }>
  currentDigit: number | null
  theme: "light" | "dark"
}

export function DigitDistribution({ frequencies, currentDigit, theme }: DigitDistributionProps) {
  // Split digits into two rows: 0-4 and 5-9
  const row1Digits = [0, 1, 2, 3, 4]
  const row2Digits = [5, 6, 7, 8, 9]

  const getMaxPercentage = () => {
    return Math.max(...Object.values(frequencies).map((f) => f.percentage))
  }

  const maxPercentage = getMaxPercentage()

  const getSortedDigits = () => {
    const digitsWithFreq = Object.entries(frequencies).map(([digit, freq]) => ({
      digit: Number.parseInt(digit),
      ...freq,
    }))
    return digitsWithFreq.sort((a, b) => b.count - a.count)
  }

  const sortedDigits = getSortedDigits()
  const mostAppearing = sortedDigits[0]?.digit
  const secondMostAppearing = sortedDigits[1]?.digit
  const leastAppearing = sortedDigits[sortedDigits.length - 1]?.digit

  const getCircleColor = (digit: number) => {
    if (currentDigit === digit) {
      return theme === "dark"
        ? "bg-purple-500 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.8)] ring-4 ring-purple-500/30"
        : "bg-purple-500 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.6)] ring-4 ring-purple-400/30"
    }
    if (digit === mostAppearing) {
      return theme === "dark"
        ? "bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)]"
        : "bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
    }
    if (digit === secondMostAppearing) {
      return theme === "dark"
        ? "bg-yellow-500 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.6)]"
        : "bg-yellow-500 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
    }
    if (digit === leastAppearing) {
      return theme === "dark"
        ? "bg-red-500 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]"
        : "bg-red-500 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
    }
    // Default color for other digits
    return theme === "dark" ? "bg-blue-500/50 border-blue-400/50" : "bg-blue-400/50 border-blue-300/50"
  }

  const renderDigitCircle = (digit: number) => {
    const freq = frequencies[digit] || { count: 0, percentage: 0 }
    const isCurrentDigit = currentDigit === digit
    const circleColor = getCircleColor(digit)

    return (
      <div key={digit} className="flex flex-col items-center gap-3 relative">
        {isCurrentDigit && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className={`text-2xl ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>↓</div>
          </div>
        )}

        <div className="relative flex items-center justify-center">
          <div
            className={`
              rounded-full border-4 flex flex-col items-center justify-center
              transition-all duration-500 ease-out
              ${circleColor}
              ${isCurrentDigit ? "scale-110 animate-pulse" : "hover:scale-105"}
            `}
            style={{
              width: `${60 + freq.percentage * 0.8}px`,
              height: `${60 + freq.percentage * 0.8}px`,
              minWidth: "60px",
              minHeight: "60px",
              maxWidth: "120px",
              maxHeight: "120px",
            }}
          >
            <div className="text-white font-bold text-2xl">{digit}</div>
            <div className="text-white text-xs font-semibold">{freq.percentage.toFixed(1)}%</div>
          </div>
        </div>

        <div
          className={`text-center ${
            isCurrentDigit
              ? theme === "dark"
                ? "text-purple-400 font-bold"
                : "text-purple-600 font-bold"
              : theme === "dark"
                ? "text-gray-300"
                : "text-gray-700"
          }`}
        >
          <div className="text-xs opacity-75">Count: {freq.count}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-400"></div>
          <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Most Appearing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-400"></div>
          <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>2nd Most</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-400"></div>
          <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Least Appearing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-purple-400"></div>
          <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Live Digit</span>
        </div>
      </div>

      {/* Row 1: Digits 0-4 */}
      <div>
        <h4
          className={`text-sm font-semibold mb-4 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          Digits 0-4
        </h4>
        <div className="grid grid-cols-5 gap-2 sm:gap-4">{row1Digits.map(renderDigitCircle)}</div>
      </div>

      {/* Row 2: Digits 5-9 */}
      <div>
        <h4
          className={`text-sm font-semibold mb-4 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          Digits 5-9
        </h4>
        <div className="grid grid-cols-5 gap-2 sm:gap-4">{row2Digits.map(renderDigitCircle)}</div>
      </div>
    </div>
  )
}
