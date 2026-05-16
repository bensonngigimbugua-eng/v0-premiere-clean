/**
 * Tick Data Service
 * Handles historical tick data retrieval and caching
 * Supports real-time updates with historical data integration
 */

export interface TickData {
  quote: number
  bid: number
  ask: number
  timestamp: number
}

export interface MarketTickHistory {
  symbol: string
  ticks: TickData[]
  lastUpdate: number
  isLoading: boolean
  error: string | null
}

class TickDataService {
  private tickHistories = new Map<string, MarketTickHistory>()
  private maxHistorySize = 500 // Store last 500 ticks per market
  private updateCallbacks = new Map<string, Function[]>()

  /**
   * Initialize tick history for a market
   */
  initializeMarket(symbol: string): void {
    if (!this.tickHistories.has(symbol)) {
      this.tickHistories.set(symbol, {
        symbol,
        ticks: [],
        lastUpdate: Date.now(),
        isLoading: false,
        error: null,
      })
    }
  }

  /**
   * Add a new tick to history
   */
  addTick(symbol: string, tick: TickData): void {
    const history = this.tickHistories.get(symbol)
    if (!history) {
      this.initializeMarket(symbol)
      return this.addTick(symbol, tick)
    }

    history.ticks.push(tick)
    history.lastUpdate = Date.now()

    // Keep only recent ticks
    if (history.ticks.length > this.maxHistorySize) {
      history.ticks = history.ticks.slice(-this.maxHistorySize)
    }

    // Trigger callbacks
    this.notifySubscribers(symbol)
  }

  /**
   * Get tick history for a market
   */
  getHistory(symbol: string): TickData[] {
    const history = this.tickHistories.get(symbol)
    return history?.ticks || []
  }

  /**
   * Get recent N ticks
   */
  getRecentTicks(symbol: string, count: number = 100): TickData[] {
    const history = this.getHistory(symbol)
    return history.slice(-count)
  }

  /**
   * Calculate statistics from history
   */
  getStatistics(symbol: string, count: number = 100) {
    const ticks = this.getRecentTicks(symbol, count)
    if (ticks.length === 0) {
      return {
        count: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        volatility: 0,
      }
    }

    const prices = ticks.map(t => t.quote)
    const average = prices.reduce((a, b) => a + b, 0) / prices.length
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / prices.length
    const volatility = Math.sqrt(variance)

    return {
      count: ticks.length,
      averagePrice: average,
      minPrice: min,
      maxPrice: max,
      volatility: volatility,
    }
  }

  /**
   * Get last tick
   */
  getLastTick(symbol: string): TickData | null {
    const history = this.getHistory(symbol)
    return history.length > 0 ? history[history.length - 1] : null
  }

  /**
   * Subscribe to tick updates
   */
  subscribe(symbol: string, callback: Function): () => void {
    if (!this.updateCallbacks.has(symbol)) {
      this.updateCallbacks.set(symbol, [])
    }
    this.updateCallbacks.get(symbol)!.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.updateCallbacks.get(symbol)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(symbol: string): void {
    const callbacks = this.updateCallbacks.get(symbol)
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb()
        } catch (error) {
          console.error(`[v0] Error in tick callback for ${symbol}:`, error)
        }
      })
    }
  }

  /**
   * Load historical ticks from Deriv API
   */
  async loadHistoricalTicks(symbol: string, count: number = 100): Promise<void> {
    const history = this.tickHistories.get(symbol)
    if (!history) {
      this.initializeMarket(symbol)
      return this.loadHistoricalTicks(symbol, count)
    }

    history.isLoading = true
    history.error = null

    try {
      // Ticks are loaded through WebSocket in real-time
      // This method can be extended to load from API if needed
      console.log(`[v0] Tick history initialized for ${symbol}`)
    } catch (error) {
      history.error = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[v0] Error loading ticks for ${symbol}:`, error)
    } finally {
      history.isLoading = false
    }
  }

  /**
   * Clear history for a market
   */
  clearHistory(symbol: string): void {
    const history = this.tickHistories.get(symbol)
    if (history) {
      history.ticks = []
      history.lastUpdate = Date.now()
    }
  }

  /**
   * Get all initialized markets
   */
  getMarkets(): string[] {
    return Array.from(this.tickHistories.keys())
  }
}

// Export singleton instance
export const tickDataService = new TickDataService()
