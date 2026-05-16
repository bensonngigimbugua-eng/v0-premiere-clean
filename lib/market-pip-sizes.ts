/**
 * Market Pip Size Configuration for Deriv Markets
 * Pip size = smallest price movement unit for each market
 */

export interface MarketConfig {
  symbol: string
  name: string
  category: "volatility" | "crypto" | "forex" | "commodities" | "indices"
  pipSize: number
  minPipValue: number
  decimalPlaces: number
  tickInterval: number // in seconds
  minStake: number
  maxStake: number
}

export const MARKET_PIP_SIZES: Record<string, MarketConfig> = {
  // Volatility Indices (R_X) - 5 decimal places, pip = 0.00001
  R_10: {
    symbol: "R_10",
    name: "Volatility 10 (1s)",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  R_25: {
    symbol: "R_25",
    name: "Volatility 25 (1s)",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  R_50: {
    symbol: "R_50",
    name: "Volatility 50 (1s)",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  R_75: {
    symbol: "R_75",
    name: "Volatility 75 (1s)",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  R_100: {
    symbol: "R_100",
    name: "Volatility 100 (1s)",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  // Volatility Indices (1HZ_X_V) - 5 decimal places, pip = 0.00001
  "1HZ10V": {
    symbol: "1HZ10V",
    name: "Volatility 10 Index",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  "1HZ25V": {
    symbol: "1HZ25V",
    name: "Volatility 25 Index",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  "1HZ50V": {
    symbol: "1HZ50V",
    name: "Volatility 50 Index",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  "1HZ75V": {
    symbol: "1HZ75V",
    name: "Volatility 75 Index",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  "1HZ100V": {
    symbol: "1HZ100V",
    name: "Volatility 100 Index",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  "1HZ15V": {
    symbol: "1HZ15V",
    name: "Volatility 15 (1s) Index",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  "1HZ30V": {
    symbol: "1HZ30V",
    name: "Volatility 30 (1s) Index",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
  "1HZ90V": {
    symbol: "1HZ90V",
    name: "Volatility 90 (1s) Index",
    category: "volatility",
    pipSize: 0.00001,
    minPipValue: 0.00001,
    decimalPlaces: 5,
    tickInterval: 1,
    minStake: 1,
    maxStake: 10000,
  },
}

/**
 * Get market configuration by symbol
 */
export function getMarketConfig(symbol: string): MarketConfig | undefined {
  return MARKET_PIP_SIZES[symbol]
}

/**
 * Get pip value in currency
 */
export function getPipValue(symbol: string, baseValue: number = 1): number {
  const config = getMarketConfig(symbol)
  return config ? config.pipSize * baseValue : 0.00001
}

/**
 * Extract last digit from price based on market's decimal places
 */
export function extractLastDigitFromPrice(price: number, decimalPlaces: number = 5): number {
  const priceStr = price.toFixed(decimalPlaces).replace(".", "")
  const lastChar = priceStr[priceStr.length - 1]
  const digit = parseInt(lastChar, 10)
  return isNaN(digit) ? 0 : digit
}

/**
 * Format price based on market's decimal places
 */
export function formatPriceForMarket(price: number, symbol: string): string {
  const config = getMarketConfig(symbol)
  const decimalPlaces = config?.decimalPlaces || 5
  return price.toFixed(decimalPlaces)
}

/**
 * Calculate number of pips between two prices
 */
export function calculatePipDifference(symbol: string, price1: number, price2: number): number {
  const config = getMarketConfig(symbol)
  if (!config) return 0
  const diff = Math.abs(price1 - price2)
  return Math.round(diff / config.pipSize)
}

/**
 * Get all markets grouped by category
 */
export function getMarketsByCategory(
  category: "volatility" | "crypto" | "forex" | "commodities" | "indices"
): MarketConfig[] {
  return Object.values(MARKET_PIP_SIZES).filter((m) => m.category === category)
}

/**
 * Get all available market symbols
 */
export function getAllMarketSymbols(): string[] {
  return Object.keys(MARKET_PIP_SIZES)
}
