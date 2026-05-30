export interface SignalData {
  strategy: "even-odd" | "over-under" | "rise-fall" | "differs" | "matches" | "recovery"
  signal: "BUY" | "WAIT" | "STOP"
  confidence: number
  probability: number
  prediction?: string
  suggestedDigits?: number[]
  market: string
  deviation: number
  timestamp: number
  entryPoint?: string
  marketStats?: {
    even: number
    odd: number
    over: number
    under: number
    rise: number
    fall: number
  }
}

export class SignalAnalyzer {
  private lastTicks: number[] = []
  private last15Ticks: number[] = []

  updateTicks(digit: number) {
    this.lastTicks.unshift(digit)
    this.last15Ticks = this.lastTicks.slice(0, 15)
    if (this.lastTicks.length > 1000) {
      this.lastTicks = this.lastTicks.slice(0, 1000)
    }
  }

  private calculateFrequencies(ticks: number[]) {
    const freq: Record<number, number> = {}
    for (let i = 0; i <= 9; i++) {
      freq[i] = ticks.filter((t) => t === i).length
    }
    return freq
  }

  private getDigitStats(ticks: number[]) {
    const freq = this.calculateFrequencies(ticks)
    const sorted = Object.entries(freq)
      .map(([digit, count]) => ({ digit: Number(digit), count, percentage: (count / ticks.length) * 100 }))
      .sort((a, b) => b.percentage - a.percentage)

    return {
      most: sorted[0],
      second: sorted[1],
      least: sorted[sortedLength - 1],
      sorted,
    }
  }

  analyzeEvenOdd(ticks: number[]): SignalData | null {
    if (ticks.length < 20) return null

    const evenCount = ticks.filter((t) => t % 2 === 0).length
    const oddCount = ticks.length - evenCount
    const evenPct = (evenCount / ticks.length) * 100
    const oddPct = (oddCount / ticks.length) * 100
    const deviation = Math.abs(evenPct - oddPct)

    const signal = deviation >= 7 ? "BUY" : "WAIT"
    const dominant = evenPct > oddPct ? "EVEN" : "ODD"

    return {
      strategy: "even-odd",
      signal,
      confidence: Math.min(deviation / 20 * 100, 100),
      probability: Math.max(evenPct, oddPct),
      prediction: dominant,
      market: "",
      deviation,
      timestamp: Date.now(),
      marketStats: {
        even: evenPct,
        odd: oddPct,
        over: 0,
        under: 0,
        rise: 0,
        fall: 0,
      },
    }
  }

  analyzeOverUnder(ticks: number[]): SignalData | null {
    if (ticks.length < 20) return null

    const overCount = ticks.filter((t) => t >= 5).length
    const underCount = ticks.length - overCount
    const overPct = (overCount / ticks.length) * 100
    const underPct = (underCount / ticks.length) * 100
    const deviation = Math.abs(overPct - underPct)

    const signal = deviation >= 7 ? "BUY" : "WAIT"
    const dominant = overPct > underPct ? "OVER" : "UNDER"

    // Get suggested digits based on dominant side
    let suggestedDigits: number[] = []
    if (dominant === "OVER") {
      suggestedDigits = [5, 6, 7, 8, 9].sort((a, b) => {
        const aFreq = ticks.filter((t) => t === a).length
        const bFreq = ticks.filter((t) => t === b).length
        return bFreq - aFreq
      }).slice(0, 3)
    } else {
      suggestedDigits = [0, 1, 2, 3, 4].sort((a, b) => {
        const aFreq = ticks.filter((t) => t === a).length
        const bFreq = ticks.filter((t) => t === b).length
        return bFreq - aFreq
      }).slice(0, 3)
    }

    return {
      strategy: "over-under",
      signal,
      confidence: Math.min(deviation / 20 * 100, 100),
      probability: Math.max(overPct, underPct),
      prediction: dominant,
      suggestedDigits,
      market: "",
      deviation,
      timestamp: Date.now(),
      marketStats: {
        even: 0,
        odd: 0,
        over: overPct,
        under: underPct,
        rise: 0,
        fall: 0,
      },
    }
  }

  analyzeMatches(ticks: number[]): SignalData | null {
    if (ticks.length < 20) return null

    const stats = this.getDigitStats(ticks)
    const hotDigit = stats.most.digit
    const hotPct = stats.most.percentage

    const signal = hotPct > 20 ? "BUY" : "WAIT"
    const confidence = Math.min(hotPct / 25 * 100, 100)

    return {
      strategy: "matches",
      signal,
      confidence,
      probability: hotPct,
      prediction: `Matches ${hotDigit}`,
      suggestedDigits: [hotDigit],
      market: "",
      deviation: hotPct - 10,
      timestamp: Date.now(),
    }
  }

  analyzeDiffers(ticks: number[]): SignalData | null {
    if (ticks.length < 20) return null

    const stats = this.getDigitStats(ticks)
    const coldDigit = stats.least.digit
    const coldPct = stats.least.percentage

    const signal = coldPct < 7 ? "BUY" : "WAIT"
    const confidence = Math.min((10 - coldPct) / 10 * 100, 100)

    return {
      strategy: "differs",
      signal,
      confidence,
      probability: coldPct,
      prediction: `Differs ${coldDigit}`,
      suggestedDigits: [coldDigit],
      market: "",
      deviation: 10 - coldPct,
      timestamp: Date.now(),
    }
  }

  getAllSignals(market: string): SignalData[] {
    const signals: SignalData[] = []

    if (this.lastTicks.length >= 20) {
      const eoSignal = this.analyzeEvenOdd(this.lastTicks)
      const ouSignal = this.analyzeOverUnder(this.lastTicks)
      const matchSignal = this.analyzeMatches(this.lastTicks)
      const diffSignal = this.analyzeDiffers(this.lastTicks)

      if (eoSignal) {
        eoSignal.market = market
        signals.push(eoSignal)
      }
      if (ouSignal) {
        ouSignal.market = market
        signals.push(ouSignal)
      }
      if (matchSignal) {
        matchSignal.market = market
        signals.push(matchSignal)
      }
      if (diffSignal) {
        diffSignal.market = market
        signals.push(diffSignal)
      }
    }

    return signals
  }

  getBestSignal(market: string): SignalData | null {
    const signals = this.getAllSignals(market)
    const buySignals = signals.filter((s) => s.signal === "BUY")

    if (buySignals.length === 0) return null

    return buySignals.reduce((best, current) => {
      return current.confidence > best.confidence ? current : best
    })
  }
}
